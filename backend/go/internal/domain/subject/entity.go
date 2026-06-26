package subject

import (
	"time"

	"github.com/google/uuid"
)

type Subject struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	Code           string     `json:"code" db:"code"`
	Name           string     `json:"name" db:"name"`
	AcademicTermID *uuid.UUID `json:"academic_term_id" db:"academic_term_id"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`

	// Relation field
	AcademicTermName *string `json:"academic_term_name,omitempty" db:"academic_term_name"`
}
