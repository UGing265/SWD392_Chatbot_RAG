package uploadjob

import (
	"time"

	"github.com/google/uuid"
)

type UploadJob struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	OwnerUserID     uuid.UUID  `json:"owner_user_id" db:"owner_user_id"`
	DocumentID      *uuid.UUID `json:"document_id" db:"document_id"`
	FileName        string     `json:"file_name" db:"file_name"`
	FileSizeBytes   int64      `json:"file_size_bytes" db:"file_size_bytes"`
	Status          string     `json:"status" db:"status"`
	ProgressPercent int        `json:"progress_percent" db:"progress_percent"`
	Message         *string    `json:"message" db:"message"`
	StoragePath     *string    `json:"storage_path" db:"storage_path"`
	IsNotified      bool       `json:"is_notified" db:"is_notified"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}
