package documentfile

import (
	"time"

	"github.com/google/uuid"
)

type DocumentFile struct {
	ID               uuid.UUID `json:"id" db:"id"`
	DocumentID       uuid.UUID `json:"document_id" db:"document_id"`
	OriginalFilename string    `json:"original_filename" db:"original_filename"`
	StoragePath      string    `json:"storage_path" db:"storage_path"`
	FileUrl          *string   `json:"file_url" db:"file_url"`
	MimeType         *string   `json:"mime_type" db:"mime_type"`
	FileSizeBytes    int64     `json:"file_size_bytes" db:"file_size_bytes"`
	ChecksumSha256   *string   `json:"checksum_sha256" db:"checksum_sha256"`
	PageCount        *int      `json:"page_count" db:"page_count"`
	ExtractedText    *string   `json:"extracted_text" db:"extracted_text"`
	ExtractionStatus string    `json:"extraction_status" db:"extraction_status"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	S3Bucket         *string   `json:"s3_bucket" db:"s3_bucket"`
	S3Key            *string   `json:"s3_key" db:"s3_key"`
}
