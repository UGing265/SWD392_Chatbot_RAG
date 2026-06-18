package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/message"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pgvector/pgvector-go"
)

type MessageRepository struct {
	pool *pgxpool.Pool
}

func NewMessageRepository(pool *pgxpool.Pool) *MessageRepository {
	return &MessageRepository{pool: pool}
}

func (r *MessageRepository) Create(ctx context.Context, msg *message.Message) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO messages (id, session_id, role, content, token_count, out_of_scope, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		msg.ID, msg.SessionID, msg.Role, msg.Content, msg.TokenCount, msg.OutOfScope, msg.CreatedAt,
	)
	return err
}

func (r *MessageRepository) GetBySessionID(ctx context.Context, sessionID uuid.UUID, limit int) ([]*message.Message, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, session_id, role, content, token_count, out_of_scope, created_at
		FROM messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT $2`,
		sessionID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*message.Message
	for rows.Next() {
		m := &message.Message{}
		if err := rows.Scan(&m.ID, &m.SessionID, &m.Role, &m.Content, &m.TokenCount, &m.OutOfScope, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	return messages, nil
}

func (r *MessageRepository) CreateCitations(ctx context.Context, citations []*message.MessageCitation) error {
	if len(citations) == 0 {
		return nil
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	batch := &pgx.Batch{}
	for _, c := range citations {
		batch.Queue(
			`INSERT INTO message_citations (id, message_id, chunk_id, relevance_score, excerpt)
			VALUES ($1, $2, $3, $4, $5)`,
			c.ID, c.MessageID, c.ChunkID, c.RelevanceScore, c.Excerpt,
		)
	}

	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()

	for range citations {
		if _, err := br.Exec(); err != nil {
			return err
		}
	}
	return nil
}

func (r *MessageRepository) GetCitationsByMessageID(ctx context.Context, messageID uuid.UUID) ([]*message.MessageCitation, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, message_id, chunk_id, relevance_score, excerpt
		FROM message_citations WHERE message_id = $1 ORDER BY relevance_score DESC`,
		messageID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var citations []*message.MessageCitation
	for rows.Next() {
		c := &message.MessageCitation{}
		if err := rows.Scan(&c.ID, &c.MessageID, &c.ChunkID, &c.RelevanceScore, &c.Excerpt); err != nil {
			return nil, err
		}
		citations = append(citations, c)
	}
	return citations, nil
}

// SearchSimilarChunks performs cosine similarity search via pgvector.
// Filters chunks by course_id through the documents table join.
func (r *MessageRepository) SearchSimilarChunks(
	ctx context.Context,
	queryEmbedding []float32,
	courseID uuid.UUID,
	topK int,
) ([]*message.SimilarChunk, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	vector := pgvector.NewVector(queryEmbedding)

	rows, err := r.pool.Query(ctx, `
		SELECT
			c.id,
			c.document_id,
			c.content,
			COALESCE(c.page_number::text, ''),
			COALESCE(df.original_filename, d.title),
			1 - (c.embedding <=> $1) AS relevance_score
		FROM document_chunks c
		JOIN documents d ON c.document_id = d.id
		LEFT JOIN document_files df ON df.document_id = d.id
		WHERE d.subject_id = $2
		  AND d.status = 'completed'
		  AND c.embedding IS NOT NULL
		ORDER BY c.embedding <=> $1
		LIMIT $3
	`, vector, courseID, topK)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []*message.SimilarChunk
	for rows.Next() {
		sc := &message.SimilarChunk{}
		if err := rows.Scan(&sc.ChunkID, &sc.DocumentID, &sc.Content, &sc.PageLabel, &sc.FileName, &sc.RelevanceScore); err != nil {
			return nil, err
		}
		results = append(results, sc)
	}
	return results, nil
}
