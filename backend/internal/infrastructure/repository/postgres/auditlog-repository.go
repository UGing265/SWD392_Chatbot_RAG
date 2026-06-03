package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/auditlog"

	"github.com/jackc/pgx/v5/pgxpool"
)

type AuditLogRepository struct {
	pool *pgxpool.Pool
}

func NewAuditLogRepository(pool *pgxpool.Pool) *AuditLogRepository {
	return &AuditLogRepository{pool: pool}
}

func (r *AuditLogRepository) Create(ctx context.Context, log *auditlog.AuditLog) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO audit_logs (id, user_id, action, target_table, target_id, ip_address, description, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		log.ID, log.UserID, log.Action, log.TargetTable, log.TargetID, log.IPAddress, log.Description, log.CreatedAt,
	)
	return err
}

func (r *AuditLogRepository) FindAll(ctx context.Context) ([]*auditlog.AuditLog, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, user_id, action, target_table, target_id, ip_address, description, created_at
		FROM audit_logs ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*auditlog.AuditLog
	for rows.Next() {
		var log auditlog.AuditLog
		err := rows.Scan(&log.ID, &log.UserID, &log.Action, &log.TargetTable, &log.TargetID, &log.IPAddress, &log.Description, &log.CreatedAt)
		if err != nil {
			return nil, err
		}
		logs = append(logs, &log)
	}
	return logs, nil
}
