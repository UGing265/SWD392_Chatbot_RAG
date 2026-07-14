package quiz

import (
	"time"

	"github.com/google/uuid"
)

type QuizStatus string

const (
	StatusDraft     QuizStatus = "draft"
	StatusPublished QuizStatus = "published"
	StatusArchived  QuizStatus = "archived"
)

type QuestionType string

const (
	TypeSingleChoice   QuestionType = "single_choice"
	TypeMultipleChoice QuestionType = "multiple_choice"
	TypeTrueFalse      QuestionType = "true_false"
)

type JobStatus string

const (
	JobStatusPending    JobStatus = "pending"
	JobStatusProcessing JobStatus = "processing"
	JobStatusCompleted  JobStatus = "completed"
	JobStatusFailed     JobStatus = "failed"
)

type Quiz struct {
	ID             uuid.UUID
	SubjectID      uuid.UUID
	LecturerID     uuid.UUID
	Title          string
	Description    *string
	Status         QuizStatus
	TotalQuestions int
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type Question struct {
	ID           uuid.UUID
	QuizID       uuid.UUID
	QuestionType QuestionType
	Content      string
	Explanation  *string
	OrderIndex   int
	CreatedAt    time.Time

	Options []*Option // Optional helper for aggregation
}

type Option struct {
	ID         uuid.UUID
	QuestionID uuid.UUID
	Content    string
	IsCorrect  bool
	OrderIndex int
}

type Attempt struct {
	ID           uuid.UUID
	QuizID       uuid.UUID
	UserID       uuid.UUID
	Score        float64
	TotalCorrect int
	IsPreview    bool
	StartedAt    time.Time
	CompletedAt  *time.Time
}

type AttemptAnswer struct {
	ID                uuid.UUID
	AttemptID         uuid.UUID
	QuestionID        uuid.UUID
	SelectedOptionIDs []uuid.UUID
	IsCorrect         bool
}

type GenerationJob struct {
	ID           uuid.UUID
	SubjectID    uuid.UUID
	LecturerID   uuid.UUID
	Status       JobStatus
	Progress     int
	ResultQuizID *uuid.UUID
	ErrorMessage *string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
