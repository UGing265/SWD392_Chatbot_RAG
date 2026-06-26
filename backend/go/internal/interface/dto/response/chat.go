package response

import (
	"time"

	"github.com/google/uuid"
)

// SessionResponse is the API response for a chat session.
type SessionResponse struct {
	ID          uuid.UUID   `json:"id"`
	CourseID    uuid.UUID   `json:"course_id"`
	Title       string      `json:"title"`
	IsStarred   bool        `json:"is_starred"`
	Status      string      `json:"status"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	DocumentIDs []uuid.UUID `json:"document_ids"`
}

// MessageResponse is the API response for a chat message.
type MessageResponse struct {
	ID         uuid.UUID          `json:"id"`
	Role       string             `json:"role"`
	Content    string             `json:"content"`
	OutOfScope bool               `json:"out_of_scope"`
	Citations  []CitationResponse `json:"citations,omitempty"`
	CreatedAt  time.Time          `json:"created_at"`
}

// CitationResponse is the API response for a source citation.
type CitationResponse struct {
	ChunkID        uuid.UUID `json:"chunk_id"`
	FileName       string    `json:"file_name"`
	PageLabel      string    `json:"page_label"`
	Excerpt        string    `json:"excerpt"`
	RelevanceScore float64   `json:"relevance_score"`
}

// SendMessageResponse is the API response after sending a message.
type SendMessageResponse struct {
	UserMessage MessageResponse `json:"user_message"`
	BotMessage  MessageResponse `json:"bot_message"`
}

