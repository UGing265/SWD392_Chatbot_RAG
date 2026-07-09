package document_usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"

	document_usecase "swd392-chatbot-rag/internal/application/document-usecase"
	"swd392-chatbot-rag/internal/domain/document"
)

type mockBookmarkRepo struct {
	document.BookmarkRepository
	ToggleBookmarkFunc         func(ctx context.Context, userID uuid.UUID, docID uuid.UUID) (bool, error)
	GetBookmarkedDocumentsFunc func(ctx context.Context, userID uuid.UUID) ([]*document.Document, error)
}

func (m *mockBookmarkRepo) ToggleBookmark(ctx context.Context, userID uuid.UUID, docID uuid.UUID) (bool, error) {
	if m.ToggleBookmarkFunc != nil {
		return m.ToggleBookmarkFunc(ctx, userID, docID)
	}
	return false, nil
}

func (m *mockBookmarkRepo) GetBookmarkedDocuments(ctx context.Context, userID uuid.UUID) ([]*document.Document, error) {
	if m.GetBookmarkedDocumentsFunc != nil {
		return m.GetBookmarkedDocumentsFunc(ctx, userID)
	}
	return nil, nil
}

func TestToggleBookmark_Success(t *testing.T) {
	ctx := context.Background()
	docID := uuid.New()
	userID := uuid.New()

	docRepo := &mockDocumentRepo{
		FindByIDFunc: func(ctx context.Context, id uuid.UUID) (*document.Document, error) {
			return &document.Document{ID: docID}, nil
		},
	}
	bookmarkRepo := &mockBookmarkRepo{
		ToggleBookmarkFunc: func(ctx context.Context, u uuid.UUID, d uuid.UUID) (bool, error) {
			return true, nil // true = bookmarked
		},
	}

	uc := document_usecase.NewDocumentUseCase(
		docRepo, nil, nil, nil, nil, bookmarkRepo, nil, nil, nil, nil, nil,
	)

	isBookmarked, err := uc.ToggleBookmark(ctx, userID, docID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if !isBookmarked {
		t.Errorf("expected true for bookmarked status")
	}
}

func TestToggleBookmark_DocumentNotFound(t *testing.T) {
	ctx := context.Background()
	docID := uuid.New()
	userID := uuid.New()

	docRepo := &mockDocumentRepo{
		FindByIDFunc: func(ctx context.Context, id uuid.UUID) (*document.Document, error) {
			return nil, errors.New("not found in db")
		},
	}

	uc := document_usecase.NewDocumentUseCase(
		docRepo, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil,
	)

	_, err := uc.ToggleBookmark(ctx, userID, docID)
	if err == nil {
		t.Fatalf("expected error for non-existent document, got nil")
	}
}

func TestListBookmarks_Success(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()

	expectedDocs := []*document.Document{
		{ID: uuid.New(), Title: "Doc 1"},
		{ID: uuid.New(), Title: "Doc 2"},
	}

	bookmarkRepo := &mockBookmarkRepo{
		GetBookmarkedDocumentsFunc: func(ctx context.Context, u uuid.UUID) ([]*document.Document, error) {
			return expectedDocs, nil
		},
	}

	uc := document_usecase.NewDocumentUseCase(
		nil, nil, nil, nil, nil, bookmarkRepo, nil, nil, nil, nil, nil,
	)

	docs, err := uc.ListBookmarks(ctx, userID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(docs) != 2 {
		t.Errorf("expected 2 documents, got %d", len(docs))
	}
}
