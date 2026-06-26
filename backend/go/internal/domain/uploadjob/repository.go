package uploadjob

import (
	"context"

	"github.com/google/uuid"
)

type UploadJobRepository interface {
	Create(ctx context.Context, job *UploadJob) error
	FindByID(ctx context.Context, id uuid.UUID) (*UploadJob, error)
	GetNextPendingJob(ctx context.Context) (*UploadJob, error)
	FindActiveByOwner(ctx context.Context, ownerID uuid.UUID) ([]*UploadJob, error)
	GetRecentJobsByUser(ctx context.Context, ownerID uuid.UUID) ([]*UploadJob, error)
	Update(ctx context.Context, job *UploadJob) error
	DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error
}
