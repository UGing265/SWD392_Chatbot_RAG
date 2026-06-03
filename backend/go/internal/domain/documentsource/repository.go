package documentsource

import (
	"context"

	"github.com/google/uuid"
)

type DocumentSourceRepository interface {
	Create(ctx context.Context, source *DocumentSource) error
	FindByID(ctx context.Context, id uuid.UUID) (*DocumentSource, error)
	FindAll(ctx context.Context) ([]*DocumentSource, error)
	Update(ctx context.Context, source *DocumentSource) error
	Delete(ctx context.Context, id uuid.UUID) error
}
