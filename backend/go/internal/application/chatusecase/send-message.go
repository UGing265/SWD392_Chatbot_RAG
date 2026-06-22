package chatusecase

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"swd392-chatbot-rag/internal/domain/message"
	"swd392-chatbot-rag/internal/infrastructure/llm"
	"swd392-chatbot-rag/pkg/prompt"

	"github.com/google/uuid"
)

const (
	topKChunks         = 5
	maxHistoryMessages = 20
	similarityThreshold = 0.5
	outOfScopeReply    = "Xin lỗi, thông tin này không có trong giáo trình. Vui lòng tham khảo thêm tài liệu khác hoặc hỏi giảng viên trên lớp."
)

// SendMessageResult is the response returned after processing a message.
type SendMessageResult struct {
	UserMessage *message.Message
	BotMessage  *message.Message
	Citations   []*message.SimilarChunk
}

// SendMessage executes the full RAG pipeline: embed → search → prompt → generate → save.
func (uc *ChatUseCase) SendMessage(ctx context.Context, userID, sessionID uuid.UUID, content string) (*SendMessageResult, error) {
	// 1. Verify session ownership
	session, err := uc.GetSession(ctx, sessionID, userID)
	if err != nil {
		return nil, err
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
		return nil, fmt.Errorf("failed to save user message: %w", err)
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
		return nil, fmt.Errorf("failed to embed query: %w", err)
	}

	// 5. Semantic search — find top-K similar chunks
	chunks, err := uc.msgRepo.SearchSimilarChunks(ctx, queryEmbedding, session.CourseID, topKChunks)
	if err != nil {
		return nil, fmt.Errorf("failed to search chunks: %w", err)
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
			return nil, fmt.Errorf("failed to save bot message: %w", err)
		}
		return &SendMessageResult{UserMessage: userMsg, BotMessage: botMsg, Citations: nil}, nil
	}

	// 7. Build prompt with context
	contextStr := buildContextString(chunks)
	systemPrompt := fmt.Sprintf(prompt.SystemPrompt, contextStr, content)

	// 8. Build conversation history
	history, err := uc.msgRepo.GetBySessionID(ctx, sessionID, maxHistoryMessages)
	if err != nil {
		return nil, fmt.Errorf("failed to get history: %w", err)
	}
	geminiHistory := buildGeminiHistory(history)

	// 9. Call Gemini LLM
	answer, err := uc.llmClient.Generate(ctx, systemPrompt, geminiHistory)
	if err != nil {
		return nil, fmt.Errorf("failed to generate answer: %w", err)
	}

	// 10. Save bot message
	botMsg := &message.Message{
		ID:        uuid.New(),
		SessionID: sessionID,
		Role:      message.RoleBot,
		Content:   answer,
		CreatedAt: time.Now().UTC(),
	}
	if err := uc.msgRepo.Create(ctx, botMsg); err != nil {
		return nil, fmt.Errorf("failed to save bot message: %w", err)
	}

	// 11. Save citations
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
	if err := uc.msgRepo.CreateCitations(ctx, citations); err != nil {
		return nil, fmt.Errorf("failed to save citations: %w", err)
	}

	// 12. Update session timestamp
	session.UpdatedAt = time.Now().UTC()
	_ = uc.sessionRepo.Update(ctx, session)

	return &SendMessageResult{UserMessage: userMsg, BotMessage: botMsg, Citations: chunks}, nil
}

func buildContextString(chunks []*message.SimilarChunk) string {
	var sb strings.Builder
	for i, ch := range chunks {
		sb.WriteString(fmt.Sprintf("--- Chunk %d (Score: %.4f) ---\n", i+1, ch.RelevanceScore))
		sb.WriteString(fmt.Sprintf("Tài liệu: %s\n", ch.FileName))
		if ch.PageLabel != "" {
			sb.WriteString(fmt.Sprintf("Trang: %s\n", ch.PageLabel))
		}
		sb.WriteString("Nội dung:\n")
		sb.WriteString(ch.Content)
		sb.WriteString("\n\n")
	}
	return sb.String()
}

func buildGeminiHistory(messages []*message.Message) []llm.ChatMessage {
	result := make([]llm.ChatMessage, 0, len(messages))
	for _, m := range messages {
		if m.Role == message.RoleUser || m.Role == message.RoleBot {
			result = append(result, llm.ChatMessage{
				Role:    m.Role,
				Content: m.Content,
			})
		}
	}
	return result
}

var (
	vietnameseUnmarkedRegex = regexp.MustCompile(`(?i)\b(la|gi|cua|trong|tren|duoi|va|hoac|de|cho|tai|lieu|co|khong|nao|dau|the|lam|sao|mot|hai|ba|bon|nam|tim|kiem|thuat|toan|cau|truc|du|mang|danh|sach|lien|ket|cay|nhi|phan|do|thi|nhe|nha|oi|dung|sai)\b`)
	vietnameseDiacritics    = regexp.MustCompile(`[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸÝĐ]`)
)

func isProbablyVietnamese(text string) bool {
	if strings.TrimSpace(text) == "" {
		return false
	}
	if vietnameseDiacritics.MatchString(text) {
		return true
	}
	if vietnameseUnmarkedRegex.MatchString(text) {
		return true
	}
	return false
}

func (uc *ChatUseCase) enhanceQueryAsync(ctx context.Context, originalQuery string) string {
	if !isProbablyVietnamese(originalQuery) {
		return originalQuery
	}

	systemPrompt := "You are a professional technical translator. Translate the user's computer science query from Vietnamese to English. Optimize the translation to be used for semantic vector search in English textbooks. Return ONLY the final translated English query, without any explanation, markdown, quotes or extra text."
	
	history := []llm.ChatMessage{
		{Role: "user", Content: originalQuery},
	}

	englishQuery, err := uc.llmClient.Generate(ctx, systemPrompt, history)
	if err != nil {
		return originalQuery
	}

	cleaned := strings.TrimFunc(englishQuery, func(r rune) bool {
		return r == '"' || r == '\'' || r == '`' || r == ' ' || r == '\n'
	})
	
	if cleaned != "" && !strings.EqualFold(cleaned, originalQuery) {
		return fmt.Sprintf("%s | %s", originalQuery, cleaned)
	}

	return originalQuery
}
