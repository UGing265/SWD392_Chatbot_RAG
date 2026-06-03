package embedding

import (
	"context"
	"time"
)

// EmbeddingClient defines the interface for embedding operations
type EmbeddingClient interface {
	// Embed generates a single embedding vector (768 dimensions)
	Embed(ctx context.Context, text string) ([]float32, error)

	// EmbedBatch generates embeddings for multiple texts (up to 100 per request)
	// Returns a slice of embedding vectors, each with 768 dimensions
	EmbedBatch(ctx context.Context, texts []string) ([][]float32, error)
}

// NewEmbeddingClient creates a new embedding client using Gemini
// Requires a valid API key from environment variable GEMINI_API_KEY
func NewEmbeddingClient(apiKey string) EmbeddingClient {
	return NewGeminiEmbeddingClient(apiKey)
}

// NewEmbeddingClientWithConfig creates a client with custom configuration
func NewEmbeddingClientWithConfig(apiKey, baseURL, model string, timeoutSeconds int, maxRetries, maxConcurrent int) EmbeddingClient {
	return NewGeminiEmbeddingClientWithConfig(
		apiKey,
		baseURL,
		model,
		defaultTimeout(timeoutSeconds),
		maxRetries,
		maxConcurrent,
	)
}

func defaultTimeout(seconds int) time.Duration {
	if seconds <= 0 {
		return 30 * time.Second
	}
	return time.Duration(seconds) * time.Second
}