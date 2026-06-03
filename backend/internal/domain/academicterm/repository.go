package academicterm

import (
	"context"

	"github.com/google/uuid"
)

type AcademicTermRepository interface {
	Create(ctx context.Context, term *AcademicTerm) error
	FindByID(ctx context.Context, id uuid.UUID) (*AcademicTerm, error)
	FindAll(ctx context.Context) ([]*AcademicTerm, error)
	Update(ctx context.Context, term *AcademicTerm) error
	Delete(ctx context.Context, id uuid.UUID) error
}
