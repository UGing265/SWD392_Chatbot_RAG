package document_usecase

import (
	"context"
	"errors"
	"math"
	"time"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"
)

func (uc *DocumentUseCase) GetDocumentDetails(ctx context.Context, docID uuid.UUID, chunkPage, chunkPageSize int, incrementViewCount bool) (*application.DocumentDetailsDto, error) {
	doc, err := uc.docRepo.FindByID(ctx, docID)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, nil
	}

	files, err := uc.fileRepo.FindByDocumentID(ctx, docID)
	if err != nil {
		return nil, err
	}

	chapters, err := uc.chapterRepo.FindByDocumentID(ctx, docID)
	if err != nil {
		return nil, err
	}

	chunks, err := uc.chunkRepo.FindByDocumentID(ctx, docID)
	if err != nil {
		return nil, err
	}

	// Clamp pagination
	if chunkPageSize < 8 || chunkPageSize > 10 {
		chunkPageSize = 10
	}
	totalChunks := len(chunks)
	totalPages := int(math.Ceil(float64(totalChunks) / float64(chunkPageSize)))
	if totalPages < 1 {
		totalPages = 1
	}
	if chunkPage < 1 {
		chunkPage = 1
	}
	if chunkPage > totalPages {
		chunkPage = totalPages
	}

	startIndex := (chunkPage - 1) * chunkPageSize
	endIndex := startIndex + chunkPageSize
	if endIndex > totalChunks {
		endIndex = totalChunks
	}

	var pageChunks []*chunk.Chunk
	if startIndex < totalChunks {
		pageChunks = chunks[startIndex:endIndex]
	}

	// Increment view count if first page load
	if incrementViewCount && chunkPage == 1 {
		doc.ViewCount++
		doc.UpdatedAt = time.Now()
		_ = uc.docRepo.Update(ctx, doc)
	}

	// Maps DTOs
	var filesDto []application.DocumentFileDto
	for _, f := range files {
		filesDto = append(filesDto, application.DocumentFileDto{
			ID:               f.ID,
			DocumentID:       f.DocumentID,
			OriginalFilename: f.OriginalFilename,
			StoragePath:      f.StoragePath,
			S3Key:            f.S3Key,
			FileUrl:          f.FileUrl,
			MimeType:         f.MimeType,
			FileSizeBytes:    f.FileSizeBytes,
			PageCount:        f.PageCount,
			ExtractionStatus: f.ExtractionStatus,
			CreatedAt:        f.CreatedAt,
		})
	}

	var chaptersDto []application.DocumentChapterDto
	for _, c := range chapters {
		chaptersDto = append(chaptersDto, application.DocumentChapterDto{
			ID:              c.ID,
			DocumentID:      c.DocumentID,
			ParentChapterID: c.ParentChapterID,
			Title:           c.Title,
			Summary:         c.Summary,
			ChapterOrder:    c.ChapterOrder,
			StartPage:       c.StartPage,
			EndPage:         c.EndPage,
			StartChunkIndex: c.StartChunkIndex,
			EndChunkIndex:   c.EndChunkIndex,
			IsAiGenerated:   c.IsAIGenerated,
			ConfidenceScore: c.ConfidenceScore,
			CreatedAt:       c.CreatedAt,
		})
	}

	var chunksDto []application.DocumentChunkDto
	for _, ch := range pageChunks {
		hashVal := ""
		if ch.ChunkHash != nil {
			hashVal = *ch.ChunkHash
		}
		chunksDto = append(chunksDto, application.DocumentChunkDto{
			ID:            ch.ID,
			DocumentID:    ch.DocumentID,
			ChapterID:     ch.ChapterID,
			ChunkOrder:    ch.ChunkOrder,
			PageNumber:    ch.PageNumber,
			Content:       ch.Content,
			ContentTokens: ch.ContentTokens,
			Metadata:      ch.Metadata,
			ChunkHash:     hashVal,
			HasEmbedding:  len(ch.Embedding) > 0,
			CreatedAt:     ch.CreatedAt,
		})
	}

	return &application.DocumentDetailsDto{
		ID:                 doc.ID,
		OwnerUserID:        doc.OwnerUserID,
		OwnerFullName:      doc.OwnerFullName,
		Title:              doc.Title,
		SubjectID:          doc.SubjectID,
		SubjectName:        doc.SubjectName,
		SubjectCode:        doc.SubjectCode,
		DocumentTypeID:     doc.DocumentTypeID,
		DocumentTypeName:   doc.DocumentTypeName,
						DocumentSourceID:   doc.DocumentSourceID,
		DocumentSourceName: doc.DocumentSourceName,
		Visibility:         doc.Visibility,
		LanguageID:         doc.LanguageID,
		LanguageCode:       doc.LanguageCode,
		LanguageName:       doc.LanguageName,
		Description:        doc.Description,
		Status:             doc.Status,
		TotalChunks:        doc.TotalChunks,
		TotalChapters:      doc.TotalChapters,
		ViewCount:          doc.ViewCount,
		DownloadCount:      doc.DownloadCount,
		ApprovedAt:         doc.ApprovedAt,
		FileCount:          len(files),
		Files:              filesDto,
		Chapters:           chaptersDto,
		Chunks:             chunksDto,
	}, nil
}

func (uc *DocumentUseCase) GetDocumentDetailsBySlug(ctx context.Context, slug string, requesterUserID *uuid.UUID, chunkPage, chunkPageSize int, incrementViewCount bool, isAdmin bool) (*application.DocumentDetailsDto, error) {
	doc, err := uc.docRepo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, nil
	}

	// Visibility verification
	if !isAdmin {
		if doc.Visibility == "private" {
			if requesterUserID == nil || *requesterUserID != doc.OwnerUserID {
				return nil, errors.New("truy cập bị từ chối")
			}
		}
	}

	return uc.GetDocumentDetails(ctx, doc.ID, chunkPage, chunkPageSize, incrementViewCount)
}

func (uc *DocumentUseCase) GetOwnedDocumentDetailsBySlug(ctx context.Context, slug string, ownerUserID uuid.UUID) (*application.DocumentDetailsDto, error) {
	doc, err := uc.docRepo.FindOwnedBySlug(ctx, slug, ownerUserID)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, nil
	}
	return uc.GetDocumentDetails(ctx, doc.ID, 1, 10, false)
}

func (uc *DocumentUseCase) GetMyDocuments(ctx context.Context, ownerUserID uuid.UUID, query *string, subjectID *uuid.UUID, sortBy *string, typeID *uuid.UUID, langID *uuid.UUID, sourceID *uuid.UUID, page, pageSize int) (*application.MyDocumentsDto, error) {
	if pageSize < 6 || pageSize > 12 {
		pageSize = 6
	}
	if page < 1 {
		page = 1
	}

	params := document.FilterParams{
		Query:            query,
		SubjectID:        subjectID,
				DocumentTypeID:   typeID,
		LanguageID:       langID,
		DocumentSourceID: sourceID,
		SortBy:           sortBy,
		Page:             page,
		PageSize:         pageSize,
	}

	docs, total, err := uc.docRepo.FindAllOwned(ctx, ownerUserID, params)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages < 1 {
		totalPages = 1
	}

	activeJobs, err := uc.jobRepo.FindActiveByOwner(ctx, ownerUserID)
	if err != nil {
		activeJobs = nil
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
						Status:           d.Status,
			Visibility:       d.Visibility,
			CreatedAt:        d.CreatedAt,
			UpdatedAt:        d.UpdatedAt,
			FileCount:        0, // Managed by detail query or counted later
			ChunkCount:       d.TotalChunks,
			PreviewText:      preview,
			OwnerEmail:       d.OwnerEmail,
			OwnerName:        d.OwnerFullName,
			ViewCount:        d.ViewCount,
		})
	}

	var jobsDto []application.UploadJobSummaryDto
	for _, j := range activeJobs {
		jobsDto = append(jobsDto, application.UploadJobSummaryDto{
			ID:              j.ID,
			DocumentID:      j.DocumentID,
			FileName:        j.FileName,
			FileSizeBytes:   j.FileSizeBytes,
			Status:          j.Status,
			ProgressPercent: j.ProgressPercent,
			Message:         j.Message,
			CreatedAt:       j.CreatedAt,
			UpdatedAt:       j.UpdatedAt,
		})
	}

	pending, _ := uc.docRepo.CountByStatus(ctx, ownerUserID, "pending")
	approved, _ := uc.docRepo.CountByStatus(ctx, ownerUserID, "approved")
	rejected, _ := uc.docRepo.CountByStatus(ctx, ownerUserID, "rejected")
	totalFiles, _ := uc.docRepo.CountFilesByOwner(ctx, ownerUserID)
	totalChunks, _ := uc.docRepo.CountChunksByOwner(ctx, ownerUserID)

	return &application.MyDocumentsDto{
		Documents:         documentsList,
		TotalDocuments:    total,
		PendingDocuments:  pending,
		ApprovedDocuments: approved,
		RejectedDocuments: rejected,
		TotalFiles:        totalFiles,
		TotalChunks:       totalChunks,
		Page:              page,
		PageSize:          pageSize,
		TotalPages:        totalPages,
		ActiveUploadJobs:  jobsDto,
	}, nil
}

func (uc *DocumentUseCase) GetAllDocuments(ctx context.Context, query *string, subjectID *uuid.UUID, page, pageSize int, requesterUserID *uuid.UUID, sortBy *string, typeID *uuid.UUID, langID *uuid.UUID, sourceID *uuid.UUID) (*application.MyDocumentsDto, error) {
	if pageSize < 6 || pageSize > 12 {
		pageSize = 6
	}
	if page < 1 {
		page = 1
	}

	params := document.FilterParams{
		Query:            query,
		SubjectID:        subjectID,
		DocumentTypeID:   typeID,
		LanguageID:       langID,
		DocumentSourceID: sourceID,
		SortBy:           sortBy,
		Page:             page,
		PageSize:         pageSize,
	}

	docs, total, err := uc.docRepo.FindAllPublic(ctx, params, requesterUserID)
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
