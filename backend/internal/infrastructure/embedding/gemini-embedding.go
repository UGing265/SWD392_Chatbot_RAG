package embedding

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync/atomic"
	"time"

	"golang.org/x/sync/semaphore"
)

// GeminiEmbeddingClient is a thread-safe client for Gemini Embedding API
type GeminiEmbeddingClient struct {
	apiKeys      []string
	keyIndex     atomic.Uint32
	baseURL      string
	model        string
	client       *http.Client
	maxRetries   int
	semaphore    *semaphore.Weighted
	maxConcurrent int
}

type embedRequest struct {
	Model                 string `json:"model"`
	Content               struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"content"`
	OutputDimensionality int `json:"output_dimensionality,omitempty"`
}

type embedResponse struct {
	Embedding struct {
		Values     []float32 `json:"values"`
		Statistic  struct {
			TokenCount int `json:"tokenCount"`
		} `json:"statistic"`
	} `json:"embedding"`
}

type batchEmbedRequest struct {
	Model  string `json:"model"`
	Inputs []struct {
		Text string `json:"text"`
	} `json:"inputs"`
}

type batchEmbedResponse struct {
	Embeddings []struct {
		Values    []float32 `json:"values"`
		Statistic struct {
			TokenCount int `json:"tokenCount"`
		} `json:"statistic"`
	} `json:"embeddings"`
}

type errorResponse struct {
	Error struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error"`
}

// parseAPIKeys splits a comma-separated string of API keys
func parseAPIKeys(apiKeysStr string) []string {
	var keys []string
	for _, key := range strings.Split(apiKeysStr, ",") {
		trimmed := strings.TrimSpace(key)
		if trimmed != "" {
			keys = append(keys, trimmed)
		}
	}
	if len(keys) == 0 {
		return []string{""} // Fallback to empty string to avoid panic
	}
	return keys
}

// getNextKey returns the next API key in a round-robin fashion
func (c *GeminiEmbeddingClient) getNextKey() string {
	idx := c.keyIndex.Add(1)
	return c.apiKeys[int(idx)%len(c.apiKeys)]
}

// NewGeminiEmbeddingClient creates a new Gemini embedding client
func NewGeminiEmbeddingClient(apiKeysStr string) *GeminiEmbeddingClient {
	return &GeminiEmbeddingClient{
		apiKeys:       parseAPIKeys(apiKeysStr),
		baseURL:       "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
		model:         "models/gemini-embedding-2",
		client:        &http.Client{Timeout: 30 * time.Second},
		maxRetries:    3,
		semaphore:     semaphore.NewWeighted(10),
		maxConcurrent: 10,
	}
}

// NewGeminiEmbeddingClientWithConfig creates a client with custom configuration
func NewGeminiEmbeddingClientWithConfig(apiKeysStr, baseURL, model string, timeout time.Duration, maxRetries, maxConcurrent int) *GeminiEmbeddingClient {
	if baseURL == "" {
		baseURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent"
	}
	if model == "" {
		model = "models/gemini-embedding-2"
	}
	if timeout == 0 {
		timeout = 30 * time.Second
	}
	if maxRetries == 0 {
		maxRetries = 3
	}
	if maxConcurrent == 0 {
		maxConcurrent = 10
	}

	return &GeminiEmbeddingClient{
		apiKeys:       parseAPIKeys(apiKeysStr),
		baseURL:       baseURL,
		model:         model,
		client:        &http.Client{Timeout: timeout},
		maxRetries:    maxRetries,
		semaphore:     semaphore.NewWeighted(int64(maxConcurrent)),
		maxConcurrent: maxConcurrent,
	}
}

// Embed generates an embedding for a single text
func (c *GeminiEmbeddingClient) Embed(ctx context.Context, text string) ([]float32, error) {
	text = preprocessText(text)
	if text == "" {
		return nil, fmt.Errorf("empty text after preprocessing")
	}

	reqBody := embedRequest{
		Model: c.model,
	}
	reqBody.Content.Parts = []struct {
		Text string `json:"text"`
	}{{Text: text}}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("%s?key=%s", c.baseURL, c.getNextKey())
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	var result embedResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	if len(result.Embedding.Values) != 768 {
		return nil, fmt.Errorf("expected 768 dimensions, got %d", len(result.Embedding.Values))
	}

	return result.Embedding.Values, nil
}

// EmbedBatch generates embeddings for multiple texts (up to 100 per request)
func (c *GeminiEmbeddingClient) EmbedBatch(ctx context.Context, texts []string) ([][]float32, error) {
	if len(texts) == 0 {
		return nil, fmt.Errorf("empty texts slice")
	}

	if len(texts) > 100 {
		return nil, fmt.Errorf("batch size exceeds maximum of 100 (got %d)", len(texts))
	}

	// Preprocess all texts
	processedTexts := make([]string, len(texts))
	for i, text := range texts {
		processed := preprocessText(text)
		if processed == "" {
			return nil, fmt.Errorf("text at index %d is empty after preprocessing", i)
		}
		processedTexts[i] = processed
	}

	reqBody := batchEmbedRequest{
		Model: c.model,
	}
	for _, text := range processedTexts {
		reqBody.Inputs = append(reqBody.Inputs, struct {
			Text string `json:"text"`
		}{Text: text})
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("%s?key=%s", c.baseURL, c.getNextKey())
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	var result batchEmbedResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	if len(result.Embeddings) != len(texts) {
		return nil, fmt.Errorf("expected %d embeddings, got %d", len(texts), len(result.Embeddings))
	}

	embeddings := make([][]float32, len(result.Embeddings))
	for i, emb := range result.Embeddings {
		if len(emb.Values) != 768 {
			return nil, fmt.Errorf("embedding at index %d has %d dimensions, expected 768", i, len(emb.Values))
		}
		embeddings[i] = emb.Values
	}

	return embeddings, nil
}

// doRequest executes HTTP request with exponential backoff retry
func (c *GeminiEmbeddingClient) doRequest(req *http.Request, result interface{}) error {
	var lastErr error
	var resp *http.Response

	for attempt := 0; attempt <= c.maxRetries; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(1<<uint(attempt)) * time.Second
			if backoff > 60*time.Second {
				backoff = 60 * time.Second
			}
			time.Sleep(backoff)
		}

		reqClone := req.Clone(req.Context())
		resp, lastErr = c.client.Do(reqClone)
		if lastErr != nil {
			continue
		}
		defer resp.Body.Close()

		body, readErr := io.ReadAll(resp.Body)
		if readErr != nil {
			lastErr = fmt.Errorf("failed to read response body: %w", readErr)
			continue
		}

		if resp.StatusCode == http.StatusOK {
			if parseErr := json.Unmarshal(body, result); parseErr != nil {
				return fmt.Errorf("failed to unmarshal response: %w", parseErr)
			}
			return nil
		}

		if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode == http.StatusServiceUnavailable {
			lastErr = fmt.Errorf("rate limit or service unavailable (status %d)", resp.StatusCode)
			continue
		}

		var errResp errorResponse
		if unmarshalErr := json.Unmarshal(body, &errResp); unmarshalErr == nil {
			lastErr = fmt.Errorf("API error: %s (code %d)", errResp.Error.Message, errResp.Error.Code)
		} else {
			lastErr = fmt.Errorf("HTTP error: status %d", resp.StatusCode)
		}

		if resp.StatusCode >= 500 {
			continue
		}
		break
	}

	return lastErr
}

// preprocessText normalizes and truncates text for embedding
func preprocessText(text string) string {
	text = strings.Join(strings.Fields(text), " ")
	text = strings.TrimSpace(text)
	if len(text) > 32000 {
		text = text[:32000]
	}
	return text
}