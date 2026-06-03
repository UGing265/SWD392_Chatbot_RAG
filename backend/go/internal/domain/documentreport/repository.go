package documentreport

import (
	"context"

	"github.com/google/uuid"
)

type DocumentReportRepository interface {
	Create(ctx context.Context, report *DocumentReport) error
	FindByID(ctx context.Context, id uuid.UUID) (*DocumentReport, error)
	FindPending(ctx context.Context) ([]*DocumentReport, error)
	FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*DocumentReport, error)
	Update(ctx context.Context, report *DocumentReport) error
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error
}
