# Research: Text Chunking Strategies for RAG

## 1. Chunking Strategies Overview

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| **Fixed-Size** | Split by character/token count | Simple, predictable | May split mid-sentence |
| **Recursive Character** | Split on separators (paragraphs, sentences, words) | Respects natural boundaries | Still size-based |
| **Semantic** | Group sentences by embedding similarity | Coherent chunks | Computationally heavier |
| **Chapter/Section-based** | Split by document structure | Natural topic boundaries | Uneven chunk sizes |

**Recommendation:** **Recursive separator splitting** (paragraphs → sentences → words)

## 2. Chunk Size

| Use Case | Recommended Size |
|---------|------------------|
| Q&A with precise citations | 200-500 tokens |
| Summarization | 500-1000 tokens |
| General purpose | 500-800 tokens |

**Recommendation for SWD392:** Target **500 tokens** with **100 token overlap** (20%)

## 3. Token Counting in Go

Approximation: `len(text) / 4` characters per token for English text.

For accurate counting, use `go-tiktoken`:
```go
import "github.com/tiktoken-go/tiktoken"

func countTokens(text string) int {
    bpe, _ := tiktoken.EncodingForModel("gpt-4")
    tokens := bpe.Encode(text, nil, nil)
    return len(tokens)
}
```

## 4. Overlap Strategy

```go
const (
    ChunkSize          = 500    // tokens
    ChunkOverlap       = 100    // tokens (20% overlap)
    MinChunkSize       = 100    // discard smaller
    MaxChunkSize       = 800    // allow slight overflow
)
```

Overlap helps maintain context across chunk boundaries but creates duplicate embeddings.

## 5. Page/Slide References

Store metadata for citations:
```go
type ChunkMetadata struct {
    PageLabel   string `json:"page_label,omitempty"`  // "p. 78" or "Slide 12"
    StartIndex  int    `json:"start_index,omitempty"` // char offset in source
    EndIndex    int    `json:"end_index,omitempty"`
}
```

## 6. Special Content Handling

### Tables
- Keep tables intact or transform to markdown
- Tables exceeding chunk size should be extracted as separate chunks with caption

### Code Blocks
- Language-aware splitting (split on `func`, `class`, etc.)
- Preserve indentation

### Headers
- Detect header patterns (`#`, `##`, `**bold**`)
- Include header context in chunk metadata

## 7. Chunk Deduplication

Track content hash to avoid duplicate embeddings:
```go
import "crypto/sha256"

func contentHash(text string) string {
    normalized := strings.ToLower(strings.TrimSpace(text))
    hash := sha256.Sum256([]byte(normalized))
    return fmt.Sprintf("%x", hash)
}
```

## 8. Recommended Chunking Algorithm

```
1. Parse document into pages/sections with page_label metadata
2. For each page:
   a. Recursively split by \n\n (paragraphs)
   b. If chunk > MaxChunkSize, split by \n
   c. If still > MaxChunkSize, split by sentences (. ! ?)
   d. If still > MaxChunkSize, split by words
3. Apply overlap by carrying forward tail tokens
4. Validate each chunk against token limits
5. Track start/end indices for citation
6. Generate content hash for deduplication
```

## Summary Recommendations

| Aspect | Recommendation |
|--------|----------------|
| **Chunking Strategy** | Recursive separator splitting |
| **Chunk Size** | 500 tokens target, 100-800 range |
| **Overlap** | 100 tokens (20%) |
| **Page References** | Store `page_label`, `start_index`, `end_index` |
| **Deduplication** | SHA-256 hash during ingestion |