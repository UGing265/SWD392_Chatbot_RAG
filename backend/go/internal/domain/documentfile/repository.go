package documentfile

import (
	"context"

	"github.com/google/uuid"
)

type DocumentFileRepository interface {
	Create(ctx context.Context, file *DocumentFile) error
	FindByID(ctx context.Context, id uuid.UUID) (*DocumentFile, error)
	FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*DocumentFile, error)
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error
}
