package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"swd392-chatbot-rag/internal/domain/quiz"
	"swd392-chatbot-rag/internal/domain/subject"
)

type QuizRepository struct {
	db *pgxpool.Pool
}

func NewQuizRepository(db *pgxpool.Pool) *QuizRepository {
	return &QuizRepository{
		db: db,
	}
}

func (r *QuizRepository) CreateQuiz(ctx context.Context, q *quiz.Quiz) error {
	query := `
		INSERT INTO quizzes (id, subject_id, lecturer_id, title, description, status, total_questions, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(ctx, query, q.ID, q.SubjectID, q.LecturerID, q.Title, q.Description, q.Status, q.TotalQuestions, q.CreatedAt, q.UpdatedAt)
	return err
}

func (r *QuizRepository) GetQuizByID(ctx context.Context, id uuid.UUID) (*quiz.Quiz, error) {
	query := `
		SELECT id, subject_id, lecturer_id, title, description, status, total_questions, created_at, updated_at
		FROM quizzes WHERE id = $1
	`
	row := r.db.QueryRow(ctx, query, id)
	var q quiz.Quiz
	err := row.Scan(&q.ID, &q.SubjectID, &q.LecturerID, &q.Title, &q.Description, &q.Status, &q.TotalQuestions, &q.CreatedAt, &q.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (r *QuizRepository) UpdateQuiz(ctx context.Context, q *quiz.Quiz) error {
	query := `
		UPDATE quizzes
		SET title = $1, description = $2, status = $3, total_questions = $4, updated_at = $5
		WHERE id = $6
	`
	_, err := r.db.Exec(ctx, query, q.Title, q.Description, q.Status, q.TotalQuestions, q.UpdatedAt, q.ID)
	return err
}

func (r *QuizRepository) ListQuizzesBySubject(ctx context.Context, subjectID uuid.UUID, includeDrafts bool, lecturerID *uuid.UUID) ([]*quiz.Quiz, error) {
	query := `
		SELECT id, subject_id, lecturer_id, title, description, status, total_questions, created_at, updated_at
		FROM quizzes
		WHERE subject_id = $1
	`
	args := []interface{}{subjectID}

	if !includeDrafts {
		query += ` AND status = 'published'`
	} else if lecturerID != nil {
		// Only fetch published OR the ones created by this lecturer if includeDrafts is true
		query += ` AND (status = 'published' OR lecturer_id = $2)`
		args = append(args, *lecturerID)
	}

	query += ` ORDER BY created_at DESC`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var quizzes []*quiz.Quiz
	for rows.Next() {
		var q quiz.Quiz
		if err := rows.Scan(&q.ID, &q.SubjectID, &q.LecturerID, &q.Title, &q.Description, &q.Status, &q.TotalQuestions, &q.CreatedAt, &q.UpdatedAt); err != nil {
			return nil, err
		}
		quizzes = append(quizzes, &q)
	}
	return quizzes, nil
}

func (r *QuizRepository) ListSubjectsWithPublishedQuizzes(ctx context.Context) ([]*subject.Subject, error) {
	query := `
		SELECT DISTINCT s.id, s.code, s.name, s.created_at
		FROM subjects s
		JOIN quizzes q ON s.id = q.subject_id
		WHERE q.status = 'published'
		ORDER BY s.name ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subjects []*subject.Subject
	for rows.Next() {
		s := &subject.Subject{}
		if err := rows.Scan(&s.ID, &s.Code, &s.Name, &s.CreatedAt); err != nil {
			return nil, err
		}
		subjects = append(subjects, s)
	}

	return subjects, nil
}

func (r *QuizRepository) DeleteQuiz(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, "DELETE FROM quizzes WHERE id = $1", id)
	return err
}

func (r *QuizRepository) CreateQuestion(ctx context.Context, q *quiz.Question) error {
	query := `
		INSERT INTO quiz_questions (id, quiz_id, question_type, content, explanation, order_index, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(ctx, query, q.ID, q.QuizID, q.QuestionType, q.Content, q.Explanation, q.OrderIndex, q.CreatedAt)
	return err
}

func (r *QuizRepository) GetQuestionsByQuizID(ctx context.Context, quizID uuid.UUID) ([]*quiz.Question, error) {
	query := `
		SELECT id, quiz_id, question_type, content, explanation, order_index, created_at
		FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index ASC
	`
	rows, err := r.db.Query(ctx, query, quizID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []*quiz.Question
	for rows.Next() {
		var q quiz.Question
		if err := rows.Scan(&q.ID, &q.QuizID, &q.QuestionType, &q.Content, &q.Explanation, &q.OrderIndex, &q.CreatedAt); err != nil {
			return nil, err
		}
		questions = append(questions, &q)
	}
	return questions, nil
}

func (r *QuizRepository) DeleteQuestionsByQuizID(ctx context.Context, quizID uuid.UUID) error {
	_, err := r.db.Exec(ctx, "DELETE FROM quiz_questions WHERE quiz_id = $1", quizID)
	return err
}

func (r *QuizRepository) CreateOption(ctx context.Context, opt *quiz.Option) error {
	query := `
		INSERT INTO quiz_options (id, question_id, content, is_correct, order_index)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query, opt.ID, opt.QuestionID, opt.Content, opt.IsCorrect, opt.OrderIndex)
	return err
}

func (r *QuizRepository) GetOptionsByQuestionID(ctx context.Context, questionID uuid.UUID) ([]*quiz.Option, error) {
	query := `
		SELECT id, question_id, content, is_correct, order_index
		FROM quiz_options WHERE question_id = $1 ORDER BY order_index ASC
	`
	rows, err := r.db.Query(ctx, query, questionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var options []*quiz.Option
	for rows.Next() {
		var opt quiz.Option
		if err := rows.Scan(&opt.ID, &opt.QuestionID, &opt.Content, &opt.IsCorrect, &opt.OrderIndex); err != nil {
			return nil, err
		}
		options = append(options, &opt)
	}
	return options, nil
}

func (r *QuizRepository) GetOptionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([]*quiz.Option, error) {
	if len(questionIDs) == 0 {
		return []*quiz.Option{}, nil
	}
	
	query := `
		SELECT id, question_id, content, is_correct, order_index
		FROM quiz_options WHERE question_id = ANY($1) ORDER BY question_id, order_index ASC
	`
	rows, err := r.db.Query(ctx, query, questionIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var options []*quiz.Option
	for rows.Next() {
		var opt quiz.Option
		if err := rows.Scan(&opt.ID, &opt.QuestionID, &opt.Content, &opt.IsCorrect, &opt.OrderIndex); err != nil {
			return nil, err
		}
		options = append(options, &opt)
	}
	return options, nil
}

func (r *QuizRepository) DeleteOptionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) error {
    if len(questionIDs) == 0 {
		return nil
	}
	_, err := r.db.Exec(ctx, "DELETE FROM quiz_options WHERE question_id = ANY($1)", questionIDs)
	return err
}

func (r *QuizRepository) CreateAttempt(ctx context.Context, a *quiz.Attempt) error {
	query := `
		INSERT INTO quiz_attempts (id, quiz_id, user_id, score, total_correct, is_preview, started_at, completed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(ctx, query, a.ID, a.QuizID, a.UserID, a.Score, a.TotalCorrect, a.IsPreview, a.StartedAt, a.CompletedAt)
	return err
}

func (r *QuizRepository) GetAttemptByID(ctx context.Context, id uuid.UUID) (*quiz.Attempt, error) {
	query := `
		SELECT id, quiz_id, user_id, score, total_correct, is_preview, started_at, completed_at
		FROM quiz_attempts WHERE id = $1
	`
	row := r.db.QueryRow(ctx, query, id)
	var a quiz.Attempt
	err := row.Scan(&a.ID, &a.QuizID, &a.UserID, &a.Score, &a.TotalCorrect, &a.IsPreview, &a.StartedAt, &a.CompletedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *QuizRepository) UpdateAttempt(ctx context.Context, a *quiz.Attempt) error {
	query := `
		UPDATE quiz_attempts
		SET score = $1, total_correct = $2, completed_at = $3
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, a.Score, a.TotalCorrect, a.CompletedAt, a.ID)
	return err
}

func (r *QuizRepository) ListAttemptsByQuizAndUser(ctx context.Context, quizID, userID uuid.UUID) ([]*quiz.Attempt, error) {
	query := `
		SELECT id, quiz_id, user_id, score, total_correct, is_preview, started_at, completed_at
		FROM quiz_attempts
		WHERE quiz_id = $1 AND user_id = $2
		ORDER BY started_at DESC
	`
	rows, err := r.db.Query(ctx, query, quizID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []*quiz.Attempt
	for rows.Next() {
		var a quiz.Attempt
		if err := rows.Scan(&a.ID, &a.QuizID, &a.UserID, &a.Score, &a.TotalCorrect, &a.IsPreview, &a.StartedAt, &a.CompletedAt); err != nil {
			return nil, err
		}
		attempts = append(attempts, &a)
	}
	return attempts, nil
}

func (r *QuizRepository) CreateAttemptAnswer(ctx context.Context, ans *quiz.AttemptAnswer) error {
	query := `
		INSERT INTO quiz_attempt_answers (id, attempt_id, question_id, selected_option_ids, is_correct)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query, ans.ID, ans.AttemptID, ans.QuestionID, ans.SelectedOptionIDs, ans.IsCorrect)
	return err
}

func (r *QuizRepository) GetAttemptAnswersByAttemptID(ctx context.Context, attemptID uuid.UUID) ([]*quiz.AttemptAnswer, error) {
	query := `
		SELECT id, attempt_id, question_id, selected_option_ids, is_correct
		FROM quiz_attempt_answers WHERE attempt_id = $1
	`
	rows, err := r.db.Query(ctx, query, attemptID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []*quiz.AttemptAnswer
	for rows.Next() {
		var a quiz.AttemptAnswer
		if err := rows.Scan(&a.ID, &a.AttemptID, &a.QuestionID, &a.SelectedOptionIDs, &a.IsCorrect); err != nil {
			return nil, err
		}
		answers = append(answers, &a)
	}
	return answers, nil
}

func (r *QuizRepository) CreateGenerationJob(ctx context.Context, job *quiz.GenerationJob) error {
	query := `
		INSERT INTO quiz_generation_jobs (id, subject_id, lecturer_id, status, progress, result_quiz_id, error_message, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(ctx, query, job.ID, job.SubjectID, job.LecturerID, job.Status, job.Progress, job.ResultQuizID, job.ErrorMessage, job.CreatedAt, job.UpdatedAt)
	return err
}

func (r *QuizRepository) GetGenerationJobByID(ctx context.Context, id uuid.UUID) (*quiz.GenerationJob, error) {
	query := `
		SELECT id, subject_id, lecturer_id, status, progress, result_quiz_id, error_message, created_at, updated_at
		FROM quiz_generation_jobs WHERE id = $1
	`
	row := r.db.QueryRow(ctx, query, id)
	var j quiz.GenerationJob
	err := row.Scan(&j.ID, &j.SubjectID, &j.LecturerID, &j.Status, &j.Progress, &j.ResultQuizID, &j.ErrorMessage, &j.CreatedAt, &j.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &j, nil
}

func (r *QuizRepository) UpdateGenerationJob(ctx context.Context, job *quiz.GenerationJob) error {
	query := `
		UPDATE quiz_generation_jobs
		SET status = $1, progress = $2, result_quiz_id = $3, error_message = $4, updated_at = $5
		WHERE id = $6
	`
	_, err := r.db.Exec(ctx, query, job.Status, job.Progress, job.ResultQuizID, job.ErrorMessage, job.UpdatedAt, job.ID)
	return err
}
