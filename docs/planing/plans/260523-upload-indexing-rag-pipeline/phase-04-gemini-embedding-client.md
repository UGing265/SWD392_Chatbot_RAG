# Phase 04: Gemini Embedding Client

## Context Links

- `../plan.md` - Plan overview
- `../research/gemini-embedding-research.md` - Research findings

## Overview

- **Priority:** High
- **Current status:** Pending
- **Brief description:** HTTP-based Gemini Embedding 2 API client with batching, retry, and error handling.

## Requirements

### Functional
- Embed single text → 768-dimensional vector
- Batch embed multiple texts (up to 100/request)
- Exponential backoff retry for rate limits
- Context timeout per request

### Non-Functional
- Thread-safe client
- Configurable via environment variables

## Related Code Files

### New Files to Create
- `backend/internal/infrastructure/embedding/gemini-embedding.go` - API client

### Dependencies
- Go stdlib (`net/http`, `encoding/json`)
- `github.com/pgvector/pgvector-go` - Vector type

## Implementation Steps

### 1. Gemini Embedding Client
```go
// internal/infrastructure/embedding/gemini-embedding.go
package embedding

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

type GeminiEmbeddingClient struct {
    apiKey    string
    baseURL   string
    model     string
    client    *http.Client
    maxRetries int
}

type embedRequest struct {
    Model   string `json:"model"`
    Content struct {
        Parts []struct {
            Text string `json:"text"`
        } `json:"parts"`
    } `json:"content"`
    OutputDimensionality int `json:"output_dimensionality,omitempty"`
}

type embedResponse struct {
    Embedding struct {
        Values []float32 `json:"values"`
        Statistic struct {
            TokenCount int `json:"tokenCount"`
        } `json:"statistic"`
    } `json:"embedding"`
}

type batchEmbedRequest struct {
    Model   string `json:"model"`
    Inputs  []struct {
        Text string `json:"text"`
    } `json:"inputs"`
}

func NewGeminiEmbeddingClient(apiKey string) *GeminiEmbeddingClient {
    return &GeminiEmbeddingClient{
        apiKey:     apiKey,
        baseURL:    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
        model:      "models/gemini-embedding-2",
        client:     &http.Client{Timeout: 30 * time.Second},
        maxRetries: 3,
    }
}

// Embed generates embedding for a single text input.
func (c *GeminiEmbeddingClient) Embed(ctx context.Context, text string) ([]float32, error) {
    text = preprocessText(text)

    reqBody := embedRequest{}
    reqBody.Model = c.model
    reqBody.Content.Parts = []struct{ Text string }{{Text: text}}
    reqBody.OutputDimensionality = 768 // 768 for pgvector compatibility

    jsonBody, err := json.Marshal(reqBody)
    if err != nil {
        return nil, fmt.Errorf("marshal failed: %w", err)
    }

    url := fmt.Sprintf("%s?key=%s", c.baseURL, c.apiKey)
    req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        return nil, fmt.Errorf("request creation failed: %w", err)
    }
    req.Header.Set("Content-Type", "application/json")

    var embedResp embedResponse
    if err := c.doRequest(req, &embedResp); err != nil {
        return nil, err
    }

    return embedResp.Embedding.Values, nil
}

// EmbedBatch generates embeddings for multiple texts in one request.
func (c *GeminiEmbeddingClient) EmbedBatch(ctx context.Context, texts []string) ([][]float32, error) {
    reqBody := batchEmbedRequest{}
    reqBody.Model = c.model
    for _, text := range texts {
        reqBody.Inputs = append(reqBody.Inputs, struct {
            Text string `json:"text"`
        }{Text: preprocessText(text)})
    }

    jsonBody, err := json.Marshal(reqBody)
    if err != nil {
        return nil, fmt.Errorf("marshal failed: %w", err)
    }

    url := fmt.Sprintf("%s?key=%s", c.baseURL, c.apiKey)
    req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        return nil, fmt.Errorf("request creation failed: %w", err)
    }
    req.Header.Set("Content-Type", "application/json")

    var resp struct {
        Embeddings []struct {
            Values []float32 `json:"values"`
        } `json:"embeddings"`
    }
    if err := c.doRequest(req, &resp); err != nil {
        return nil, err
    }

    result := make([][]float32, len(resp.Embeddings))
    for i, e := range resp.Embeddings {
        result[i] = e.Values
    }
    return result, nil
}

func (c *GeminiEmbeddingClient) doRequest(req *http.Request, result interface{}) error {
    var lastErr error
    for attempt := 0; attempt < c.maxRetries; attempt++ {
        if attempt > 0 {
            time.Sleep(time.Duration(1<<uint(attempt)) * time.Second)
        }

        resp, err := c.client.Do(req)
        if err != nil {
            lastErr = err
            continue
        }
        defer resp.Body.Close()

        body, err := io.ReadAll(resp.Body)
        if err != nil {
            lastErr = fmt.Errorf("read body: %w", err)
            continue
        }

        switch resp.StatusCode {
        case http.StatusOK:
            if err := json.Unmarshal(body, result); err != nil {
                return fmt.Errorf("unmarshal: %w", err)
            }
            return nil
        case http.StatusTooManyRequests, http.StatusServiceUnavailable:
            lastErr = fmt.Errorf("rate limited: %d", resp.StatusCode)
            continue
        default:
            return fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
        }
    }
    return lastErr
}

func preprocessText(text string) string {
    text = strings.Join(strings.Fields(text), " ")
    text = strings.TrimSpace(text)
    if len(text) > 32000 {
        text = text[:32000]
    }
    return text
}
```

## Dependency Injection
```go
// internal/infrastructure/embedding/provider.go
type EmbeddingClient interface {
    Embed(ctx context.Context, text string) ([]float32, error)
    EmbedBatch(ctx context.Context, texts []string) ([][]float32, error)
}

func NewEmbeddingClient(apiKey string) EmbeddingClient {
    return NewGeminiEmbeddingClient(apiKey)
}
```

## Success Criteria

- [ ] Single text embedding returns 768-dim vector
- [ ] Batch embedding processes up to 100 texts per request
- [ ] Retry with exponential backoff on 429/503
- [ ] Context timeout enforced (30s)
- [ ] Text preprocessed (whitespace normalization, length limit)

## Next Steps

→ Phase 05: Indexing Use Case (Orchestration)