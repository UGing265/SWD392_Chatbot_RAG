package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/lecturersubject"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LecturerSubjectRepository struct {
	pool *pgxpool.Pool
}

func NewLecturerSubjectRepository(pool *pgxpool.Pool) *LecturerSubjectRepository {
	return &LecturerSubjectRepository{pool: pool}
}

func scanAssignment(row pgx.Row) (*lecturersubject.Assignment, error) {
	var a lecturersubject.Assignment
	err := row.Scan(
		&a.UserID,
		&a.SubjectID,
		&a.CreatedAt,
		&a.LecturerEmail,
		&a.LecturerName,
		&a.SubjectCode,
		&a.SubjectName,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *LecturerSubjectRepository) FindAll(ctx context.Context) ([]*lecturersubject.Assignment, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT us.user_id, us.subject_id, us.created_at,
		        u.email as lecturer_email, u.name as lecturer_name, s.code as subject_code, s.name as subject_name
		FROM user_subjects us
		JOIN users u ON u.id = us.user_id
		JOIN subjects s ON s.id = us.subject_id
		ORDER BY u.name ASC, s.code ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assignments []*lecturersubject.Assignment
	for rows.Next() {
		var a lecturersubject.Assignment
		if err := rows.Scan(&a.UserID, &a.SubjectID, &a.CreatedAt, &a.LecturerEmail, &a.LecturerName, &a.SubjectCode, &a.SubjectName); err != nil {
			return nil, err
		}
		assignments = append(assignments, &a)
	}
	return assignments, rows.Err()
}

func (r *LecturerSubjectRepository) FindByLecturer(ctx context.Context, lecturerID uuid.UUID) ([]*lecturersubject.Assignment, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT us.user_id, us.subject_id, us.created_at,
		        u.email as lecturer_email, u.name as lecturer_name, s.code as subject_code, s.name as subject_name
		FROM user_subjects us
		JOIN users u ON u.id = us.user_id
		JOIN subjects s ON s.id = us.subject_id
		WHERE us.user_id = $1
		ORDER BY s.code ASC`,
		lecturerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assignments []*lecturersubject.Assignment
	for rows.Next() {
		var a lecturersubject.Assignment
		if err := rows.Scan(&a.UserID, &a.SubjectID, &a.CreatedAt, &a.LecturerEmail, &a.LecturerName, &a.SubjectCode, &a.SubjectName); err != nil {
			return nil, err
		}
		assignments = append(assignments, &a)
	}
	return assignments, rows.Err()
}

func (r *LecturerSubjectRepository) FindBySubject(ctx context.Context, subjectID uuid.UUID) (*lecturersubject.Assignment, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return scanAssignment(r.pool.QueryRow(ctx,
		`SELECT us.user_id, us.subject_id, us.created_at,
		        u.email as lecturer_email, u.name as lecturer_name, s.code as subject_code, s.name as subject_name
		FROM user_subjects us
		JOIN users u ON u.id = us.user_id
		JOIN subjects s ON s.id = us.subject_id
		WHERE us.subject_id = $1`,
		subjectID,
	))
}

func (r *LecturerSubjectRepository) ReplaceForLecturer(ctx context.Context, lecturerID uuid.UUID, subjectIDs []uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `DELETE FROM user_subjects WHERE user_id = $1`, lecturerID); err != nil {
		return err
	}

	for _, subjectID := range subjectIDs {
		if _, err := tx.Exec(ctx,
			`INSERT INTO user_subjects (user_id, subject_id)
			VALUES ($1, $2)`,
			lecturerID,
			subjectID,
		); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}
