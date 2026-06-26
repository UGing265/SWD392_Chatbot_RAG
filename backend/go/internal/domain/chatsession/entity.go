package chatsession

import (
	"time"

	"github.com/google/uuid"
)

// ChatSession represents a conversation thread belonging to a user.
type ChatSession struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	CourseID  uuid.UUID `json:"course_id" db:"course_id"`
	Title     string    `json:"title" db:"title"`
	IsStarred bool      `json:"is_starred" db:"is_starred"`
	Status    string    `json:"status" db:"status"` // active / done
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`
	DocumentIDs []uuid.UUID `json:"document_ids" db:"-"` // Associated documents
}

const (
	StatusActive = "active"
	StatusDone   = "done"
)
