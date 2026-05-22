package course

import "github.com/google/uuid"

type CourseRepository interface {
	Create(course *Course) error
	FindByID(id uuid.UUID) (*Course, error)
	FindAll() ([]*Course, error)
}