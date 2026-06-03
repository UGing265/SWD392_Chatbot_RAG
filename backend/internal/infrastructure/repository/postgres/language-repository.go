package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/language"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LanguageRepository struct {
	pool *pgxpool.Pool
}

func NewLanguageRepository(pool *pgxpool.Pool) *LanguageRepository {
	return &LanguageRepository{pool: pool}
}

func (r *LanguageRepository) Create(ctx context.Context, lang *language.Language) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO languages (id, code, name, created_at)
		VALUES ($1, $2, $3, $4)`,
		lang.ID, lang.Code, lang.Name, lang.CreatedAt,
	)
	return err
}

func (r *LanguageRepository) FindByID(ctx context.Context, id uuid.UUID) (*language.Language, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var lang language.Language
	err := r.pool.QueryRow(ctx,
		`SELECT id, code, name, created_at FROM languages WHERE id = $1`, id,
	).Scan(&lang.ID, &lang.Code, &lang.Name, &lang.CreatedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &lang, nil
}

func (r *LanguageRepository) FindAll(ctx context.Context) ([]*language.Language, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, code, name, created_at FROM languages ORDER BY name ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var langs []*language.Language
	for rows.Next() {
		var lang language.Language
		err := rows.Scan(&lang.ID, &lang.Code, &lang.Name, &lang.CreatedAt)
		if err != nil {
			return nil, err
		}
		langs = append(langs, &lang)
	}
	return langs, nil
}

func (r *LanguageRepository) Update(ctx context.Context, lang *language.Language) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE languages SET code = $2, name = $3
		WHERE id = $1`,
		lang.ID, lang.Code, lang.Name,
	)
	return err
}

func (r *LanguageRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM languages WHERE id = $1", id)
	return err
}
