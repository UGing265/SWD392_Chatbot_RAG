package course

import (
	"time"

	"github.com/google/uuid"
)

type Course struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Textbook  string    `json:"textbook" db:"textbook"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}