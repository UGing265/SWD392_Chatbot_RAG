package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/academicterm"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AcademicTermRepository struct {
	pool *pgxpool.Pool
}

func NewAcademicTermRepository(pool *pgxpool.Pool) *AcademicTermRepository {
	return &AcademicTermRepository{pool: pool}
}

func (r *AcademicTermRepository) Create(ctx context.Context, term *academicterm.AcademicTerm) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO academic_terms (id, name, term_order, created_at)
		VALUES ($1, $2, $3, $4)`,
		term.ID, term.Name, term.Order, term.CreatedAt,
	)
	return err
}

func (r *AcademicTermRepository) FindByID(ctx context.Context, id uuid.UUID) (*academicterm.AcademicTerm, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var term academicterm.AcademicTerm
	err := r.pool.QueryRow(ctx,
		`SELECT id, name, term_order, created_at FROM academic_terms WHERE id = $1`, id,
	).Scan(&term.ID, &term.Name, &term.Order, &term.CreatedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &term, nil
}

func (r *AcademicTermRepository) FindAll(ctx context.Context) ([]*academicterm.AcademicTerm, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT id, name, term_order, created_at FROM academic_terms ORDER BY term_order ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var terms []*academicterm.AcademicTerm
	for rows.Next() {
		var term academicterm.AcademicTerm
		err := rows.Scan(&term.ID, &term.Name, &term.Order, &term.CreatedAt)
		if err != nil {
			return nil, err
		}
		terms = append(terms, &term)
	}
	return terms, nil
}

func (r *AcademicTermRepository) Update(ctx context.Context, term *academicterm.AcademicTerm) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE academic_terms SET name = $2, term_order = $3
		WHERE id = $1`,
		term.ID, term.Name, term.Order,
	)
	return err
}

func (r *AcademicTermRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM academic_terms WHERE id = $1", id)
	return err
}
