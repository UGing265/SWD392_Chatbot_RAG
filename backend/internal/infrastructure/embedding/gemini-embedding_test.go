package embedding

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPreprocessText(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "normal text",
			input:    "Hello world",
			expected: "Hello world",
		},
		{
			name:     "multiple spaces normalized",
			input:    "Hello   world",
			expected: "Hello world",
		},
		{
			name:     "tabs and newlines",
			input:    "Hello\t\nworld",
			expected: "Hello world",
		},
		{
			name:     "leading and trailing spaces",
			input:    "  Hello world  ",
			expected: "Hello world",
		},
		{
			name:     "text over 32000 chars truncated",
			input:    string(make([]byte, 35000)),
			expected: string(make([]byte, 32000)),
		},
		{
			name:     "empty string",
			input:    "",
			expected: "",
		},
		{
			name:     "whitespace only",
			input:    "   \t\n  ",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := preprocessText(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestNewGeminiEmbeddingClient(t *testing.T) {
	client := NewGeminiEmbeddingClient("test-api-key")
	require.NotNil(t, client)
	assert.Equal(t, "test-api-key", client.apiKey)
	assert.Equal(t, 3, client.maxRetries)
	assert.Equal(t, 30*time.Second, client.client.Timeout)
}

func TestNewGeminiEmbeddingClientWithConfig(t *testing.T) {
	client := NewGeminiEmbeddingClientWithConfig(
		"test-api-key",
		"https://custom.api.com",
		"models/custom-model",
		60*time.Second,
		5,
		20,
	)
	require.NotNil(t, client)
	assert.Equal(t, "test-api-key", client.apiKey)
	assert.Equal(t, "https://custom.api.com", client.baseURL)
	assert.Equal(t, "models/custom-model", client.model)
	assert.Equal(t, 60*time.Second, client.client.Timeout)
	assert.Equal(t, 5, client.maxRetries)
	assert.Equal(t, 20, client.maxConcurrent)
}

func TestNewGeminiEmbeddingClientWithConfigDefaults(t *testing.T) {
	client := NewGeminiEmbeddingClientWithConfig("", "", "", 0, 0, 0)
	require.NotNil(t, client)
	assert.Equal(t, "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent", client.baseURL)
	assert.Equal(t, "models/gemini-embedding-2", client.model)
	assert.Equal(t, 30*time.Second, client.client.Timeout)
	assert.Equal(t, 3, client.maxRetries)
	assert.Equal(t, 10, client.maxConcurrent)
}

func TestEmbed_EmptyText(t *testing.T) {
	client := NewGeminiEmbeddingClient("test-api-key")
	_, err := client.Embed(context.Background(), "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "empty text")
}

func TestEmbedBatch_EmptySlice(t *testing.T) {
	client := NewGeminiEmbeddingClient("test-api-key")
	_, err := client.EmbedBatch(context.Background(), []string{})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "empty texts slice")
}

func TestEmbedBatch_ExceedsMaxBatchSize(t *testing.T) {
	client := NewGeminiEmbeddingClient("test-api-key")
	texts := make([]string, 101)
	for i := range texts {
		texts[i] = "test text"
	}
	_, err := client.EmbedBatch(context.Background(), texts)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "exceeds maximum of 100")
}

func TestEmbedBatch_EmptyTextInSlice(t *testing.T) {
	client := NewGeminiEmbeddingClient("test-api-key")
	texts := []string{"valid text", "", "another valid text"}
	_, err := client.EmbedBatch(context.Background(), texts)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "empty after preprocessing")
}

func TestEmbeddingClient_Interface(t *testing.T) {
	var client EmbeddingClient = NewGeminiEmbeddingClient("test-api-key")
	require.NotNil(t, client)

	// Verify interface methods exist
	_ = client.Embed
	_ = client.EmbedBatch
}
