package document

import (
	"context"

	"github.com/google/uuid"
)

type BookmarkRepository interface {
	ToggleBookmark(ctx context.Context, userID uuid.UUID, docID uuid.UUID) (bool, error)
	GetBookmarkedDocuments(ctx context.Context, userID uuid.UUID) ([]*Document, error)
}
