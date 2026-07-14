package quizusecase

import (
	"context"

	"github.com/google/uuid"
	
	"swd392-chatbot-rag/internal/domain/quiz"
	"swd392-chatbot-rag/internal/domain/subject"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/domain/chunk"
)

type GenerateQuizReq struct {
	LecturerID          uuid.UUID
	SubjectID           uuid.UUID
	DocumentIDs         []uuid.UUID
	TotalQuestions      int
	TrueFalseCount      int
	SingleChoiceCount   int
	MultipleChoiceCount int
}

type SubmitAttemptReq struct {
	AttemptID uuid.UUID
	UserID    uuid.UUID
	Answers   []AttemptAnswerReq
}

type AttemptAnswerReq struct {
	QuestionID        uuid.UUID
	SelectedOptionIDs []uuid.UUID
}

type Usecase interface {
	// Generate
	GenerateQuizAsync(ctx context.Context, req GenerateQuizReq) (*quiz.GenerationJob, error)
	GetGenerationJobStatus(ctx context.Context, jobID uuid.UUID) (*quiz.GenerationJob, error)
	
	// Manage
	PublishQuiz(ctx context.Context, quizID uuid.UUID, lecturerID uuid.UUID) error
	GetQuizDetail(ctx context.Context, quizID uuid.UUID) (*quiz.Quiz, []*quiz.Question, error)
	ListQuizzesForStudent(ctx context.Context, subjectID uuid.UUID) ([]*quiz.Quiz, error)
	ListQuizzesForLecturer(ctx context.Context, subjectID uuid.UUID, lecturerID uuid.UUID) ([]*quiz.Quiz, error)
	ListSubjectsWithPublishedQuizzes(ctx context.Context) ([]*subject.Subject, error)

	// Take
	StartAttempt(ctx context.Context, quizID uuid.UUID, userID uuid.UUID, isPreview bool) (*quiz.Attempt, error)
	SubmitAttempt(ctx context.Context, req SubmitAttemptReq) (*quiz.Attempt, error)
	GetAttemptHistory(ctx context.Context, quizID uuid.UUID, userID uuid.UUID) ([]*quiz.Attempt, error)
}

type usecase struct {
	quizRepo     quiz.Repository
	docRepo      document.DocumentRepository
	chunkRepo    chunk.ChunkRepository
	llmService   interface{} // To be injected with LLM client
}

func NewUsecase(quizRepo quiz.Repository, docRepo document.DocumentRepository, chunkRepo chunk.ChunkRepository, llmService interface{}) Usecase {
	return &usecase{
		quizRepo:   quizRepo,
		docRepo:    docRepo,
		chunkRepo:  chunkRepo,
		llmService: llmService,
	}
}
