package document_usecase

import (
	"context"
	"errors"

	"swd392-chatbot-rag/internal/domain/document"

	"github.com/google/uuid"
)

var ErrDocumentNotFound = errors.New("document not found")

type GetDocumentUseCase struct {
	docRepo document.DocumentRepository
}

func NewGetDocumentUseCase(docRepo document.DocumentRepository) *GetDocumentUseCase {
	return &GetDocumentUseCase{docRepo: docRepo}
}

func (uc *GetDocumentUseCase) Execute(ctx context.Context, docID uuid.UUID) (*document.Document, error) {
	doc, err := uc.docRepo.FindByID(docID)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, ErrDocumentNotFound
	}
	return doc, nil
}