package subject

import (
	"context"

	"github.com/google/uuid"
)

type SubjectRepository interface {
	Create(ctx context.Context, sub *Subject) error
	FindByID(ctx context.Context, id uuid.UUID) (*Subject, error)
	FindAll(ctx context.Context) ([]*Subject, error)
	FindAllPublic(ctx context.Context) ([]*Subject, error)
	FindAllByOwner(ctx context.Context, ownerID uuid.UUID) ([]*Subject, error)
	Update(ctx context.Context, sub *Subject) error
	Delete(ctx context.Context, id uuid.UUID) error
}
