package documentreport

import (
	"time"

	"github.com/google/uuid"
)

type DocumentReport struct {
	ID             uuid.UUID `json:"id" db:"id"`
	DocumentID     uuid.UUID `json:"document_id" db:"document_id"`
	ReporterUserID uuid.UUID `json:"reporter_user_id" db:"reporter_user_id"`
	Reason         string    `json:"reason" db:"reason"`
	Status         string    `json:"status" db:"status"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`

	// Relation fields
	DocumentTitle *string `json:"document_title,omitempty" db:"document_title"`
	DocumentSlug  *string `json:"document_slug,omitempty" db:"document_slug"`
	ReporterEmail *string `json:"reporter_email,omitempty" db:"reporter_email"`
}
