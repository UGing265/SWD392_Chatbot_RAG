package document

import (
	"time"

	"github.com/google/uuid"
)

type Document struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	OwnerUserID      uuid.UUID  `json:"owner_user_id" db:"owner_user_id"`
	Title            string     `json:"title" db:"title"`
	Description      *string    `json:"description" db:"description"`
	SubjectID        *uuid.UUID `json:"subject_id" db:"subject_id"`
	Status           string     `json:"status" db:"status"`
	Visibility       string     `json:"visibility" db:"visibility"`
	PageCount        *int       `json:"page_count" db:"page_count"`
	TotalChunks      int        `json:"total_chunks" db:"total_chunks"`
	TotalChapters    int        `json:"total_chapters" db:"total_chapters"`
	ViewCount        int        `json:"view_count" db:"view_count"`
	DownloadCount    int        `json:"download_count" db:"download_count"`
	SearchText       *string    `json:"search_text" db:"search_text"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`
	ApprovedAt       *time.Time `json:"approved_at,omitempty" db:"approved_at"`
	Slug             *string    `json:"slug" db:"slug"`
	DocumentTypeID   *uuid.UUID `json:"document_type_id" db:"document_type_id"`
	LanguageID       *uuid.UUID `json:"language_id" db:"language_id"`
	Md5Hash          *string    `json:"md5_hash" db:"md5_hash"`
	AcademicTermID   *uuid.UUID `json:"academic_term_id" db:"academic_term_id"`
	DocumentSourceID *uuid.UUID `json:"document_source_id" db:"document_source_id"`

	// Relation names
	SubjectName        *string `json:"subject_name,omitempty" db:"subject_name"`
	SubjectCode        *string `json:"subject_code,omitempty" db:"subject_code"`
	DocumentTypeName   *string `json:"document_type_name,omitempty" db:"document_type_name"`
	LanguageName       *string `json:"language_name,omitempty" db:"language_name"`
	LanguageCode       *string `json:"language_code,omitempty" db:"language_code"`
	AcademicTermName   *string `json:"academic_term_name,omitempty" db:"academic_term_name"`
	DocumentSourceName *string `json:"document_source_name,omitempty" db:"document_source_name"`
	OwnerEmail         *string `json:"owner_email,omitempty" db:"owner_email"`
	OwnerFullName      *string `json:"owner_full_name,omitempty" db:"owner_full_name"`
}

const (
	StatusPending    = "pending"
	StatusProcessing = "processing"
	StatusCompleted  = "completed"
	StatusRejected   = "rejected"
)