package document_usecase

import (
	"context"
	"errors"

	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"

	"github.com/google/uuid"
)

var ErrDocumentDeleteFailed = errors.New("failed to delete document")

type DeleteDocumentUseCase struct {
	docRepo     document.DocumentRepository
	chunkRepo   chunk.ChunkRepository
	fileStorage FileStorage
}

type FileStorage interface {
	Delete(filePath string) error
}

func NewDeleteDocumentUseCase(
	docRepo document.DocumentRepository,
	chunkRepo chunk.ChunkRepository,
	fileStorage FileStorage,
) *DeleteDocumentUseCase {
	return &DeleteDocumentUseCase{
		docRepo:     docRepo,
		chunkRepo:   chunkRepo,
		fileStorage: fileStorage,
	}
}

func (uc *DeleteDocumentUseCase) Execute(ctx context.Context, docID uuid.UUID, userID uuid.UUID) error {
	// Get document to verify ownership and get file path
	doc, err := uc.docRepo.FindByID(docID)
	if err != nil {
		return err
	}
	if doc == nil {
		return ErrDocumentNotFound
	}

	// Verify ownership
	if doc.UserID != userID {
		return ErrAccessDenied
	}

	// Delete file from storage
	if uc.fileStorage != nil && doc.FilePath != "" {
		if err := uc.fileStorage.Delete(doc.FilePath); err != nil {
			// Log but continue with database deletion
		}
	}

	// Delete chunks first (foreign key constraint)
	if err := uc.chunkRepo.DeleteByDocumentID(ctx, docID); err != nil {
		return err
	}

	// Delete document
	if err := uc.docRepo.Delete(docID); err != nil {
		return ErrDocumentDeleteFailed
	}

	return nil
}