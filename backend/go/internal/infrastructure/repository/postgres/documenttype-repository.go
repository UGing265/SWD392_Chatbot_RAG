package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/documenttype"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DocumentTypeRepository struct {
	pool *pgxpool.Pool
}

func NewDocumentTypeRepository(pool *pgxpool.Pool) *DocumentTypeRepository {
	return &DocumentTypeRepository{pool: pool}
}

func (r *DocumentTypeRepository) Create(ctx context.Context, dt *documenttype.DocumentType) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO document_types (id, name, description, created_at)
		VALUES ($1, $2, $3, $4)`,
		dt.ID, dt.Name, dt.Description, dt.CreatedAt,
	)
	return err
}

func (r *DocumentTypeRepository) FindByID(ctx context.Context, id uuid.UUID) (*documenttype.DocumentType, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var dt documenttype.DocumentType
	err := r.pool.QueryRow(ctx,
		`SELECT id, name, description, created_at FROM document_types WHERE id = $1`, id,
	).Scan(&dt.ID, &dt.Name, &dt.Description, &dt.CreatedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &dt, nil
}

func (r *DocumentTypeRepository) FindAll(ctx context.Context) ([]*documenttype.DocumentType, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, name, description, created_at FROM document_types ORDER BY name ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dts []*documenttype.DocumentType
	for rows.Next() {
		var dt documenttype.DocumentType
		err := rows.Scan(&dt.ID, &dt.Name, &dt.Description, &dt.CreatedAt)
		if err != nil {
			return nil, err
		}
		dts = append(dts, &dt)
	}
	return dts, nil
}

func (r *DocumentTypeRepository) Update(ctx context.Context, dt *documenttype.DocumentType) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE document_types SET name = $2, description = $3
		WHERE id = $1`,
		dt.ID, dt.Name, dt.Description,
	)
	return err
}

func (r *DocumentTypeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM document_types WHERE id = $1", id)
	return err
}
