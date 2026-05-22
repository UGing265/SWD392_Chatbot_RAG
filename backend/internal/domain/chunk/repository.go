package chunk

import (
	"context"

	"github.com/google/uuid"
)

type ChunkWithScore struct {
	Chunk         *Chunk
	RelevanceScore float64
}

type ChunkRepository interface {
	Create(ctx context.Context, chunk *Chunk) error
	CreateBatch(ctx context.Context, chunks []*Chunk) error
	FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*Chunk, error)
	FindByCourseID(ctx context.Context, courseID uuid.UUID) ([]*Chunk, error)
	Search(ctx context.Context, courseID uuid.UUID, queryVector []float32, topK int) ([]*ChunkWithScore, error)
	DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error
}