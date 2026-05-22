# Phase 03: Text Chunking Service

## Context Links

- `../plan.md` - Plan overview
- `../research/text-chunking-research.md` - Research findings

## Overview

- **Priority:** High
- **Current status:** Pending
- **Brief description:** Implement recursive character text splitter with token-based sizing, overlap, and deduplication.

## Requirements

### Functional
- Split text into 500-token chunks (target size)
- Recursive separator: `\n\n` → `\n` → sentence → word
- 100-token overlap (20%) between consecutive chunks
- Track page_label from extraction results
- Generate content hash for deduplication

### Non-Functional
- Keep under 200 lines per file
- Token counting via approximation or tiktoken

## Related Code Files

### New Files to Create
- `backend/internal/infrastructure/chunker/tokenizer.go` - Token counting
- `backend/internal/infrastructure/chunker/splitter.go` - Core splitting logic
- `backend/internal/infrastructure/chunker/chunker.go` - High-level API

## Implementation Steps

### 1. Tokenizer
```go
// internal/infrastructure/chunker/tokenizer.go
package chunker

// countTokens approximates token count.
// For English text, ~4 chars per token is a reasonable approximation.
func countTokens(text string) int {
    return len(text) / 4
}

// countTokensTiktoken uses tiktoken for accurate counting.
func countTokensTiktoken(text string) int {
    // Requires: go install github.com/tiktoken-go/tiktoken
    bpe, err := tiktoken.EncodingForModel("gpt-4")
    if err != nil {
        return countTokens(text) // fallback
    }
    tokens := bpe.Encode(text, nil, nil)
    return len(tokens)
}
```

### 2. Splitter
```go
// internal/infrastructure/chunker/splitter.go
package chunker

import (
    "strings"
)

const (
    DefaultChunkSize    = 500  // tokens
    DefaultChunkOverlap = 100  // tokens
    MaxChunkSize        = 800  // tokens
    MinChunkSize        = 100 // tokens - discard smaller
)

var defaultSeparators = []string{"\n\n", "\n", ". ", " "}

type Chunk struct {
    Content   string
    PageLabel string
    StartIdx  int // character offset in original text
    EndIdx    int
    Hash      string
}

type Splitter struct {
    chunkSize    int
    chunkOverlap int
    separators   []string
}

func NewSplitter(chunkSize, chunkOverlap int) *Splitter {
    if chunkSize <= 0 {
        chunkSize = DefaultChunkSize
    }
    if chunkOverlap <= 0 {
        chunkOverlap = DefaultChunkOverlap
    }
    return &Splitter{
        chunkSize:    chunkSize,
        chunkOverlap: chunkOverlap,
        separators:   defaultSeparators,
    }
}

func (s *Splitter) Split(text string, pageLabel string) []Chunk {
    // 1. Split into sections by paragraph
    sections := strings.Split(text, "\n\n")

    var chunks []Chunk
    var current strings.Builder
    currentTokens := 0
    startIdx := 0

    for _, section := range sections {
        sectionTokens := countTokens(section)

        // If single section exceeds max, recursively split it
        if sectionTokens > MaxChunkSize {
            // Finalize current chunk first
            if current.Len() > 0 {
                chunk := s.finalizeChunk(&current, currentTokens, startIdx, pageLabel)
                if chunk != nil {
                    chunks = append(chunks, *chunk)
                }
                // Start new with overlap
                overlapText := s.getOverlapText(current.String())
                current.Reset()
                current.WriteString(overlapText)
                currentTokens = countTokens(overlapText)
                startIdx = len(text) - len(overlapText)
            }
            // Recursively split large section
            subChunks := s.splitRecursive(section, pageLabel, 0)
            chunks = append(chunks, subChunks...)
            continue
        }

        // Would adding this section exceed chunk size?
        if currentTokens+sectionTokens > s.chunkSize && currentTokens > 0 {
            // Save current chunk
            chunk := s.finalizeChunk(&current, currentTokens, startIdx, pageLabel)
            if chunk != nil {
                chunks = append(chunks, *chunk)
            }

            // Start new with overlap
            overlapText := s.getOverlapText(current.String())
            current.Reset()
            current.WriteString(overlapText)
            currentTokens = countTokens(overlapText)
            startIdx = len(text) - len(overlapText)
        }

        current.WriteString(section)
        current.WriteString("\n\n")
        currentTokens += sectionTokens
    }

    // Don't forget the last chunk
    if current.Len() > 0 {
        chunk := s.finalizeChunk(&current, currentTokens, startIdx, pageLabel)
        if chunk != nil {
            chunks = append(chunks, *chunk)
        }
    }

    return chunks
}

func (s *Splitter) splitRecursive(text string, pageLabel string, separatorIdx int) []Chunk {
    if separatorIdx >= len(s.separators) {
        // At word level, just truncate
        if countTokens(text) <= MaxChunkSize {
            return []Chunk{{
                Content:   text,
                PageLabel: pageLabel,
                StartIdx:  0,
                EndIdx:    len(text),
                Hash:      contentHash(text),
            }}
        }
        // Truncate to max
        return []Chunk{{
            Content:   text[:len(text)*MaxChunkSize/countTokens(text)],
            PageLabel: pageLabel,
            StartIdx:  0,
            EndIdx:    len(text),
            Hash:      contentHash(text),
        }}
    }

    parts := strings.Split(text, s.separators[separatorIdx])
    var chunks []Chunk
    var current strings.Builder
    currentTokens := 0

    for i, part := range parts {
        partTokens := countTokens(part)

        if currentTokens+partTokens > s.chunkSize && currentTokens > 0 {
            chunk := s.finalizeChunk(&current, currentTokens, 0, pageLabel)
            if chunk != nil {
                chunks = append(chunks, *chunk)
            }
            current.Reset()
            currentTokens = 0
        }

        separator := s.separators[separatorIdx]
        current.WriteString(part)
        if i < len(parts)-1 {
            current.WriteString(separator)
        }
        currentTokens += partTokens
    }

    if current.Len() > 0 {
        chunk := s.finalizeChunk(&current, currentTokens, 0, pageLabel)
        if chunk != nil {
            chunks = append(chunks, *chunk)
        }
    }

    return chunks
}

func (s *Splitter) finalizeChunk(sb *strings.Builder, tokens, startIdx int, pageLabel string) *Chunk {
    content := sb.String()
    if countTokens(content) < MinChunkSize {
        return nil
    }
    return &Chunk{
        Content:   content,
        PageLabel: pageLabel,
        StartIdx:  startIdx,
        EndIdx:    startIdx + len(content),
        Hash:      contentHash(content),
    }
}

func (s *Splitter) getOverlapText(text string) string {
    // Get last N tokens worth of text for overlap
    // Simplified: just return last ~overlap_chars
    chars := s.chunkOverlap * 4 // approximation
    if len(text) <= chars {
        return text
    }
    return text[len(text)-chars:]
}

func contentHash(text string) string {
    normalized := strings.ToLower(strings.TrimSpace(text))
    h := sha256.Sum256([]byte(normalized))
    return fmt.Sprintf("%x", h)
}
```

## Success Criteria

- [ ] Chunks respect 500-token target size
- [ ] Recursive splitting via separator hierarchy
- [ ] Overlap maintains context across boundaries
- [ ] Page labels preserved per chunk
- [ ] Content hash generated for deduplication
- [ ] Small chunks (< 100 tokens) discarded

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Token count inaccuracy | tiktoken fallback from approximation |
| Very long words/sections | Recursive word-level split as last resort |
| Duplicate content | Hash-based deduplication at ingestion |

## Next Steps

→ Phase 04: Gemini Embedding Client