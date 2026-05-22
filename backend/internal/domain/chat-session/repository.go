package chat_session

import "github.com/google/uuid"

type ChatSessionRepository interface {
	Create(session *ChatSession) error
	FindByID(id uuid.UUID) (*ChatSession, error)
	FindByUserID(userID uuid.UUID) ([]*ChatSession, error)
	Update(session *ChatSession) error
	Delete(id uuid.UUID) error
}