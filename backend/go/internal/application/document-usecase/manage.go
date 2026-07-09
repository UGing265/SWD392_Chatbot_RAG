package document_usecase

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
)

func (uc *DocumentUseCase) GetDeleteDocumentViewDataBySlug(ctx context.Context, slug string, ownerUserID uuid.UUID) (*application.DeleteDocumentViewData, error) {
	doc, err := uc.docRepo.FindOwnedBySlug(ctx, slug, ownerUserID)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, nil
	}

	fileCount, _ := uc.docRepo.CountFilesByDocument(ctx, doc.ID)
	chunkCount, _ := uc.docRepo.CountChunksByDocument(ctx, doc.ID)

	return &application.DeleteDocumentViewData{
		ID:         doc.ID,
		Title:      doc.Title,
		FileCount:  fileCount,
		ChunkCount: chunkCount,
	}, nil
}

func (uc *DocumentUseCase) DeleteDocument(ctx context.Context, docID uuid.UUID) error {
	doc, err := uc.docRepo.FindByID(ctx, docID)
	if err != nil {
		return err
	}
	if doc == nil {
		return errors.New("document not found")
	}

	// Delete from Upload Jobs
	_ = uc.jobRepo.DeleteByDocumentID(ctx, docID)

	// S3 Asset cleanup
	files, err := uc.fileRepo.FindByDocumentID(ctx, docID)
	if err == nil {
		for _, f := range files {
			key := f.StoragePath
			if f.S3Key != nil && *f.S3Key != "" {
				key = *f.S3Key
			}
			if key != "" {
				_ = uc.s3Storage.Delete(ctx, key)
			}
		}
	}

	// Clean references
	_ = uc.fileRepo.DeleteByDocumentID(ctx, docID)
	_ = uc.chunkRepo.DeleteByDocumentID(ctx, docID)
	_ = uc.chapterRepo.DeleteByDocumentID(ctx, docID)
	_ = uc.reportRepo.DeleteByDocumentID(ctx, docID)

	// Clean document
	return uc.docRepo.Delete(ctx, docID)
}

func (uc *DocumentUseCase) UpdateDocument(ctx context.Context, docID uuid.UUID, ownerUserID uuid.UUID, title string, description *string, subjectID, typeID, termID, langID, sourceID *uuid.UUID, visibility string) error {
	doc, err := uc.docRepo.FindByID(ctx, docID)
	if err != nil {
		return err
	}
	if doc == nil {
		return errors.New("document not found")
	}

	if doc.OwnerUserID != ownerUserID {
		return errors.New("truy cập bị từ chối")
	}

	if subjectID == nil {
		return errors.New("vui long chon mon hoc duoc phan cong")
	}
	if err := uc.EnsureLecturerCanUseSubject(ctx, ownerUserID, *subjectID); err != nil {
		return err
	}

	doc.Title = title
	doc.Description = description
	doc.SubjectID = subjectID
	doc.DocumentTypeID = typeID
	doc.AcademicTermID = termID
	doc.LanguageID = langID
	doc.DocumentSourceID = sourceID
	doc.Visibility = visibility
	doc.UpdatedAt = time.Now()

	return uc.docRepo.Update(ctx, doc)
}

func (uc *DocumentUseCase) EnsureLecturerCanUseSubject(ctx context.Context, lecturerID uuid.UUID, subjectID uuid.UUID) error {
	assignment, err := uc.assignRepo.FindBySubject(ctx, subjectID)
	if err != nil {
		return err
	}
	if assignment == nil {
		return errors.New("mon hoc nay chua duoc phan cong cho giang vien")
	}
	if assignment.UserID != lecturerID {
		return errors.New("giang vien khong duoc phan cong mon hoc nay")
	}
	return nil
}
