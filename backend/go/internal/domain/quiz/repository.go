package quiz

import (
	"context"

	"github.com/google/uuid"
	"swd392-chatbot-rag/internal/domain/subject"
)

type Repository interface {
	CreateQuiz(ctx context.Context, quiz *Quiz) error
	GetQuizByID(ctx context.Context, id uuid.UUID) (*Quiz, error)
	UpdateQuiz(ctx context.Context, quiz *Quiz) error
	ListQuizzesBySubject(ctx context.Context, subjectID uuid.UUID, includeDrafts bool, lecturerID *uuid.UUID) ([]*Quiz, error)
	ListSubjectsWithPublishedQuizzes(ctx context.Context) ([]*subject.Subject, error)
	DeleteQuiz(ctx context.Context, id uuid.UUID) error

	CreateQuestion(ctx context.Context, question *Question) error
	GetQuestionsByQuizID(ctx context.Context, quizID uuid.UUID) ([]*Question, error)
	DeleteQuestionsByQuizID(ctx context.Context, quizID uuid.UUID) error

	CreateOption(ctx context.Context, option *Option) error
	GetOptionsByQuestionID(ctx context.Context, questionID uuid.UUID) ([]*Option, error)
	GetOptionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([]*Option, error)
	DeleteOptionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) error

	CreateAttempt(ctx context.Context, attempt *Attempt) error
	GetAttemptByID(ctx context.Context, id uuid.UUID) (*Attempt, error)
	UpdateAttempt(ctx context.Context, attempt *Attempt) error
	ListAttemptsByQuizAndUser(ctx context.Context, quizID, userID uuid.UUID) ([]*Attempt, error)

	CreateAttemptAnswer(ctx context.Context, answer *AttemptAnswer) error
	GetAttemptAnswersByAttemptID(ctx context.Context, attemptID uuid.UUID) ([]*AttemptAnswer, error)

	CreateGenerationJob(ctx context.Context, job *GenerationJob) error
	GetGenerationJobByID(ctx context.Context, id uuid.UUID) (*GenerationJob, error)
	UpdateGenerationJob(ctx context.Context, job *GenerationJob) error
}
