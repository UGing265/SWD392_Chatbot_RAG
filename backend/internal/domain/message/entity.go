package message

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID         uuid.UUID `json:"id" db:"id"`
	SessionID  uuid.UUID `json:"session_id" db:"session_id"`
	Role       string    `json:"role" db:"role"`
	Content    string    `json:"content" db:"content"`
	TokenCount *int      `json:"token_count,omitempty" db:"token_count"`
	OutOfScope bool      `json:"out_of_scope" db:"out_of_scope"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type MessageCitation struct {
	ID             uuid.UUID `json:"id" db:"id"`
	MessageID      uuid.UUID `json:"message_id" db:"message_id"`
	ChunkID        uuid.UUID `json:"chunk_id" db:"chunk_id"`
	RelevanceScore float64   `json:"relevance_score" db:"relevance_score"`
	Excerpt        string    `json:"excerpt" db:"excerpt"`
}

const (
	RoleUser    = "user"
	RoleBot     = "bot"
)

type MessageRepository interface {
	Create(msg *Message) error
	FindBySessionID(sessionID uuid.UUID) ([]*Message, error)
	CreateCitation(citation *MessageCitation) error
	FindCitationsByMessageID(messageID uuid.UUID) ([]*MessageCitation, error)
}