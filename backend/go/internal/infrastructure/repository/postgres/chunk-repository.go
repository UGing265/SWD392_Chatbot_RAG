package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/chunk"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pgvector/pgvector-go"
)

type ChunkRepository struct {
	pool *pgxpool.Pool
}

func NewChunkRepository(pool *pgxpool.Pool) *ChunkRepository {
	return &ChunkRepository{pool: pool}
}

func (r *ChunkRepository) Create(ctx context.Context, ch *chunk.Chunk) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	vector := pgvector.NewVector(ch.Embedding)
	_, err := r.pool.Exec(ctx,
		`INSERT INTO document_chunks (id, document_id, chapter_id, chunk_order, page_number, content, content_tokens, chunk_hash, metadata, created_at, embedding)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
		ch.ID, ch.DocumentID, ch.ChapterID, ch.ChunkOrder, ch.PageNumber, ch.Content, ch.ContentTokens, ch.ChunkHash, ch.Metadata, ch.CreatedAt, vector,
	)
	return err
}

func (r *ChunkRepository) CreateBatch(ctx context.Context, chunks []*chunk.Chunk) error {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	batch := &pgx.Batch{}
	for _, ch := range chunks {
		vector := pgvector.NewVector(ch.Embedding)
		batch.Queue(
			`INSERT INTO document_chunks (id, document_id, chapter_id, chunk_order, page_number, content, content_tokens, chunk_hash, metadata, created_at, embedding)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
			ch.ID, ch.DocumentID, ch.ChapterID, ch.ChunkOrder, ch.PageNumber, ch.Content, ch.ContentTokens, ch.ChunkHash, ch.Metadata, ch.CreatedAt, vector,
		)
	}

	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()

	for range chunks {
		if _, err := br.Exec(); err != nil {
			return err
		}
	}

	return nil
}

func (r *ChunkRepository) FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*chunk.Chunk, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, document_id, chapter_id, chunk_order, page_number, content, content_tokens, chunk_hash, metadata, created_at, embedding
		FROM document_chunks WHERE document_id = $1 ORDER BY chunk_order`, docID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chunks []*chunk.Chunk
	for rows.Next() {
		ch := &chunk.Chunk{}
		var vector pgvector.Vector
		err := rows.Scan(
			&ch.ID, &ch.DocumentID, &ch.ChapterID, &ch.ChunkOrder, &ch.PageNumber, &ch.Content, &ch.ContentTokens, &ch.ChunkHash, &ch.Metadata, &ch.CreatedAt, &vector,
		)
		if err != nil {
			return nil, err
		}
		ch.Embedding = vector.Slice()
		chunks = append(chunks, ch)
	}
	return chunks, nil
}

func (r *ChunkRepository) DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM document_chunks WHERE document_id = $1", docID)
	return err
}

func (r *ChunkRepository) UpdateChapterIDRange(ctx context.Context, docID uuid.UUID, startOrder int, endOrder int, chapterID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE document_chunks SET chapter_id = $1 
		 WHERE document_id = $2 AND chunk_order >= $3 AND chunk_order <= $4`,
		chapterID, docID, startOrder, endOrder,
	)
	return err
}
