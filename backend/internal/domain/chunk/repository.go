package chunk

import (
	"context"

	"github.com/google/uuid"
)

type ChunkRepository interface {
	Create(ctx context.Context, chunk *Chunk) error
	CreateBatch(ctx context.Context, chunks []*Chunk) error
	FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*Chunk, error)
	DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error
	UpdateChapterIDRange(ctx context.Context, docID uuid.UUID, startOrder int, endOrder int, chapterID uuid.UUID) error
}