package chapter

import "github.com/google/uuid"

type ChapterRepository interface {
	Create(chapter *Chapter) error
	FindByID(id uuid.UUID) (*Chapter, error)
	FindByCourseID(courseID uuid.UUID) ([]*Chapter, error)
}