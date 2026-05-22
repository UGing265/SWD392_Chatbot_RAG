package document_usecase

import (
	"context"

	"swd392-chatbot-rag/internal/domain/document"

	"github.com/google/uuid"
)

type ListDocumentsUseCase struct {
	docRepo document.DocumentRepository
}

func NewListDocumentsUseCase(docRepo document.DocumentRepository) *ListDocumentsUseCase {
	return &ListDocumentsUseCase{docRepo: docRepo}
}

func (uc *ListDocumentsUseCase) Execute(ctx context.Context, userID uuid.UUID) ([]*document.Document, error) {
	return uc.docRepo.FindByUserID(userID)
}