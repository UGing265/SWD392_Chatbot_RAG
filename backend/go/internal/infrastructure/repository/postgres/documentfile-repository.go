package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/documentfile"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DocumentFileRepository struct {
	pool *pgxpool.Pool
}

func NewDocumentFileRepository(pool *pgxpool.Pool) *DocumentFileRepository {
	return &DocumentFileRepository{pool: pool}
}

func (r *DocumentFileRepository) Create(ctx context.Context, f *documentfile.DocumentFile) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO document_files (id, document_id, original_filename, storage_path, file_url, mime_type, file_size_bytes, checksum_sha256, page_count, extracted_text, extraction_status, created_at, s3_bucket, s3_key)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
		f.ID, f.DocumentID, f.OriginalFilename, f.StoragePath, f.FileUrl, f.MimeType, f.FileSizeBytes, f.ChecksumSha256, f.PageCount, f.ExtractedText, f.ExtractionStatus, f.CreatedAt, f.S3Bucket, f.S3Key,
	)
	return err
}

func (r *DocumentFileRepository) FindByID(ctx context.Context, id uuid.UUID) (*documentfile.DocumentFile, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var f documentfile.DocumentFile
	err := r.pool.QueryRow(ctx,
		`SELECT id, document_id, original_filename, storage_path, file_url, mime_type, file_size_bytes, checksum_sha256, page_count, extracted_text, extraction_status, created_at, s3_bucket, s3_key
		FROM document_files WHERE id = $1`, id,
	).Scan(&f.ID, &f.DocumentID, &f.OriginalFilename, &f.StoragePath, &f.FileUrl, &f.MimeType, &f.FileSizeBytes, &f.ChecksumSha256, &f.PageCount, &f.ExtractedText, &f.ExtractionStatus, &f.CreatedAt, &f.S3Bucket, &f.S3Key)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &f, nil
}

func (r *DocumentFileRepository) FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*documentfile.DocumentFile, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, document_id, original_filename, storage_path, file_url, mime_type, file_size_bytes, checksum_sha256, page_count, extracted_text, extraction_status, created_at, s3_bucket, s3_key
		FROM document_files WHERE document_id = $1`, docID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []*documentfile.DocumentFile
	for rows.Next() {
		var f documentfile.DocumentFile
		err := rows.Scan(&f.ID, &f.DocumentID, &f.OriginalFilename, &f.StoragePath, &f.FileUrl, &f.MimeType, &f.FileSizeBytes, &f.ChecksumSha256, &f.PageCount, &f.ExtractedText, &f.ExtractionStatus, &f.CreatedAt, &f.S3Bucket, &f.S3Key)
		if err != nil {
			return nil, err
		}
		files = append(files, &f)
	}
	return files, nil
}

func (r *DocumentFileRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM document_files WHERE id = $1", id)
	return err
}

func (r *DocumentFileRepository) DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM document_files WHERE document_id = $1", docID)
	return err
}
