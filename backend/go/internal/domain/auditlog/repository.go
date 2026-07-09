package auditlog

import (
	"context"
)

type AuditLogRepository interface {
	Create(ctx context.Context, log *AuditLog) error
	FindAll(ctx context.Context, page, pageSize int) ([]*AuditLog, error)
}
