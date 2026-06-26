package chunker

import (
	"strings"
)

const (
	DefaultChunkSize    = 500 // tokens
	DefaultChunkOverlap = 100 // tokens
	MaxChunkSize        = 800 // tokens
	MinChunkSize        = 1   // tokens - discard smaller chunks
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
	// Cap overlap at 20% of chunk size
	maxOverlap := chunkSize / 5
	if chunkOverlap > maxOverlap {
		chunkOverlap = maxOverlap
	}
	return &Splitter{
		chunkSize:    chunkSize,
		chunkOverlap: chunkOverlap,
		separators:   defaultSeparators,
	}
}

func (s *Splitter) Split(text string, pageLabel string) []Chunk {
	if text == "" {
		return nil
	}
	return s.splitWithSeparators(text, pageLabel, 0)
}

// splitWithSeparators uses recursive approach: split by current separator,
// if any part is too large, recursively split that part with next separator.
func (s *Splitter) splitWithSeparators(text string, pageLabel string, separatorIdx int) []Chunk {
	if text == "" {
		return nil
	}

	separator := s.separators[separatorIdx]

	// Base case: word-level separator - use direct chunking logic
	if separatorIdx >= len(s.separators)-1 {
		return s.chunkText(text, pageLabel, separator)
	}

	parts := strings.Split(text, separator)
	var result []Chunk
	var current strings.Builder
	var currentTokens int
	var currentStartIdx int

	for _, part := range parts {
		if part == "" {
			continue
		}

		partTokens := countTokens(part)

		// If this part itself exceeds chunk size, flush current and recurse
		if partTokens > s.chunkSize {
			// Flush any accumulated content
			if currentTokens >= MinChunkSize {
				result = append(result, s.makeChunk(current.String(), currentStartIdx, pageLabel))
			}
			current.Reset()
			currentTokens = 0

			// Recursively split the large part
			subChunks := s.splitWithSeparators(part, pageLabel, separatorIdx+1)
			result = append(result, subChunks...)
			continue
		}

		// Check if adding this part would exceed chunk size
		if current.Len() > 0 && currentTokens+partTokens > s.chunkSize {
			// Finalize current chunk
			if currentTokens >= MinChunkSize {
				result = append(result, s.makeChunk(current.String(), currentStartIdx, pageLabel))
			}

			// Start new chunk with overlap from previous
			overlapText := s.getOverlapText(current.String())
			current.Reset()
			current.WriteString(overlapText)
			currentStartIdx = strings.Index(text, overlapText)
			if currentStartIdx < 0 {
				currentStartIdx = 0
			}
			currentTokens = countTokens(overlapText)
		}

		// Add separator between parts (except first)
		if current.Len() > 0 {
			current.WriteString(separator)
		}
		current.WriteString(part)
		currentTokens = countTokens(current.String())

	}

	// Handle remaining content that wasn't flushed
	if currentTokens >= MinChunkSize && current.Len() > 0 {
		result = append(result, s.makeChunk(current.String(), currentStartIdx, pageLabel))
	}

	// Add overlap between consecutive chunks
	return s.applyOverlap(result)
}

// chunkText splits text at word level (final separator level)
func (s *Splitter) chunkText(text string, pageLabel string, separator string) []Chunk {
	parts := strings.Split(text, separator)
	var result []Chunk
	var current strings.Builder
	var currentTokens int
	var currentStartIdx int

	for _, part := range parts {
		if part == "" {
			continue
		}

		partTokens := countTokens(part)

		// Check if adding this part would exceed chunk size
		if current.Len() > 0 && currentTokens+partTokens > s.chunkSize {
			// Finalize current chunk
			if currentTokens >= MinChunkSize {
				result = append(result, s.makeChunk(current.String(), currentStartIdx, pageLabel))
			}

			// Start new chunk with overlap
			overlapText := s.getOverlapText(current.String())
			current.Reset()
			current.WriteString(overlapText)
			currentStartIdx = strings.Index(text, overlapText)
			if currentStartIdx < 0 {
				currentStartIdx = 0
			}
			currentTokens = countTokens(overlapText)
		}

		// Add separator between parts (except first)
		if current.Len() > 0 {
			current.WriteString(separator)
		}
		current.WriteString(part)
		currentTokens = countTokens(current.String())

	}

	// Handle any remaining content
	if currentTokens >= MinChunkSize && current.Len() > 0 {
		result = append(result, s.makeChunk(current.String(), currentStartIdx, pageLabel))
	}

	return result
}
