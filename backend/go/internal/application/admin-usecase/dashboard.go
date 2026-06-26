package admin_usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/document"
)

func (uc *AdminUseCase) GetDashboardSummary(ctx context.Context, ownerUserID uuid.UUID) (*application.DashboardSummaryDto, error) {
	recentDocs, _, err := uc.docRepo.FindAllOwned(ctx, ownerUserID, document.FilterParams{Page: 1, PageSize: 5})
	if err != nil {
		recentDocs = nil
	}

	activeJobs, err := uc.jobRepo.FindActiveByOwner(ctx, ownerUserID)
	if err != nil {
		activeJobs = nil
	}

	var completedMessage *string
	for _, j := range activeJobs {
		if j.Status == "done" {
			msg := fmt.Sprintf("Tệp \"%s\" đã xử lý xong.", j.FileName)
			completedMessage = &msg
			break
		}
	}

	var recentDocsDto []application.DashboardRecentDocumentDto
	for _, d := range recentDocs {
		subName := d.SubjectName
		recentDocsDto = append(recentDocsDto, application.DashboardRecentDocumentDto{
			ID:         d.ID,
			Slug:       *d.Slug,
			Title:      d.Title,
			Subject:    subName,
			Status:     d.Status,
			UpdatedAt:  d.UpdatedAt,
			FileCount:  0, // file repo details or left 0
			ChunkCount: d.TotalChunks,
		})
	}

	var activeJobsDto []application.UploadJobSummaryDto
	for _, j := range activeJobs {
		activeJobsDto = append(activeJobsDto, application.UploadJobSummaryDto{
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

	totalDocs, totalCount, _ := uc.docRepo.FindAllOwned(ctx, ownerUserID, document.FilterParams{Page: 1, PageSize: 1})
	if totalDocs == nil {
		totalCount = 0
	}

	pending, _ := uc.docRepo.CountByStatus(ctx, ownerUserID, "pending")
	approved, _ := uc.docRepo.CountByStatus(ctx, ownerUserID, "approved")
	rejected, _ := uc.docRepo.CountByStatus(ctx, ownerUserID, "rejected")
	totalFiles, _ := uc.docRepo.CountFilesByOwner(ctx, ownerUserID)
	totalChunks, _ := uc.docRepo.CountChunksByOwner(ctx, ownerUserID)

	return &application.DashboardSummaryDto{
		TotalDocuments:         totalCount,
		TotalChunks:            totalChunks,
		TotalFiles:             totalFiles,
		ApprovedDocuments:      approved,
		PendingDocuments:       pending,
		RejectedDocuments:      rejected,
		RecentDocuments:        recentDocsDto,
		ActiveUploadJobs:       activeJobsDto,
		CompletedUploadMessage: completedMessage,
	}, nil
}
