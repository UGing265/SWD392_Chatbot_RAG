package admin_usecase

import (
	"context"

	"swd392-chatbot-rag/internal/domain/auditlog"
)

func (uc *AdminUseCase) GetAuditLogs(ctx context.Context, page, pageSize int) ([]*auditlog.AuditLog, error) {
	return uc.auditRepo.FindAll(ctx, page, pageSize)
}
