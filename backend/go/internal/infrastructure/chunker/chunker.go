package chunker

// Chunker defines the interface for text chunking operations.
type Chunker interface {
	ChunkText(text string, pageLabel string) []Chunk
}

// TextChunker implements Chunker interface using recursive character splitting.
type TextChunker struct {
	splitter *Splitter
}

// NewTextChunker creates a new TextChunker with the specified chunk size and overlap.
// chunkSize: target size in tokens (default 500)
// overlap: overlap between chunks in tokens (default 100)
func NewTextChunker(chunkSize, overlap int) *TextChunker {
	return &TextChunker{
		splitter: NewSplitter(chunkSize, overlap),
	}
}

// ChunkText splits the input text into chunks with the configured size and overlap.
// Each chunk preserves the pageLabel and includes metadata for deduplication.
func (c *TextChunker) ChunkText(text string, pageLabel string) []Chunk {
	if text == "" {
		return nil
	}
	return c.splitter.Split(text, pageLabel)
}
