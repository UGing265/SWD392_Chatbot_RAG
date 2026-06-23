package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync/atomic"
	"time"
)

// ChatMessage represents a single turn in the conversation history.
type ChatMessage struct {
	Role    string `json:"role"`    // user / bot
	Content string `json:"content"`
}

// LLMClient defines the interface for LLM text generation.
type LLMClient interface {
	Generate(ctx context.Context, systemPrompt string, history []ChatMessage) (string, error)
	StreamGenerate(ctx context.Context, systemPrompt string, history []ChatMessage) (<-chan string, error)
}

// GeminiLLMClient calls the Gemini generateContent REST API.
type GeminiLLMClient struct {
	apiKeys    []string
	keyIndex   atomic.Uint32
	model      string
	client     *http.Client
	maxRetries int
}

// NewGeminiLLMClient creates a new LLM client for Gemini.
func NewGeminiLLMClient(apiKeysStr, model string) *GeminiLLMClient {
	keys := parseKeys(apiKeysStr)
	if model == "" {
		model = "gemini-2.5-flash"
	}
	return &GeminiLLMClient{
		apiKeys:    keys,
		model:      model,
		client:     &http.Client{Timeout: 60 * time.Second},
		maxRetries: 5,
	}
}

func (c *GeminiLLMClient) getNextKey() string {
	idx := c.keyIndex.Add(1)
	return c.apiKeys[int(idx)%len(c.apiKeys)]
}

// Generate sends a synchronous generateContent request to Gemini.
func (c *GeminiLLMClient) Generate(ctx context.Context, systemPrompt string, history []ChatMessage) (string, error) {
	body := c.buildRequestBody(systemPrompt, history)
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	var lastErr error
	for attempt := 0; attempt < c.maxRetries; attempt++ {
		apiKey := c.getNextKey()
		url := fmt.Sprintf(
			"https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
			c.model, apiKey,
		)

		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBody))
		if err != nil {
			return "", fmt.Errorf("failed to create request: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := c.client.Do(req)
		if err != nil {
			lastErr = err
			time.Sleep(time.Second)
			continue
		}

		respBody, readErr := io.ReadAll(resp.Body)
		resp.Body.Close()
		if readErr != nil {
			lastErr = fmt.Errorf("failed to read response: %w", readErr)
			continue
		}

		if resp.StatusCode == http.StatusOK {
			return extractText(respBody)
		}

		lastErr = fmt.Errorf("gemini API returned %d: %s", resp.StatusCode, truncate(string(respBody), 500))
		if resp.StatusCode == http.StatusTooManyRequests {
			time.Sleep(5 * time.Second)
		} else if resp.StatusCode >= 500 {
			time.Sleep(time.Second)
		} else {
			break // 4xx (non-429) — don't retry
		}
	}

	return "", fmt.Errorf("gemini generate failed after %d attempts: %w", c.maxRetries, lastErr)
}

// StreamGenerate sends a streaming request to Gemini and returns a channel of generated tokens.
func (c *GeminiLLMClient) StreamGenerate(ctx context.Context, systemPrompt string, history []ChatMessage) (<-chan string, error) {
	body := c.buildRequestBody(systemPrompt, history)
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	apiKey := c.getNextKey()
	url := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/%s:streamGenerateContent?alt=sse&key=%s",
		c.model, apiKey,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call gemini api: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("gemini API returned %d: %s", resp.StatusCode, truncate(string(respBody), 500))
	}

	ch := make(chan string)

	go func() {
		defer resp.Body.Close()
		defer close(ch)

		reader := bufio.NewReader(resp.Body)
		for {
			select {
			case <-ctx.Done():
				return
			default:
				line, err := reader.ReadBytes('\n')
				if err != nil {
					if err != io.EOF {
						// Optionally log error
					}
					return
				}

				lineStr := strings.TrimSpace(string(line))
				if strings.HasPrefix(lineStr, "data: ") {
					dataStr := strings.TrimPrefix(lineStr, "data: ")
					if dataStr == "[DONE]" {
						return
					}

					text, extractErr := extractText([]byte(dataStr))
					if extractErr == nil && text != "" {
						ch <- text
					}
				}
			}
		}
	}()

	return ch, nil
}

// buildRequestBody constructs the Gemini API request payload.
func (c *GeminiLLMClient) buildRequestBody(systemPrompt string, history []ChatMessage) map[string]interface{} {
	contents := make([]map[string]interface{}, 0, len(history))
	for _, msg := range history {
		role := msg.Role
		if role == "bot" || role == "assistant" {
			role = "model"
		}
		contents = append(contents, map[string]interface{}{
			"role":  role,
			"parts": []map[string]string{{"text": msg.Content}},
		})
	}

	return map[string]interface{}{
		"systemInstruction": map[string]interface{}{
			"parts": []map[string]string{{"text": systemPrompt}},
		},
		"contents": contents,
		"generationConfig": map[string]interface{}{
			"temperature":    0.3,
			"maxOutputTokens": 8192,
		},
	}
}

// extractText parses the Gemini response JSON to get the generated text.
func extractText(body []byte) (string, error) {
	var resp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}
	if len(resp.Candidates) == 0 {
		return "", fmt.Errorf("no candidates in response")
	}

	var sb strings.Builder
	for _, part := range resp.Candidates[0].Content.Parts {
		sb.WriteString(part.Text)
	}
	return sb.String(), nil
}

func parseKeys(keysStr string) []string {
	var keys []string
	for _, key := range strings.Split(keysStr, ",") {
		trimmed := strings.TrimSpace(key)
		if trimmed != "" {
			keys = append(keys, trimmed)
		}
	}
	if len(keys) == 0 {
		return []string{""}
	}
	return keys
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}
