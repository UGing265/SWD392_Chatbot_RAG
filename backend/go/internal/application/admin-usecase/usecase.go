package admin_usecase

import (
	"context"
	"swd392-chatbot-rag/internal/domain/auditlog"
	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/domain/documentfile"
	"swd392-chatbot-rag/internal/domain/documentreport"
	"swd392-chatbot-rag/internal/domain/uploadjob"
	"swd392-chatbot-rag/internal/domain/user"

	"github.com/google/uuid"
)

type AdminUseCase struct {
	docRepo    document.DocumentRepository
	reportRepo documentreport.DocumentReportRepository
	userRepo   user.UserRepository
	auditRepo  auditlog.AuditLogRepository
	jobRepo    uploadjob.UploadJobRepository
	chunkRepo  chunk.ChunkRepository
	fileRepo   documentfile.DocumentFileRepository
	docUseCase interface {
		DeleteDocument(ctx context.Context, id uuid.UUID) error
	}
}

func NewAdminUseCase(
	docRepo document.DocumentRepository, reportRepo documentreport.DocumentReportRepository, userRepo user.UserRepository, auditRepo auditlog.AuditLogRepository, jobRepo uploadjob.UploadJobRepository, chunkRepo chunk.ChunkRepository, fileRepo documentfile.DocumentFileRepository, docUseCase interface {
		DeleteDocument(ctx context.Context, id uuid.UUID) error
	},
) *AdminUseCase {
	return &AdminUseCase{
		docRepo:    docRepo,
		reportRepo: reportRepo,
		userRepo:   userRepo,
		auditRepo:  auditRepo,
		jobRepo:    jobRepo,
		chunkRepo:  chunkRepo,
		fileRepo:   fileRepo,
		docUseCase: docUseCase,
	}
}
