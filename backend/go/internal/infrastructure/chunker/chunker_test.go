package chunker

import (
	"strings"
	"testing"
)

func TestCountTokens(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		expected int
	}{
		{"empty string", "", 0},
		{"short text", "hello world", 2}, // 11 chars / 4 = 2
		{"400 chars = ~100 tokens", strings.Repeat("a", 400), 100},
		{"2000 chars = ~500 tokens", strings.Repeat("a", 2000), 500},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := countTokens(tt.text)
			if result != tt.expected {
				t.Errorf("countTokens(%q) = %d, want %d", tt.text, result, tt.expected)
			}
		})
	}
}

func TestNewSplitter(t *testing.T) {
	s := NewSplitter(0, 0)
	if s.chunkSize != DefaultChunkSize {
		t.Errorf("expected default chunk size %d, got %d", DefaultChunkSize, s.chunkSize)
	}
	if s.chunkOverlap != DefaultChunkOverlap {
		t.Errorf("expected default overlap %d, got %d", DefaultChunkOverlap, s.chunkOverlap)
	}
}

func TestNewSplitter_OverlapCapped(t *testing.T) {
	// Overlap should be capped at 20% of chunk size
	// For chunkSize=500, 20% = 100
	s := NewSplitter(500, 400)
	if s.chunkOverlap != 100 {
		t.Errorf("expected overlap capped to %d, got %d", 100, s.chunkOverlap)
	}
}

func TestSplitter_Split(t *testing.T) {
	s := NewSplitter(500, 100)

	// Create text with ~600 tokens (above MinChunkSize of 100)
	text := strings.Repeat("This is a sample sentence. ", 100) // ~600 tokens
	chunks := s.Split(text, "p.1")

	if len(chunks) == 0 {
		t.Error("expected at least one chunk")
	}

	// Check that chunks have required fields
	for _, chunk := range chunks {
		if chunk.Content == "" {
			t.Error("chunk content should not be empty")
		}
		if chunk.PageLabel != "p.1" {
			t.Errorf("expected page label 'p.1', got '%s'", chunk.PageLabel)
		}
		if chunk.Hash == "" {
			t.Error("chunk hash should not be empty")
		}
	}
}

func TestSplitter_SplitEmpty(t *testing.T) {
	s := NewSplitter(500, 100)

	chunks := s.Split("", "p.1")
	if chunks != nil {
		t.Error("expected nil for empty text")
	}
}

func TestContentHash(t *testing.T) {
	hash1 := contentHash("Hello World")
	hash2 := contentHash("hello world") // lowercase - should be same due to normalization
	hash3 := contentHash("Hello World")
	hash4 := contentHash("Different text")

	if hash1 != hash3 {
		t.Error("same text should produce same hash")
	}
	// Hash is case-insensitive due to ToLower normalization
	if hash1 != hash2 {
		t.Error("case-insensitive: 'Hello World' should equal 'hello world'")
	}
	if hash1 == hash4 {
		t.Error("different text should produce different hash")
	}
}

func TestSplitter_LargeText(t *testing.T) {
	s := NewSplitter(500, 100)

	// Create a large text (roughly 2000 tokens)
	largeText := strings.Repeat("Paragraph. This is some sample text that will be used for chunking. It contains multiple sentences. ", 50)

	chunks := s.Split(largeText, "p.1")

	if len(chunks) < 2 {
		t.Errorf("expected multiple chunks for large text, got %d", len(chunks))
	}

	// Verify chunk sizes are within bounds
	for _, chunk := range chunks {
		tokens := countTokens(chunk.Content)
		if tokens > MaxChunkSize {
			t.Errorf("chunk token count %d exceeds max %d", tokens, MaxChunkSize)
		}
	}
}

func TestSplitter_RecursiveSeparators(t *testing.T) {
	s := NewSplitter(500, 100)

	// Test with multiple paragraph breaks
	text := strings.Repeat("First paragraph. Second sentence. Third sentence.\n\n", 50)
	chunks := s.Split(text, "p.1")

	if len(chunks) == 0 {
		t.Error("expected at least one chunk")
	}

	// Check that text is being split
	for _, chunk := range chunks {
		if len(chunk.Content) > 0 {
			t.Logf("Chunk: %d chars, %d tokens", len(chunk.Content), countTokens(chunk.Content))
		}
	}
}

func TestTextChunker_Interface(t *testing.T) {
	var _ Chunker = (*TextChunker)(nil)
}

func TestNewTextChunker(t *testing.T) {
	tc := NewTextChunker(500, 100)
	if tc == nil {
		t.Error("NewTextChunker should not return nil")
	}
	if tc.splitter == nil {
		t.Error("splitter should not be nil")
	}
}

func TestTextChunker_ChunkText(t *testing.T) {
	tc := NewTextChunker(500, 100)

	// Create text large enough to chunk
	text := strings.Repeat("This is a sample sentence. ", 100)
	chunks := tc.ChunkText(text, "p.1")

	if len(chunks) == 0 {
		t.Error("expected at least one chunk")
	}

	// All chunks should have the same page label
	for _, chunk := range chunks {
		if chunk.PageLabel != "p.1" {
			t.Errorf("expected page label 'p.1', got '%s'", chunk.PageLabel)
		}
	}
}

func TestTextChunker_EmptyText(t *testing.T) {
	tc := NewTextChunker(500, 100)

	chunks := tc.ChunkText("", "p.1")
	if chunks != nil {
		t.Error("expected nil for empty text")
	}
}

func TestChunk_HashUnique(t *testing.T) {
	s := NewSplitter(500, 100)

	text := "This is a unique chunk of text for testing."
	chunk := s.makeChunk(text, 0, "p.1")

	// Same text should produce same hash
	hash2 := contentHash(text)
	if chunk.Hash != hash2 {
		t.Errorf("hash mismatch: %s != %s", chunk.Hash, hash2)
	}
}

func TestChunk_ContentDeduplication(t *testing.T) {
	s := NewSplitter(500, 100)

	text := strings.Repeat("Sample text for deduplication testing. ", 50)
	chunks := s.Split(text, "p.1")

	// Check for duplicate hashes (would indicate duplicate content)
	hashes := make(map[string]bool)
	for _, chunk := range chunks {
		if hashes[chunk.Hash] {
			t.Logf("Duplicate hash detected for chunk: %s", chunk.Content[:50])
		}
		hashes[chunk.Hash] = true
	}
}