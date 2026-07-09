package request

import "github.com/google/uuid"

// CreateSessionRequest is the payload for creating a new chat session.
type CreateSessionRequest struct {
	CourseID    uuid.UUID   `json:"course_id" binding:"required"`
	Title       *string     `json:"title"`
	DocumentIDs []uuid.UUID `json:"document_ids"`
}

// SendMessageRequest is the payload for sending a message in a session.
type SendMessageRequest struct {
	Content string `json:"content" binding:"required"`
}
