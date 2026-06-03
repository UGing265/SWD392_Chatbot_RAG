package documenttype

import (
	"context"

	"github.com/google/uuid"
)

type DocumentTypeRepository interface {
	Create(ctx context.Context, docType *DocumentType) error
	FindByID(ctx context.Context, id uuid.UUID) (*DocumentType, error)
	FindAll(ctx context.Context) ([]*DocumentType, error)
	Update(ctx context.Context, docType *DocumentType) error
	Delete(ctx context.Context, id uuid.UUID) error
}
