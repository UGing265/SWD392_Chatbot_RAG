package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/chapter"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ChapterRepository struct {
	pool *pgxpool.Pool
}

func NewChapterRepository(pool *pgxpool.Pool) *ChapterRepository {
	return &ChapterRepository{pool: pool}
}

func (r *ChapterRepository) Create(ctx context.Context, ch *chapter.Chapter) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO document_chapters (id, document_id, parent_chapter_id, title, summary, chapter_order, start_page, end_page, start_chunk_index, end_chunk_index, is_ai_generated, confidence_score, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
		ch.ID, ch.DocumentID, ch.ParentChapterID, ch.Title, ch.Summary, ch.ChapterOrder, ch.StartPage, ch.EndPage, ch.StartChunkIndex, ch.EndChunkIndex, ch.IsAIGenerated, ch.ConfidenceScore, ch.CreatedAt,
	)
	return err
}

func (r *ChapterRepository) CreateBatch(ctx context.Context, chapters []*chapter.Chapter) error {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	batch := &pgx.Batch{}
	for _, ch := range chapters {
		batch.Queue(
			`INSERT INTO document_chapters (id, document_id, parent_chapter_id, title, summary, chapter_order, start_page, end_page, start_chunk_index, end_chunk_index, is_ai_generated, confidence_score, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
			ch.ID, ch.DocumentID, ch.ParentChapterID, ch.Title, ch.Summary, ch.ChapterOrder, ch.StartPage, ch.EndPage, ch.StartChunkIndex, ch.EndChunkIndex, ch.IsAIGenerated, ch.ConfidenceScore, ch.CreatedAt,
		)
	}

	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()

	for range chapters {
		if _, err := br.Exec(); err != nil {
			return err
		}
	}

	return nil
}

func (r *ChapterRepository) FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*chapter.Chapter, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, document_id, parent_chapter_id, title, summary, chapter_order, start_page, end_page, start_chunk_index, end_chunk_index, is_ai_generated, confidence_score, created_at
		FROM document_chapters WHERE document_id = $1 ORDER BY chapter_order`, docID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chapters []*chapter.Chapter
	for rows.Next() {
		ch := &chapter.Chapter{}
		err := rows.Scan(
			&ch.ID, &ch.DocumentID, &ch.ParentChapterID, &ch.Title, &ch.Summary, &ch.ChapterOrder, &ch.StartPage, &ch.EndPage, &ch.StartChunkIndex, &ch.EndChunkIndex, &ch.IsAIGenerated, &ch.ConfidenceScore, &ch.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		chapters = append(chapters, ch)
	}
	return chapters, nil
}

func (r *ChapterRepository) DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM document_chapters WHERE document_id = $1", docID)
	return err
}
