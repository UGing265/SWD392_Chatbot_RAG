package chat_usecase

import (
	"context"
	"io"

	"swd392-chatbot-rag/internal/domain/chatsession"
	"swd392-chatbot-rag/internal/domain/message"
	"swd392-chatbot-rag/internal/infrastructure/embedding"
	"swd392-chatbot-rag/internal/infrastructure/llm"
)

// FileStorage defines the interface for uploading chat attachments.
type FileStorage interface {
	Save(ctx context.Context, key string, reader io.Reader, contentType string) (string, error)
}

// ChatUseCase orchestrates all chat-related business logic.
type ChatUseCase struct {
	sessionRepo chatsession.ChatSessionRepository
	msgRepo     message.MessageRepository
	embedClient embedding.EmbeddingClient
	llmClient   llm.LLMClient
	storage     FileStorage
}

// NewChatUseCase creates a new ChatUseCase with all required dependencies.
func NewChatUseCase(
	sessionRepo chatsession.ChatSessionRepository,
	msgRepo message.MessageRepository,
	embedClient embedding.EmbeddingClient,
	llmClient llm.LLMClient,
	storage FileStorage,
) *ChatUseCase {
	return &ChatUseCase{
		sessionRepo: sessionRepo,
		msgRepo:     msgRepo,
		embedClient: embedClient,
		llmClient:   llmClient,
		storage:     storage,
	}
}
