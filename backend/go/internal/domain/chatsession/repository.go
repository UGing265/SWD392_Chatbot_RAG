package chatsession

import (
	"context"

	"github.com/google/uuid"
)

// ChatSessionRepository defines the interface for chat session persistence.
type ChatSessionRepository interface {
	Create(ctx context.Context, session *ChatSession) error
	GetByID(ctx context.Context, id uuid.UUID) (*ChatSession, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*ChatSession, error)
	Update(ctx context.Context, session *ChatSession) error
	Delete(ctx context.Context, id uuid.UUID) error
}
