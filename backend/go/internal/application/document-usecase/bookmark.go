package document_usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/domain/document"
)

func (uc *DocumentUseCase) ToggleBookmark(ctx context.Context, userID uuid.UUID, docID uuid.UUID) (bool, error) {
	// First, check if the document exists
	_, err := uc.docRepo.FindByID(ctx, docID)
	if err != nil {
		return false, fmt.Errorf("document not found or error checking document: %w", err)
	}

	return uc.bookmarkRepo.ToggleBookmark(ctx, userID, docID)
}

func (uc *DocumentUseCase) ListBookmarks(ctx context.Context, userID uuid.UUID) ([]*document.Document, error) {
	return uc.bookmarkRepo.GetBookmarkedDocuments(ctx, userID)
}
