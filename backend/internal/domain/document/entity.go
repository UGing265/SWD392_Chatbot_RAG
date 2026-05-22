package document

import (
	"time"

	"github.com/google/uuid"
)

type Document struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	UserID         uuid.UUID  `json:"user_id" db:"user_id"`
	CourseID       uuid.UUID  `json:"course_id" db:"course_id"`
	ChapterID      *uuid.UUID `json:"chapter_id" db:"chapter_id"`
	FileName       string     `json:"file_name" db:"file_name"`
	FileType       string     `json:"file_type" db:"file_type"`
	FilePath       string     `json:"-" db:"file_path"`
	Status         string     `json:"status" db:"status"`
	ChunkCount     int        `json:"chunk_count" db:"chunk_count"`
	EmbeddingCount int        `json:"embedding_count" db:"embedding_count"`
	ErrorMessage   *string    `json:"error_message,omitempty" db:"error_message"`
	UploadedAt     time.Time  `json:"uploaded_at" db:"uploaded_at"`
	IndexedAt      *time.Time `json:"indexed_at,omitempty" db:"indexed_at"`
}

const (
	StatusUploading  = "uploading"
	StatusChunking   = "chunking"
	StatusEmbedding  = "embedding"
	StatusIndexed    = "indexed"
	StatusError      = "error"
)