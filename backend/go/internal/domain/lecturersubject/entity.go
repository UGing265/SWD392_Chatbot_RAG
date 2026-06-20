package lecturersubject

import (
	"time"

	"github.com/google/uuid"
)

type Assignment struct {
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	SubjectID uuid.UUID `json:"subject_id" db:"subject_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`

	LecturerEmail *string `json:"lecturer_email,omitempty" db:"lecturer_email"`
	LecturerName  *string `json:"lecturer_name,omitempty" db:"lecturer_name"`
	SubjectCode   *string `json:"subject_code,omitempty" db:"subject_code"`
	SubjectName   *string `json:"subject_name,omitempty" db:"subject_name"`
}
