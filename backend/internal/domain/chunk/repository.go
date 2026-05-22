package chunk

import (
	"github.com/google/uuid"
)

type ChunkRepository interface {
	Create(chunk *Chunk) error
	CreateBatch(chunks []*Chunk) error
	FindByDocumentID(docID uuid.UUID) ([]*Chunk, error)
	FindByCourseID(courseID uuid.UUID) ([]*Chunk, error)
	Search(courseID uuid.UUID, queryVector []float32, topK int) ([]*Chunk, error)
	DeleteByDocumentID(docID uuid.UUID) error
}