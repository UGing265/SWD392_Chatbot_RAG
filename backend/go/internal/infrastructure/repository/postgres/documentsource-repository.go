package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/documentsource"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DocumentSourceRepository struct {
	pool *pgxpool.Pool
}

func NewDocumentSourceRepository(pool *pgxpool.Pool) *DocumentSourceRepository {
	return &DocumentSourceRepository{pool: pool}
}

func (r *DocumentSourceRepository) Create(ctx context.Context, source *documentsource.DocumentSource) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO document_sources (id, name, created_at)
		VALUES ($1, $2, $3)`,
		source.ID, source.Name, source.CreatedAt,
	)
	return err
}

func (r *DocumentSourceRepository) FindByID(ctx context.Context, id uuid.UUID) (*documentsource.DocumentSource, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var source documentsource.DocumentSource
	err := r.pool.QueryRow(ctx,
		`SELECT id, name, created_at FROM document_sources WHERE id = $1`, id,
	).Scan(&source.ID, &source.Name, &source.CreatedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &source, nil
}

func (r *DocumentSourceRepository) FindAll(ctx context.Context) ([]*documentsource.DocumentSource, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, name, created_at FROM document_sources ORDER BY name ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sources []*documentsource.DocumentSource
	for rows.Next() {
		var source documentsource.DocumentSource
		err := rows.Scan(&source.ID, &source.Name, &source.CreatedAt)
		if err != nil {
			return nil, err
		}
		sources = append(sources, &source)
	}
	return sources, nil
}

func (r *DocumentSourceRepository) Update(ctx context.Context, source *documentsource.DocumentSource) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE document_sources SET name = $2
		WHERE id = $1`,
		source.ID, source.Name,
	)
	return err
}

func (r *DocumentSourceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM document_sources WHERE id = $1", id)
	return err
}
