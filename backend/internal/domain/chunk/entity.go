package chunk

import (
	"time"

	"github.com/google/uuid"
)

type Chunk struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	DocumentID    uuid.UUID  `json:"document_id" db:"document_id"`
	ChapterID     *uuid.UUID `json:"chapter_id,omitempty" db:"chapter_id"`
	ChunkOrder    int        `json:"chunk_order" db:"chunk_order"`
	PageNumber    *int       `json:"page_number,omitempty" db:"page_number"`
	Content       string     `json:"content" db:"content"`
	ContentTokens *int       `json:"content_tokens,omitempty" db:"content_tokens"`
	ChunkHash     *string    `json:"chunk_hash,omitempty" db:"chunk_hash"`
	Metadata      string     `json:"metadata" db:"metadata"` // JSON string
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	Embedding     []float32  `json:"-" db:"embedding"`
}