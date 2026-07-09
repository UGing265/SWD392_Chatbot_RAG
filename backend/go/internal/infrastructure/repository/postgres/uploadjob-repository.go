package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/uploadjob"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UploadJobRepository struct {
	pool *pgxpool.Pool
}

func NewUploadJobRepository(pool *pgxpool.Pool) *UploadJobRepository {
	return &UploadJobRepository{pool: pool}
}

func (r *UploadJobRepository) Create(ctx context.Context, job *uploadjob.UploadJob) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO upload_jobs (id, owner_user_id, document_id, file_name, file_size_bytes, status, progress_percent, message, storage_path, is_notified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
		job.ID, job.OwnerUserID, job.DocumentID, job.FileName, job.FileSizeBytes, job.Status, job.ProgressPercent, job.Message, job.StoragePath, job.IsNotified, job.CreatedAt, job.UpdatedAt,
	)
	return err
}

func (r *UploadJobRepository) FindByID(ctx context.Context, id uuid.UUID) (*uploadjob.UploadJob, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var job uploadjob.UploadJob
	err := r.pool.QueryRow(ctx,
		`SELECT id, owner_user_id, document_id, file_name, file_size_bytes, status, progress_percent, message, storage_path, is_notified, created_at, updated_at
		FROM upload_jobs WHERE id = $1`, id,
	).Scan(&job.ID, &job.OwnerUserID, &job.DocumentID, &job.FileName, &job.FileSizeBytes, &job.Status, &job.ProgressPercent, &job.Message, &job.StoragePath, &job.IsNotified, &job.CreatedAt, &job.UpdatedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &job, nil
}

func (r *UploadJobRepository) GetNextPendingJob(ctx context.Context) (*uploadjob.UploadJob, error) {
	// Không set timeout quá ngắn để tránh cancel query dài
	var job uploadjob.UploadJob
	err := r.pool.QueryRow(ctx,
		`SELECT id, owner_user_id, document_id, file_name, file_size_bytes, status, progress_percent, message, storage_path, is_notified, created_at, updated_at
		FROM upload_jobs WHERE status = 'pending'
		ORDER BY created_at ASC LIMIT 1`,
	).Scan(&job.ID, &job.OwnerUserID, &job.DocumentID, &job.FileName, &job.FileSizeBytes, &job.Status, &job.ProgressPercent, &job.Message, &job.StoragePath, &job.IsNotified, &job.CreatedAt, &job.UpdatedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &job, nil
}

func (r *UploadJobRepository) FindActiveByOwner(ctx context.Context, ownerID uuid.UUID) ([]*uploadjob.UploadJob, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, owner_user_id, document_id, file_name, file_size_bytes, status, progress_percent, message, storage_path, is_notified, created_at, updated_at
		FROM upload_jobs 
		WHERE owner_user_id = $1 AND status IN ('pending', 'processing')
		ORDER BY updated_at DESC LIMIT 10`,
		ownerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*uploadjob.UploadJob
	for rows.Next() {
		var job uploadjob.UploadJob
		err := rows.Scan(&job.ID, &job.OwnerUserID, &job.DocumentID, &job.FileName, &job.FileSizeBytes, &job.Status, &job.ProgressPercent, &job.Message, &job.StoragePath, &job.IsNotified, &job.CreatedAt, &job.UpdatedAt)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, &job)
	}
	return jobs, nil
}

func (r *UploadJobRepository) Update(ctx context.Context, job *uploadjob.UploadJob) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE upload_jobs SET document_id = $2, status = $3, progress_percent = $4, message = $5, storage_path = $6, is_notified = $7, updated_at = $8
		WHERE id = $1`,
		job.ID, job.DocumentID, job.Status, job.ProgressPercent, job.Message, job.StoragePath, job.IsNotified, job.UpdatedAt,
	)
	return err
}

func (r *UploadJobRepository) DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM upload_jobs WHERE document_id = $1", docID)
	return err
}

func (r *UploadJobRepository) GetRecentJobsByUser(ctx context.Context, ownerID uuid.UUID) ([]*uploadjob.UploadJob, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, owner_user_id, document_id, file_name, file_size_bytes, status, progress_percent, message, storage_path, is_notified, created_at, updated_at
		FROM upload_jobs 
		WHERE owner_user_id = $1
		ORDER BY updated_at DESC LIMIT 20`,
		ownerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*uploadjob.UploadJob
	for rows.Next() {
		var job uploadjob.UploadJob
		err := rows.Scan(&job.ID, &job.OwnerUserID, &job.DocumentID, &job.FileName, &job.FileSizeBytes, &job.Status, &job.ProgressPercent, &job.Message, &job.StoragePath, &job.IsNotified, &job.CreatedAt, &job.UpdatedAt)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, &job)
	}
	return jobs, nil
}
