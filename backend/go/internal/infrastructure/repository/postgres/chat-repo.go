package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/chatsession"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ChatSessionRepository struct {
	pool *pgxpool.Pool
}

func NewChatSessionRepository(pool *pgxpool.Pool) *ChatSessionRepository {
	return &ChatSessionRepository{pool: pool}
}

func (r *ChatSessionRepository) Create(ctx context.Context, s *chatsession.ChatSession) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx,
		`INSERT INTO chat_sessions (id, user_id, course_id, title, is_starred, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		s.ID, s.UserID, s.CourseID, s.Title, s.IsStarred, s.Status, s.CreatedAt, s.UpdatedAt,
	)
	if err != nil {
		return err
	}

	for _, docID := range s.DocumentIDs {
		_, err = tx.Exec(ctx,
			`INSERT INTO chat_session_documents (session_id, document_id) VALUES ($1, $2)`,
			s.ID, docID,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *ChatSessionRepository) GetByID(ctx context.Context, id uuid.UUID) (*chatsession.ChatSession, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	s := &chatsession.ChatSession{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, user_id, course_id, title, is_starred, status, created_at, updated_at
		FROM chat_sessions WHERE id = $1`, id,
	).Scan(&s.ID, &s.UserID, &s.CourseID, &s.Title, &s.IsStarred, &s.Status, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}

	docs, err := r.GetDocumentIDsBySession(ctx, id)
	if err == nil {
		s.DocumentIDs = docs
	}

	return s, nil
}

func (r *ChatSessionRepository) GetDocumentIDsBySession(ctx context.Context, sessionID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := r.pool.Query(ctx, `SELECT document_id FROM chat_session_documents WHERE session_id = $1`, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []uuid.UUID
	for rows.Next() {
		var d uuid.UUID
		if err := rows.Scan(&d); err == nil {
			docs = append(docs, d)
		}
	}
	return docs, nil
}

func (r *ChatSessionRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*chatsession.ChatSession, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, user_id, course_id, title, is_starred, status, created_at, updated_at
		FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*chatsession.ChatSession
	for rows.Next() {
		s := &chatsession.ChatSession{}
		if err := rows.Scan(&s.ID, &s.UserID, &s.CourseID, &s.Title, &s.IsStarred, &s.Status, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}

	// Fetch document IDs for all sessions (this could be optimized with a JOIN or IN clause, but this works for now)
	for _, s := range sessions {
		docs, _ := r.GetDocumentIDsBySession(ctx, s.ID)
		s.DocumentIDs = docs
	}

	return sessions, nil
}

func (r *ChatSessionRepository) Update(ctx context.Context, s *chatsession.ChatSession) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE chat_sessions SET title = $1, is_starred = $2, status = $3, updated_at = $4 WHERE id = $5`,
		s.Title, s.IsStarred, s.Status, s.UpdatedAt, s.ID,
	)
	return err
}

func (r *ChatSessionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, `DELETE FROM chat_sessions WHERE id = $1`, id)
	return err
}
