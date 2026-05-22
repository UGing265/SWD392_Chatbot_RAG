# Research: Gemini Embedding 2 Integration

## 1. API Overview

**Model:** `gemini-embedding-2`
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent`
**Alternative (OpenAI-compatible):** `https://generativelanguage.googleapis.com/v1beta/openai/embeddings`

**Key specs:**
- Input: Text up to 8,192 tokens
- Output: Flexible dimensions 128-3072 (recommended: 768, 1536, 3072)
- Output dimensionality configurable via `output_dimensionality` parameter

**Authentication:**
- Header: `x-goog-api-key: YOUR_API_KEY`
- Or Bearer token: `Authorization: Bearer API_KEY`

## 2. Go Integration

### HTTP-Based Implementation

```go
package embedding

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "net/http"
)

type GeminiEmbeddingClient struct {
    apiKey  string
    model   string
    baseURL string
    client  *http.Client
}

type EmbedRequest struct {
    Model string `json:"model"`
    Input struct {
        Text string `json:"text"`
    } `json:"input"`
}

type EmbedResponse struct {
    Embedding struct {
        Values []float32 `json:"values"`
    } `json:"embedding"`
}

func NewClient(apiKey string) *GeminiEmbeddingClient {
    return &GeminiEmbeddingClient{
        apiKey:  apiKey,
        model:   "embedding-001",
        baseURL: "https://generativelanguage.googleapis.com/v1beta2/models/embedding-001:embedContent",
        client:  &http.Client{},
    }
}

func (c *GeminiEmbeddingClient) Embed(ctx context.Context, text string) ([]float32, error) {
    reqBody := EmbedRequest{}
    reqBody.Model = c.model
    reqBody.Input.Text = text

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

    resp, err := c.client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("request failed: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API error: %d", resp.StatusCode)
    }

    var embedResp EmbedResponse
    if err := json.NewDecoder(resp.Body).Decode(&embedResp); err != nil {
        return nil, fmt.Errorf("decode failed: %w", err)
    }

    return embedResp.Embedding.Values, nil
}
```

## 3. Batch Embedding

```go
type BatchEmbedRequest struct {
    Model string `json:"model"`
    Inputs []struct {
        Text string `json:"text"`
    } `json:"inputs"`
}

func (c *GeminiEmbeddingClient) EmbedBatch(ctx context.Context, texts []string) ([][]float32, error) {
    reqBody := BatchEmbedRequest{}
    reqBody.Model = c.model
    for _, text := range texts {
        reqBody.Inputs = append(reqBody.Inputs, struct {
            Text string `json:"text"`
        }{Text: text})
    }

    jsonBody, err := json.Marshal(reqBody)
    if err != nil {
        return nil, err
    }

    url := fmt.Sprintf("%s?key=%s", c.baseURL, c.apiKey)
    req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        return nil, err
    }
    req.Header.Set("Content-Type", "application/json")

    resp, err := c.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    // Parse response and extract embeddings
    var result [][]float32
    // ... parse and return
    return result, nil
}
```

## 4. Text Preprocessing

```go
func preprocessText(text string) string {
    // Remove excessive whitespace
    text = strings.Join(strings.Fields(text), " ")
    // Trim
    text = strings.TrimSpace(text)
    // Limit length (8k tokens ~ 32k chars)
    if len(text) > 32000 {
        text = text[:32000]
    }
    return text
}
```

## 5. Rate Limits & Batching

- **Batch size:** Up to 100 texts per request (recommended: 50 for stability)
- **Rate limit:** ~60 requests/minute for embedding APIs
- **Retry:** Implement exponential backoff for 429/503 errors

```go
func (c *GeminiEmbeddingClient) EmbedWithRetry(ctx context.Context, text string, maxRetries int) ([]float32, error) {
    for i := 0; i < maxRetries; i++ {
        embedding, err := c.Embed(ctx, text)
        if err == nil {
            return embedding, nil
        }

        // Check if retryable
        if !isRetryable(err) {
            return nil, err
        }

        // Exponential backoff
        time.Sleep(time.Duration(1<<uint(i)) * time.Second)
    }
    return nil, fmt.Errorf("max retries exceeded")
}
```

## 6. Key Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Model | `embedding-001` | Latest stable |
| Dimensions | 768 | Gemini Embedding 2 output |
| Max input | ~8k tokens | ~32k characters |
| Batch size | 50-100 | Per request limit |
| Normalized | Yes | Vectors are L2 normalized |

## 7. Infrastructure Layer Placement

Per Architecture.md Clean Architecture structure:
- `backend/internal/infrastructure/embedding/gemini-embedding.go` - API client
- `backend/internal/application/indexing-usecase/process.go` - orchestration

## 8. Error Handling

```go
type EmbeddingError struct {
    Code    string
    Message string
    Retry   bool
}

func (e *EmbeddingError) Error() string {
    return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func isRetryable(err error) bool {
    if ee, ok := err.(*EmbeddingError); ok {
        return ee.Retry
    }
    return false
}
```

## Key Recommendations

1. **Batch embeddings** when indexing documents (50-100 chunks per request)
2. **Preprocess text** before embedding (normalize whitespace, trim)
3. **Implement retry** with exponential backoff for rate limits
4. **Use context timeout** for all API calls (recommend 30s per batch)
5. **Store embeddings immediately** to pgvector after generation
6. **Track progress** in document record (embedding_count vs chunk_count)