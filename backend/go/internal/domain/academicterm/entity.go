package academicterm

import (
	"time"

	"github.com/google/uuid"
)

type AcademicTerm struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Order     int       `json:"order" db:"term_order"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
