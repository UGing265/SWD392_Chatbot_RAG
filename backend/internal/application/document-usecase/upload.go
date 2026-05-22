package document_usecase

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"

	"github.com/google/uuid"
)

var (
	ErrInvalidCourseID  = errors.New("invalid course_id")
	ErrInvalidChapterID = errors.New("invalid chapter_id")
)

type UploadDocumentUseCase struct {
	docRepo     document.DocumentRepository
	fileStorage *filestorage.LocalFileStorage
	indexer     Indexer
}

// Indexer is the interface for background indexing
type Indexer interface {
	ProcessDocument(ctx context.Context, docID uuid.UUID) error
}

func NewUploadDocumentUseCase(
	docRepo document.DocumentRepository,
	fileStorage *filestorage.LocalFileStorage,
	indexer Indexer,
) *UploadDocumentUseCase {
	return &UploadDocumentUseCase{
		docRepo:     docRepo,
		fileStorage: fileStorage,
		indexer:     indexer,
	}
}

type UploadParams struct {
	UserID    uuid.UUID
	CourseID  uuid.UUID
	ChapterID *uuid.UUID
	File      io.Reader
	FileName  string
	FileSize  int64
	MIMEType  string
}

type UploadResult struct {
	DocumentID uuid.UUID
	FileName   string
	FileType   string
	Status     string
	FilePath   string
}

func (uc *UploadDocumentUseCase) Execute(ctx context.Context, params UploadParams) (*UploadResult, error) {
	if params.FileSize > filestorage.MaxFileSize {
		return nil, filestorage.ErrFileTooLarge
	}

	if !filestorage.ValidateMIMEType(params.MIMEType) {
		return nil, filestorage.ErrInvalidMIMEType
	}

	filePath, err := uc.fileStorage.Save(params.File, params.CourseID, params.FileName, params.MIMEType)
	if err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	ext, _ := filestorage.GetExtensionFromMIME(params.MIMEType)
	doc := &document.Document{
		ID:         uuid.New(),
		UserID:     params.UserID,
		CourseID:   params.CourseID,
		ChapterID:  params.ChapterID,
		FileName:   params.FileName,
		FileType:   strings.TrimPrefix(ext, "."),
		FilePath:   filePath,
		Status:     document.StatusUploading,
		UploadedAt: time.Now(),
	}

	if err := uc.docRepo.Create(doc); err != nil {
		uc.fileStorage.Delete(filePath)
		return nil, fmt.Errorf("failed to save document: %w", err)
	}

	// Spawn background indexing
	if uc.indexer != nil {
		go func() {
			bgCtx := context.Background()
			if err := uc.indexer.ProcessDocument(bgCtx, doc.ID); err != nil {
				log.Printf("indexing error for doc %s: %v", doc.ID, err)
			}
		}()
	}

	return &UploadResult{
		DocumentID: doc.ID,
		FileName:   doc.FileName,
		FileType:   doc.FileType,
		Status:     doc.Status,
		FilePath:   doc.FilePath,
	}, nil
}