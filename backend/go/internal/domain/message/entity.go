package message

import (
	"time"

	"github.com/google/uuid"
)

// Message represents a single chat message (user question or bot answer).
type Message struct {
	ID         uuid.UUID `json:"id" db:"id"`
	SessionID  uuid.UUID `json:"session_id" db:"session_id"`
	Role       string    `json:"role" db:"role"` // user / bot
	Content    string    `json:"content" db:"content"`
	TokenCount  *int                `json:"token_count,omitempty" db:"token_count"`
	OutOfScope  bool                `json:"out_of_scope" db:"out_of_scope"`
	CreatedAt   time.Time           `json:"created_at" db:"created_at"`
}

// MessageCitation links a bot message to the chunk it cited.
type MessageCitation struct {
	ID             uuid.UUID `json:"id" db:"id"`
	MessageID      uuid.UUID `json:"message_id" db:"message_id"`
	ChunkID        uuid.UUID `json:"chunk_id" db:"chunk_id"`
	RelevanceScore float64   `json:"relevance_score" db:"relevance_score"`
	Excerpt        string    `json:"excerpt" db:"excerpt"`
}

// SimilarChunk is the result of a vector similarity search.
type SimilarChunk struct {
	ChunkID        uuid.UUID `json:"chunk_id"`
	DocumentID     uuid.UUID `json:"document_id"`
	Content        string    `json:"content"`
	PageLabel      string    `json:"page_label"`
	FileName       string    `json:"file_name"`
	RelevanceScore float64   `json:"relevance_score"`
}

const (
	RoleUser = "user"
	RoleBot  = "bot"
)
