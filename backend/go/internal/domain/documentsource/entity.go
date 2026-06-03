package documentsource

import (
	"time"

	"github.com/google/uuid"
)

type DocumentSource struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
