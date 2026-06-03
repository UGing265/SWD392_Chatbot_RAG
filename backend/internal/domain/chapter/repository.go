package chapter

import (
	"context"

	"github.com/google/uuid"
)

type ChapterRepository interface {
	Create(ctx context.Context, chapter *Chapter) error
	CreateBatch(ctx context.Context, chapters []*Chapter) error
	FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*Chapter, error)
	DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error
}