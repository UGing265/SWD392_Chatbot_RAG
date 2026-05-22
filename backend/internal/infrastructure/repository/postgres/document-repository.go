package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/document"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DocumentRepository struct {
	pool *pgxpool.Pool
}

func NewDocumentRepository(pool *pgxpool.Pool) *DocumentRepository {
	return &DocumentRepository{pool: pool}
}

func (r *DocumentRepository) Create(doc *document.Document) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO documents (id, user_id, course_id, chapter_id, file_name, file_type, file_path, status, uploaded_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		doc.ID, doc.UserID, doc.CourseID, doc.ChapterID, doc.FileName, doc.FileType, doc.FilePath, doc.Status, doc.UploadedAt,
	)
	return err
}

func (r *DocumentRepository) FindByID(id uuid.UUID) (*document.Document, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var doc document.Document
	err := r.pool.QueryRow(ctx,
		`SELECT id, user_id, course_id, chapter_id, file_name, file_type, file_path, status, chunk_count, embedding_count, error_message, uploaded_at, indexed_at
		FROM documents WHERE id = $1`, id,
	).Scan(&doc.ID, &doc.UserID, &doc.CourseID, &doc.ChapterID, &doc.FileName, &doc.FileType, &doc.FilePath, &doc.Status, &doc.ChunkCount, &doc.EmbeddingCount, &doc.ErrorMessage, &doc.UploadedAt, &doc.IndexedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &doc, nil
}

func (r *DocumentRepository) FindByUserID(userID uuid.UUID) ([]*document.Document, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, user_id, course_id, chapter_id, file_name, file_type, file_path, status, chunk_count, embedding_count, error_message, uploaded_at, indexed_at
		FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []*document.Document
	for rows.Next() {
		var doc document.Document
		err := rows.Scan(&doc.ID, &doc.UserID, &doc.CourseID, &doc.ChapterID, &doc.FileName, &doc.FileType, &doc.FilePath, &doc.Status, &doc.ChunkCount, &doc.EmbeddingCount, &doc.ErrorMessage, &doc.UploadedAt, &doc.IndexedAt)
		if err != nil {
			return nil, err
		}
		docs = append(docs, &doc)
	}
	return docs, nil
}

func (r *DocumentRepository) FindByCourseID(courseID uuid.UUID) ([]*document.Document, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, user_id, course_id, chapter_id, file_name, file_type, file_path, status, chunk_count, embedding_count, error_message, uploaded_at, indexed_at
		FROM documents WHERE course_id = $1 ORDER BY uploaded_at DESC`, courseID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []*document.Document
	for rows.Next() {
		var doc document.Document
		err := rows.Scan(&doc.ID, &doc.UserID, &doc.CourseID, &doc.ChapterID, &doc.FileName, &doc.FileType, &doc.FilePath, &doc.Status, &doc.ChunkCount, &doc.EmbeddingCount, &doc.ErrorMessage, &doc.UploadedAt, &doc.IndexedAt)
		if err != nil {
			return nil, err
		}
		docs = append(docs, &doc)
	}
	return docs, nil
}

func (r *DocumentRepository) Update(doc *document.Document) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE documents SET file_name = $2, file_type = $3, status = $4, chunk_count = $5, embedding_count = $6, error_message = $7, indexed_at = $8
		WHERE id = $1`,
		doc.ID, doc.FileName, doc.FileType, doc.Status, doc.ChunkCount, doc.EmbeddingCount, doc.ErrorMessage, doc.IndexedAt,
	)
	return err
}

func (r *DocumentRepository) Delete(id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM documents WHERE id = $1", id)
	return err
}