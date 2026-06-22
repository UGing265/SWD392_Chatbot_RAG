package chatusecase

import (
	"swd392-chatbot-rag/internal/domain/chatsession"
	"swd392-chatbot-rag/internal/domain/message"
	"swd392-chatbot-rag/internal/infrastructure/embedding"
	"swd392-chatbot-rag/internal/infrastructure/llm"
)

// ChatUseCase orchestrates all chat-related business logic.
type ChatUseCase struct {
	sessionRepo chatsession.ChatSessionRepository
	msgRepo     message.MessageRepository
	embedClient embedding.EmbeddingClient
	llmClient   llm.LLMClient
}

// NewChatUseCase creates a new ChatUseCase with all required dependencies.
func NewChatUseCase(
	sessionRepo chatsession.ChatSessionRepository,
	msgRepo message.MessageRepository,
	embedClient embedding.EmbeddingClient,
	llmClient llm.LLMClient,
) *ChatUseCase {
	return &ChatUseCase{
		sessionRepo: sessionRepo,
		msgRepo:     msgRepo,
		embedClient: embedClient,
		llmClient:   llmClient,
	}
}
