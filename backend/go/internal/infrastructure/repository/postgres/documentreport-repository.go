package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/documentreport"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DocumentReportRepository struct {
	pool *pgxpool.Pool
}

func NewDocumentReportRepository(pool *pgxpool.Pool) *DocumentReportRepository {
	return &DocumentReportRepository{pool: pool}
}

func (r *DocumentReportRepository) Create(ctx context.Context, report *documentreport.DocumentReport) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO document_reports (id, document_id, reporter_user_id, reason, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)`,
		report.ID, report.DocumentID, report.ReporterUserID, report.Reason, report.Status, report.CreatedAt,
	)
	return err
}

func (r *DocumentReportRepository) FindByID(ctx context.Context, id uuid.UUID) (*documentreport.DocumentReport, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var report documentreport.DocumentReport
	err := r.pool.QueryRow(ctx,
		`SELECT dr.id, dr.document_id, dr.reporter_user_id, dr.reason, dr.status, dr.created_at,
		        d.title as document_title, d.slug as document_slug, u.email as reporter_email
		FROM document_reports dr
		JOIN documents d ON dr.document_id = d.id
		JOIN users u ON dr.reporter_user_id = u.id
		WHERE dr.id = $1`, id,
	).Scan(&report.ID, &report.DocumentID, &report.ReporterUserID, &report.Reason, &report.Status, &report.CreatedAt, &report.DocumentTitle, &report.DocumentSlug, &report.ReporterEmail)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &report, nil
}

func (r *DocumentReportRepository) FindPending(ctx context.Context) ([]*documentreport.DocumentReport, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT dr.id, dr.document_id, dr.reporter_user_id, dr.reason, dr.status, dr.created_at,
		        d.title as document_title, d.slug as document_slug, u.email as reporter_email
		FROM document_reports dr
		JOIN documents d ON dr.document_id = d.id
		JOIN users u ON dr.reporter_user_id = u.id
		WHERE dr.status = 'pending'
		ORDER BY dr.created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reports []*documentreport.DocumentReport
	for rows.Next() {
		var report documentreport.DocumentReport
		err := rows.Scan(&report.ID, &report.DocumentID, &report.ReporterUserID, &report.Reason, &report.Status, &report.CreatedAt, &report.DocumentTitle, &report.DocumentSlug, &report.ReporterEmail)
		if err != nil {
			return nil, err
		}
		reports = append(reports, &report)
	}
	return reports, nil
}

func (r *DocumentReportRepository) FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*documentreport.DocumentReport, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT dr.id, dr.document_id, dr.reporter_user_id, dr.reason, dr.status, dr.created_at
		FROM document_reports dr
		WHERE dr.document_id = $1`, docID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reports []*documentreport.DocumentReport
	for rows.Next() {
		var report documentreport.DocumentReport
		err := rows.Scan(&report.ID, &report.DocumentID, &report.ReporterUserID, &report.Reason, &report.Status, &report.CreatedAt)
		if err != nil {
			return nil, err
		}
		reports = append(reports, &report)
	}
	return reports, nil
}

func (r *DocumentReportRepository) Update(ctx context.Context, report *documentreport.DocumentReport) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE document_reports SET status = $2 WHERE id = $1`,
		report.ID, report.Status,
	)
	return err
}

func (r *DocumentReportRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM document_reports WHERE id = $1", id)
	return err
}

func (r *DocumentReportRepository) DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM document_reports WHERE document_id = $1", docID)
	return err
}
