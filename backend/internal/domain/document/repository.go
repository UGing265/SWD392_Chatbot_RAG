package document

import "github.com/google/uuid"

type DocumentRepository interface {
	Create(doc *Document) error
	FindByID(id uuid.UUID) (*Document, error)
	FindByUserID(userID uuid.UUID) ([]*Document, error)
	FindByCourseID(courseID uuid.UUID) ([]*Document, error)
	Update(doc *Document) error
	Delete(id uuid.UUID) error
}