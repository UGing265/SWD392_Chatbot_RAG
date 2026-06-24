package chatusecase

import (
	"context"
	"fmt"
	"strings"
	"time"

	"swd392-chatbot-rag/internal/domain/message"
	"swd392-chatbot-rag/pkg/prompt"

	"github.com/google/uuid"
)

// StreamMessage executes the full RAG pipeline and returns a channel of tokens.
func (uc *ChatUseCase) StreamMessage(ctx context.Context, userID, sessionID uuid.UUID, content string) (<-chan string, *SendMessageResult, error) {
	// 1. Verify session ownership
	session, err := uc.GetSession(ctx, sessionID, userID)
	if err != nil {
		return nil, nil, err
	}

	// 2. Save user message
	userMsg := &message.Message{
		ID:        uuid.New(),
		SessionID: sessionID,
		Role:      message.RoleUser,
		Content:   content,
		CreatedAt: time.Now().UTC(),
	}
	if err := uc.msgRepo.Create(ctx, userMsg); err != nil {
		return nil, nil, fmt.Errorf("failed to save user message: %w", err)
	}

	// 3. Update session title if this is the first message
	if session.Title == "New chat" {
		title := content
		if len(title) > 50 {
			title = title[:50] + "..."
		}
		session.Title = title
		session.UpdatedAt = time.Now().UTC()
		_ = uc.sessionRepo.Update(ctx, session)
	}

	// 4. Enhance query and embed
	enhancedQuery := uc.enhanceQueryAsync(ctx, content)
	queryEmbedding, err := uc.embedClient.Embed(ctx, enhancedQuery)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to embed query: %w", err)
	}

	// 5. Semantic search — find top-K similar chunks
	chunks, err := uc.msgRepo.SearchSimilarChunks(ctx, queryEmbedding, session.CourseID, session.DocumentIDs, topKChunks)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to search chunks: %w", err)
	}

	// 6. Check similarity threshold
	maxScore := 0.0
	for _, c := range chunks {
		if c.RelevanceScore > maxScore {
			maxScore = c.RelevanceScore
		}
	}

	if maxScore < similarityThreshold || len(chunks) == 0 {
		botMsg := &message.Message{
			ID:         uuid.New(),
			SessionID:  sessionID,
			Role:       message.RoleBot,
			Content:    outOfScopeReply,
			OutOfScope: true,
			CreatedAt:  time.Now().UTC(),
		}
		if err := uc.msgRepo.Create(ctx, botMsg); err != nil {
			return nil, nil, fmt.Errorf("failed to save bot message: %w", err)
		}
		
		ch := make(chan string, 1)
		ch <- outOfScopeReply
		close(ch)
		
		return ch, &SendMessageResult{UserMessage: userMsg, BotMessage: botMsg, Citations: nil}, nil
	}

	// 7. Build prompt with context
	contextStr := buildContextString(chunks)
	systemPrompt := fmt.Sprintf(prompt.SystemPrompt, contextStr, content)

	// 8. Build conversation history
	history, err := uc.msgRepo.GetBySessionID(ctx, sessionID, maxHistoryMessages)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get history: %w", err)
	}
	geminiHistory := buildGeminiHistory(history)

	// 9. Call Gemini LLM stream
	tokenCh, err := uc.llmClient.StreamGenerate(ctx, systemPrompt, geminiHistory)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to stream generate answer: %w", err)
	}

	outCh := make(chan string)

	botMsg := &message.Message{
		ID:        uuid.New(),
		SessionID: sessionID,
		Role:      message.RoleBot,
		Content:   "",
		CreatedAt: time.Now().UTC(),
	}

	go func() {
		defer close(outCh)
		var fullResponse strings.Builder
		for token := range tokenCh {
			fullResponse.WriteString(token)
			outCh <- token
		}

		botMsg.Content = fullResponse.String()
		if botMsg.Content != "" {
			_ = uc.msgRepo.Create(context.Background(), botMsg)

			var citations []*message.MessageCitation
			for _, ch := range chunks {
				excerpt := ch.Content
				if len(excerpt) > 200 {
					excerpt = excerpt[:200] + "..."
				}
				citations = append(citations, &message.MessageCitation{
					ID:             uuid.New(),
					MessageID:      botMsg.ID,
					ChunkID:        ch.ChunkID,
					RelevanceScore: ch.RelevanceScore,
					Excerpt:        excerpt,
				})
			}
			_ = uc.msgRepo.CreateCitations(context.Background(), citations)

			session.UpdatedAt = time.Now().UTC()
			_ = uc.sessionRepo.Update(context.Background(), session)
		}
	}()

	return outCh, &SendMessageResult{UserMessage: userMsg, BotMessage: botMsg, Citations: chunks}, nil
}
