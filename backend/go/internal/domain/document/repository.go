package document

import (
	"context"

	"github.com/google/uuid"
)

type FilterParams struct {
	Query             *string
	SubjectIDs        []uuid.UUID
	DocumentTypeIDs   []uuid.UUID
	LanguageIDs       []uuid.UUID
	DocumentSourceIDs []uuid.UUID
	SortBy            *string
	Page              int
	PageSize          int
}

type DocumentRepository interface {
	Create(ctx context.Context, doc *Document) error
	FindByID(ctx context.Context, id uuid.UUID) (*Document, error)
	FindBySlug(ctx context.Context, slug string) (*Document, error)
	FindOwnedBySlug(ctx context.Context, slug string, ownerID uuid.UUID) (*Document, error)
	FindAllPublic(ctx context.Context, params FilterParams, requesterID *uuid.UUID) ([]*Document, int, error)
	FindAllOwned(ctx context.Context, ownerID uuid.UUID, params FilterParams) ([]*Document, int, error)
	FindAllAdmin(ctx context.Context, params FilterParams) ([]*Document, int, error)
	ExistsByMd5(ctx context.Context, md5 string) (bool, error)
	Update(ctx context.Context, doc *Document) error
	Delete(ctx context.Context, id uuid.UUID) error
	CountByStatus(ctx context.Context, ownerID uuid.UUID, status string) (int, error)
	CountFilesByOwner(ctx context.Context, ownerID uuid.UUID) (int, error)
	CountChunksByOwner(ctx context.Context, ownerID uuid.UUID) (int, error)
	CountFilesByDocument(ctx context.Context, docID uuid.UUID) (int, error)
	CountChunksByDocument(ctx context.Context, docID uuid.UUID) (int, error)
}
