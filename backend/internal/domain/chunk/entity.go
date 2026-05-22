package chunk

import (
	"time"

	"github.com/google/uuid"
)

type Chunk struct {
	ID         uuid.UUID  `json:"id" db:"id"`
	DocumentID uuid.UUID  `json:"document_id" db:"document_id"`
	ChapterID  *uuid.UUID `json:"chapter_id" db:"chapter_id"`
	Content    string     `json:"content" db:"content"`
	PageLabel  string     `json:"page_label" db:"page_label"`
	ChunkIndex int        `json:"chunk_index" db:"chunk_index"`
	Embedding  []float32  `json:"-" db:"embedding"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
}