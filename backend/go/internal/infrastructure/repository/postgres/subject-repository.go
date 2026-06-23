package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/subject"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SubjectRepository struct {
	pool *pgxpool.Pool
}

func NewSubjectRepository(pool *pgxpool.Pool) *SubjectRepository {
	return &SubjectRepository{pool: pool}
}

func (r *SubjectRepository) Create(ctx context.Context, sub *subject.Subject) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO subjects (id, code, name, academic_term_id, created_at)
		VALUES ($1, $2, $3, $4, $5)`,
		sub.ID, sub.Code, sub.Name, sub.AcademicTermID, sub.CreatedAt,
	)
	return err
}

func (r *SubjectRepository) FindByID(ctx context.Context, id uuid.UUID) (*subject.Subject, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var sub subject.Subject
	err := r.pool.QueryRow(ctx,
		`SELECT s.id, s.code, s.name, s.academic_term_id, s.created_at, at.name as academic_term_name
		FROM subjects s
		LEFT JOIN academic_terms at ON s.academic_term_id = at.id
		WHERE s.id = $1`, id,
	).Scan(&sub.ID, &sub.Code, &sub.Name, &sub.AcademicTermID, &sub.CreatedAt, &sub.AcademicTermName)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *SubjectRepository) FindAll(ctx context.Context) ([]*subject.Subject, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT s.id, s.code, s.name, s.academic_term_id, s.created_at, at.name as academic_term_name
		FROM subjects s
		LEFT JOIN academic_terms at ON s.academic_term_id = at.id
		ORDER BY s.code ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []*subject.Subject
	for rows.Next() {
		var sub subject.Subject
		err := rows.Scan(&sub.ID, &sub.Code, &sub.Name, &sub.AcademicTermID, &sub.CreatedAt, &sub.AcademicTermName)
		if err != nil {
			return nil, err
		}
		subs = append(subs, &sub)
	}
	return subs, nil
}

func (r *SubjectRepository) FindAllPublic(ctx context.Context) ([]*subject.Subject, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT s.id, s.code, s.name, s.academic_term_id, s.created_at, at.name as academic_term_name
		FROM subjects s
		LEFT JOIN academic_terms at ON s.academic_term_id = at.id
		WHERE s.status = 'public'
		ORDER BY s.code ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []*subject.Subject
	for rows.Next() {
		var sub subject.Subject
		err := rows.Scan(&sub.ID, &sub.Code, &sub.Name, &sub.AcademicTermID, &sub.CreatedAt, &sub.AcademicTermName)
		if err != nil {
			return nil, err
		}
		subs = append(subs, &sub)
	}
	return subs, nil
}

func (r *SubjectRepository) FindAllByOwner(ctx context.Context, ownerID uuid.UUID) ([]*subject.Subject, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT DISTINCT s.id, s.code, s.name, s.academic_term_id, s.created_at, at.name as academic_term_name
		FROM subjects s
		LEFT JOIN academic_terms at ON s.academic_term_id = at.id
		JOIN documents d ON d.subject_id = s.id
		WHERE d.owner_user_id = $1
		ORDER BY s.code ASC`,
		ownerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []*subject.Subject
	for rows.Next() {
		var sub subject.Subject
		err := rows.Scan(&sub.ID, &sub.Code, &sub.Name, &sub.AcademicTermID, &sub.CreatedAt, &sub.AcademicTermName)
		if err != nil {
			return nil, err
		}
		subs = append(subs, &sub)
	}
	return subs, nil
}

func (r *SubjectRepository) Update(ctx context.Context, sub *subject.Subject) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE subjects SET code = $2, name = $3, academic_term_id = $4
		WHERE id = $1`,
		sub.ID, sub.Code, sub.Name, sub.AcademicTermID,
	)
	return err
}

func (r *SubjectRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM subjects WHERE id = $1", id)
	return err
}
