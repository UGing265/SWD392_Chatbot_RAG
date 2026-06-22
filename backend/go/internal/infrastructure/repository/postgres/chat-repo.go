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

	_, err := r.pool.Exec(ctx,
		`INSERT INTO chat_sessions (id, user_id, course_id, title, is_starred, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		s.ID, s.UserID, s.CourseID, s.Title, s.IsStarred, s.Status, s.CreatedAt, s.UpdatedAt,
	)
	return err
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
	return s, nil
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
