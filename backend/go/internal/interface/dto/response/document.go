package response

import (
	"time"

	"github.com/google/uuid"
)

type DocumentResponse struct {
	ID             uuid.UUID  `json:"id"`
	FileName       string     `json:"file_name"`
	FileType       string     `json:"file_type"`
	Status         string     `json:"status"`
	ChunkCount     int        `json:"chunk_count"`
	EmbeddingCount int        `json:"embedding_count"`
	UploadedAt     time.Time  `json:"uploaded_at"`
	IndexedAt      *time.Time `json:"indexed_at,omitempty"`
}

type UploadResponse struct {
	DocumentID uuid.UUID `json:"document_id"`
	Status     string    `json:"status"`
	FileName   string    `json:"file_name"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}
