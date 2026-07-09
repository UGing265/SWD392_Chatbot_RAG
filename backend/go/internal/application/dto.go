package application

import (
	"time"

	"github.com/google/uuid"
)

var (
	AllowedExtensions = []string{".pdf", ".doc", ".docx", ".ppt", ".pptx"}
	AllowedMimeTypes  = map[string]bool{
		"application/pdf":    true,
		"application/msword": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":   true,
		"application/vnd.ms-powerpoint":                                             true,
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
	}
)

// DTO Definitions

type DocumentCreateInput struct {
	Title            string     `json:"title"`
	Description      *string    `json:"description"`
	SubjectID        *uuid.UUID `json:"subject_id"`
	DocumentTypeID   *uuid.UUID `json:"document_type_id"`
	AcademicTermID   *uuid.UUID `json:"academic_term_id"`
	LanguageID       *uuid.UUID `json:"language_id"`
	Visibility       *string    `json:"visibility"`
	DocumentSourceID *uuid.UUID `json:"document_source_id"`
	OwnerUserID      uuid.UUID  `json:"owner_user_id"`
}

type DocumentEditInput struct {
	Title            string     `json:"title"`
	Description      *string    `json:"description"`
	SubjectID        *uuid.UUID `json:"subject_id"`
	DocumentTypeID   *uuid.UUID `json:"document_type_id"`
	AcademicTermID   *uuid.UUID `json:"academic_term_id"`
	LanguageID       *uuid.UUID `json:"language_id"`
	Visibility       string     `json:"visibility"`
	DocumentSourceID *uuid.UUID `json:"document_source_id"`
}

type DocumentCreateResultDto struct {
	ID   uuid.UUID `json:"id"`
	Slug string    `json:"slug"`
}

type DocumentFileDto struct {
	ID               uuid.UUID `json:"id"`
	DocumentID       uuid.UUID `json:"document_id"`
	OriginalFilename string    `json:"original_filename"`
	StoragePath      string    `json:"storage_path"`
	S3Key            *string   `json:"s3_key"`
	FileUrl          *string   `json:"file_url"`
	MimeType         *string   `json:"mime_type"`
	FileSizeBytes    int64     `json:"file_size_bytes"`
	PageCount        *int      `json:"page_count"`
	ExtractionStatus string    `json:"extraction_status"`
	CreatedAt        time.Time `json:"created_at"`
}

type DocumentChapterDto struct {
	ID              uuid.UUID  `json:"id"`
	DocumentID      uuid.UUID  `json:"document_id"`
	ParentChapterID *uuid.UUID `json:"parent_chapter_id,omitempty"`
	Title           string     `json:"title"`
	Summary         *string    `json:"summary,omitempty"`
	ChapterOrder    int        `json:"chapter_order"`
	StartPage       *int       `json:"start_page,omitempty"`
	EndPage         *int       `json:"end_page,omitempty"`
	StartChunkIndex *int       `json:"start_chunk_index,omitempty"`
	EndChunkIndex   *int       `json:"end_chunk_index,omitempty"`
	IsAiGenerated   bool       `json:"is_ai_generated"`
	ConfidenceScore *float64   `json:"confidence_score,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

type DocumentChunkDto struct {
	ID            uuid.UUID  `json:"id"`
	DocumentID    uuid.UUID  `json:"document_id"`
	ChapterID     *uuid.UUID `json:"chapter_id,omitempty"`
	ChunkOrder    int        `json:"chunk_order"`
	PageNumber    *int       `json:"page_number,omitempty"`
	Content       string     `json:"content"`
	ContentTokens *int       `json:"content_tokens,omitempty"`
	Metadata      string     `json:"metadata"`
	ChunkHash     string     `json:"chunk_hash"`
	HasEmbedding  bool       `json:"has_embedding"`
	CreatedAt     time.Time  `json:"created_at"`
}

type DocumentDetailsDto struct {
	ID                 uuid.UUID            `json:"id"`
	OwnerUserID        uuid.UUID            `json:"owner_user_id"`
	OwnerFullName      *string              `json:"owner_full_name,omitempty"`
	Title              string               `json:"title"`
	SubjectID          *uuid.UUID           `json:"subject_id"`
	SubjectName        *string              `json:"subject_name,omitempty"`
	SubjectCode        *string              `json:"subject_code,omitempty"`
	DocumentTypeID     *uuid.UUID           `json:"document_type_id"`
	DocumentTypeName   *string              `json:"document_type_name,omitempty"`
	AcademicTermName   *string              `json:"academic_term_name,omitempty"`
	AcademicTermID     *uuid.UUID           `json:"academic_term_id"`
	DocumentSourceID   *uuid.UUID           `json:"document_source_id"`
	DocumentSourceName *string              `json:"document_source_name,omitempty"`
	Visibility         string               `json:"visibility"`
	LanguageID         *uuid.UUID           `json:"language_id"`
	LanguageCode       *string              `json:"language_code,omitempty"`
	LanguageName       *string              `json:"language_name,omitempty"`
	Description        *string              `json:"description"`
	Status             string               `json:"status"`
	TotalChunks        int                  `json:"total_chunks"`
	TotalChapters      int                  `json:"total_chapters"`
	ViewCount          int                  `json:"view_count"`
	DownloadCount      int                  `json:"download_count"`
	ApprovedAt         *time.Time           `json:"approved_at,omitempty"`
	FileCount          int                  `json:"file_count"`
	Files              []DocumentFileDto    `json:"files"`
	Chapters           []DocumentChapterDto `json:"chapters"`
	Chunks             []DocumentChunkDto   `json:"chunks"`
}

type UploadJobSummaryDto struct {
	ID              uuid.UUID  `json:"id"`
	DocumentID      *uuid.UUID `json:"document_id,omitempty"`
	FileName        string     `json:"file_name"`
	FileSizeBytes   int64      `json:"file_size_bytes"`
	Status          string     `json:"status"`
	ProgressPercent int        `json:"progress_percent"`
	Message         *string    `json:"message,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type DocumentListItemDto struct {
	ID               uuid.UUID  `json:"id"`
	Slug             string     `json:"slug"`
	Title            string     `json:"title"`
	SubjectID        *uuid.UUID `json:"subject_id"`
	SubjectName      *string    `json:"subject_name,omitempty"`
	SubjectCode      *string    `json:"subject_code,omitempty"`
	DocumentTypeID   *uuid.UUID `json:"document_type_id"`
	DocumentTypeName *string    `json:"document_type_name,omitempty"`
	AcademicTermName *string    `json:"academic_term_name,omitempty"`
	Status           string     `json:"status"`
	Visibility       string     `json:"visibility"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	FileCount        int        `json:"file_count"`
	ChunkCount       int        `json:"chunk_count"`
	PreviewText      string     `json:"preview_text"`
	OwnerEmail       *string    `json:"owner_email,omitempty"`
	OwnerName        *string    `json:"owner_name,omitempty"`
	ViewCount        int        `json:"view_count"`
}

type MyDocumentsDto struct {
	Documents         []DocumentListItemDto `json:"documents"`
	TotalDocuments    int                   `json:"total_documents"`
	PendingDocuments  int                   `json:"pending_documents"`
	ApprovedDocuments int                   `json:"approved_documents"`
	RejectedDocuments int                   `json:"rejected_documents"`
	TotalFiles        int                   `json:"total_files"`
	TotalChunks       int                   `json:"total_chunks"`
	Page              int                   `json:"page"`
	PageSize          int                   `json:"page_size"`
	TotalPages        int                   `json:"total_pages"`
	ActiveUploadJobs  []UploadJobSummaryDto `json:"active_upload_jobs"`
}

type DashboardRecentDocumentDto struct {
	ID         uuid.UUID `json:"id"`
	Slug       string    `json:"slug"`
	Title      string    `json:"title"`
	Subject    *string   `json:"subject,omitempty"`
	Status     string    `json:"status"`
	UpdatedAt  time.Time `json:"updated_at"`
	FileCount  int       `json:"file_count"`
	ChunkCount int       `json:"chunk_count"`
}

type DashboardSummaryDto struct {
	TotalDocuments         int                          `json:"total_documents"`
	TotalChunks            int                          `json:"total_chunks"`
	TotalFiles             int                          `json:"total_files"`
	ApprovedDocuments      int                          `json:"approved_documents"`
	PendingDocuments       int                          `json:"pending_documents"`
	RejectedDocuments      int                          `json:"rejected_documents"`
	RecentDocuments        []DashboardRecentDocumentDto `json:"recent_documents"`
	ActiveUploadJobs       []UploadJobSummaryDto        `json:"active_upload_jobs"`
	CompletedUploadMessage *string                      `json:"completed_upload_message,omitempty"`
}

type SubjectDto struct {
	ID             uuid.UUID  `json:"id"`
	Code           string     `json:"code"`
	Name           string     `json:"name"`
	AcademicTermID *uuid.UUID `json:"academic_term_id,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
}

type LecturerSubjectAssignmentDto struct {
	UserID        uuid.UUID `json:"user_id"`
	SubjectID     uuid.UUID `json:"subject_id"`
	CreatedAt     time.Time `json:"created_at"`
	LecturerEmail *string   `json:"lecturer_email,omitempty"`
	LecturerName  *string   `json:"lecturer_name,omitempty"`
	SubjectCode   *string   `json:"subject_code,omitempty"`
	SubjectName   *string   `json:"subject_name,omitempty"`
}

type DocumentTypeDto struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type LanguageDto struct {
	ID        uuid.UUID `json:"id"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type DocumentSourceDto struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type AcademicTermDto struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Order     int       `json:"order"`
	CreatedAt time.Time `json:"created_at"`
}

type DocumentReportDto struct {
	ID             uuid.UUID `json:"id"`
	DocumentID     uuid.UUID `json:"document_id"`
	ReporterUserID uuid.UUID `json:"reporter_user_id"`
	Reason         string    `json:"reason"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	DocumentTitle  *string   `json:"document_title,omitempty"`
	DocumentSlug   *string   `json:"document_slug,omitempty"`
	ReporterEmail  *string   `json:"reporter_email,omitempty"`
}

type DeleteDocumentViewData struct {
	ID         uuid.UUID `json:"id"`
	Title      string    `json:"title"`
	FileCount  int       `json:"file_count"`
	ChunkCount int       `json:"chunk_count"`
}

type ComparisonResultDto struct {
	Differences []struct {
		Topic       string `json:"topic"`
		Document1   string `json:"document1"`
		Document2   string `json:"document2"`
		Explanation string `json:"explanation"`
	} `json:"differences"`
	CommonThemes []string `json:"commonThemes"`
	Summary      string   `json:"summary"`
}

// Service Implementation
