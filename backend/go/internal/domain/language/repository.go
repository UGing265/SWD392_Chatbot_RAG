package language

import (
	"context"

	"github.com/google/uuid"
)

type LanguageRepository interface {
	Create(ctx context.Context, lang *Language) error
	FindByID(ctx context.Context, id uuid.UUID) (*Language, error)
	FindAll(ctx context.Context) ([]*Language, error)
	Update(ctx context.Context, lang *Language) error
	Delete(ctx context.Context, id uuid.UUID) error
}
