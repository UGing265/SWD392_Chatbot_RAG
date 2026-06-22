package lecturersubject

import (
	"context"

	"github.com/google/uuid"
)

type AssignmentRepository interface {
	FindAll(ctx context.Context) ([]*Assignment, error)
	FindByLecturer(ctx context.Context, lecturerID uuid.UUID) ([]*Assignment, error)
	FindBySubject(ctx context.Context, subjectID uuid.UUID) (*Assignment, error)
	ReplaceForLecturer(ctx context.Context, lecturerID uuid.UUID, subjectIDs []uuid.UUID) error
}
