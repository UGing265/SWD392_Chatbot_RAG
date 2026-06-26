package admin_usecase

import (
	"context"
	"errors"
	"math"
	"time"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/document"
)

func (uc *AdminUseCase) GetAdminDocuments(ctx context.Context, query *string, subjectID *uuid.UUID, page, pageSize int) (*application.MyDocumentsDto, error) {
	if pageSize < 5 || pageSize > 100 {
		pageSize = 10
	}
	if page < 1 {
		page = 1
	}

	params := document.FilterParams{
		Query:     query,
		SubjectID: subjectID,
		Page:      page,
		PageSize:  pageSize,
	}

	docs, total, err := uc.docRepo.FindAllAdmin(ctx, params)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages < 1 {
		totalPages = 1
	}

	var documentsList []application.DocumentListItemDto
	for _, d := range docs {
		preview := ""
		if d.Description != nil {
			preview = *d.Description
		}
		documentsList = append(documentsList, application.DocumentListItemDto{
			ID:               d.ID,
			Slug:             *d.Slug,
			Title:            d.Title,
			SubjectID:        d.SubjectID,
			SubjectName:      d.SubjectName,
			SubjectCode:      d.SubjectCode,
			DocumentTypeID:   d.DocumentTypeID,
			DocumentTypeName: d.DocumentTypeName,
			AcademicTermName: d.AcademicTermName,
			Status:           d.Status,
			Visibility:       d.Visibility,
			CreatedAt:        d.CreatedAt,
			UpdatedAt:        d.UpdatedAt,
			ChunkCount:       d.TotalChunks,
			PreviewText:      preview,
			OwnerEmail:       d.OwnerEmail,
			OwnerName:        d.OwnerFullName,
			ViewCount:        d.ViewCount,
		})
	}

	return &application.MyDocumentsDto{
		Documents:         documentsList,
		TotalDocuments:    total,
		PendingDocuments:  0,
		ApprovedDocuments: 0,
		RejectedDocuments: 0,
		Page:              page,
		PageSize:          pageSize,
		TotalPages:        totalPages,
		ActiveUploadJobs:  []application.UploadJobSummaryDto{},
	}, nil
}

func (uc *AdminUseCase) ApproveOrRejectDocument(ctx context.Context, docID uuid.UUID, approve bool) error {
	doc, err := uc.docRepo.FindByID(ctx, docID)
	if err != nil {
		return err
	}
	if doc == nil {
		return errors.New("tài liệu không tồn tại")
	}

	now := time.Now()
	if approve {
		doc.Status = "approved"
		doc.ApprovedAt = &now
	} else {
		doc.Status = "rejected"
		doc.ApprovedAt = nil
	}
	doc.UpdatedAt = now

	return uc.docRepo.Update(ctx, doc)
}
