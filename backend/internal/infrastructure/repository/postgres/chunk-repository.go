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
		`INSERT INTO chunks (id, document_id, chapter_id, content, page_label, chunk_index, embedding, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		ch.ID, ch.DocumentID, ch.ChapterID, ch.Content, ch.PageLabel, ch.ChunkIndex, vector, ch.CreatedAt,
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
			`INSERT INTO chunks (id, document_id, chapter_id, content, page_label, chunk_index, embedding, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			ch.ID, ch.DocumentID, ch.ChapterID, ch.Content, ch.PageLabel, ch.ChunkIndex, vector, ch.CreatedAt,
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
		`SELECT id, document_id, chapter_id, content, page_label, chunk_index, embedding, created_at
		FROM chunks WHERE document_id = $1 ORDER BY chunk_index`, docID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chunks []*chunk.Chunk
	for rows.Next() {
		ch := &chunk.Chunk{}
		var vector pgvector.Vector
		if err := rows.Scan(&ch.ID, &ch.DocumentID, &ch.ChapterID, &ch.Content, &ch.PageLabel, &ch.ChunkIndex, &vector, &ch.CreatedAt); err != nil {
			return nil, err
		}
		ch.Embedding = vector.Slice()
		chunks = append(chunks, ch)
	}
	return chunks, nil
}

func (r *ChunkRepository) FindByCourseID(ctx context.Context, courseID uuid.UUID) ([]*chunk.Chunk, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT c.id, c.document_id, c.chapter_id, c.content, c.page_label, c.chunk_index, c.embedding, c.created_at
		FROM chunks c
		JOIN documents d ON c.document_id = d.id
		WHERE d.course_id = $1
		ORDER BY c.chunk_index`, courseID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chunks []*chunk.Chunk
	for rows.Next() {
		ch := &chunk.Chunk{}
		var vector pgvector.Vector
		if err := rows.Scan(&ch.ID, &ch.DocumentID, &ch.ChapterID, &ch.Content, &ch.PageLabel, &ch.ChunkIndex, &vector, &ch.CreatedAt); err != nil {
			return nil, err
		}
		ch.Embedding = vector.Slice()
		chunks = append(chunks, ch)
	}
	return chunks, nil
}

func (r *ChunkRepository) Search(ctx context.Context, courseID uuid.UUID, queryVector []float32, topK int) ([]*chunk.ChunkWithScore, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	searchVector := pgvector.NewVector(queryVector)
	rows, err := r.pool.Query(ctx,
		`SELECT
			c.id, c.document_id, c.chapter_id, c.content, c.page_label, c.chunk_index, c.embedding, c.created_at,
			1 - (c.embedding <=> $2) AS relevance_score
		FROM chunks c
		JOIN documents d ON c.document_id = d.id
		WHERE d.course_id = $1
		ORDER BY c.embedding <=> $2
		LIMIT $3`,
		courseID, searchVector, topK,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []*chunk.ChunkWithScore
	for rows.Next() {
		ch := &chunk.Chunk{}
		var vector pgvector.Vector
		var score float64
		if err := rows.Scan(&ch.ID, &ch.DocumentID, &ch.ChapterID, &ch.Content, &ch.PageLabel, &ch.ChunkIndex, &vector, &ch.CreatedAt, &score); err != nil {
			return nil, err
		}
		ch.Embedding = vector.Slice()
		results = append(results, &chunk.ChunkWithScore{
			Chunk:         ch,
			RelevanceScore: score,
		})
	}
	return results, nil
}

func (r *ChunkRepository) DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM chunks WHERE document_id = $1", docID)
	return err
}
