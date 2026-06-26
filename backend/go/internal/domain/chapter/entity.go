package chapter

import (
	"time"

	"github.com/google/uuid"
)

type Chapter struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	DocumentID      uuid.UUID  `json:"document_id" db:"document_id"`
	ParentChapterID *uuid.UUID `json:"parent_chapter_id,omitempty" db:"parent_chapter_id"`
	Title           string     `json:"title" db:"title"`
	Summary         *string    `json:"summary,omitempty" db:"summary"`
	ChapterOrder    int        `json:"chapter_order" db:"chapter_order"`
	StartPage       *int       `json:"start_page,omitempty" db:"start_page"`
	EndPage         *int       `json:"end_page,omitempty" db:"end_page"`
	StartChunkIndex *int       `json:"start_chunk_index,omitempty" db:"start_chunk_index"`
	EndChunkIndex   *int       `json:"end_chunk_index,omitempty" db:"end_chunk_index"`
	IsAIGenerated   bool       `json:"is_ai_generated" db:"is_ai_generated"`
	ConfidenceScore *float64   `json:"confidence_score,omitempty" db:"confidence_score"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
}
