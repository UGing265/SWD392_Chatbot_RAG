package application

import (
	"context"
	"crypto/md5"
	crand "crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"strings"
	"time"

	"swd392-chatbot-rag/internal/domain/academicterm"
	"swd392-chatbot-rag/internal/domain/auditlog"
	"swd392-chatbot-rag/internal/domain/chapter"
	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/domain/documentfile"
	"swd392-chatbot-rag/internal/domain/documentreport"
	"swd392-chatbot-rag/internal/domain/documentsource"
	"swd392-chatbot-rag/internal/domain/documenttype"
	"swd392-chatbot-rag/internal/domain/language"
	"swd392-chatbot-rag/internal/domain/lecturersubject"
	"swd392-chatbot-rag/internal/domain/subject"
	"swd392-chatbot-rag/internal/domain/uploadjob"
	"swd392-chatbot-rag/internal/domain/user"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"
	"swd392-chatbot-rag/internal/infrastructure/llm"

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

type DocumentService struct {
	docRepo     document.DocumentRepository
	fileRepo    documentfile.DocumentFileRepository
	chunkRepo   chunk.ChunkRepository
	chapterRepo chapter.ChapterRepository
	subjectRepo subject.SubjectRepository
	termRepo    academicterm.AcademicTermRepository
	typeRepo    documenttype.DocumentTypeRepository
	langRepo    language.LanguageRepository
	sourceRepo  documentsource.DocumentSourceRepository
	reportRepo  documentreport.DocumentReportRepository
	jobRepo     uploadjob.UploadJobRepository
	userRepo    user.UserRepository
	auditRepo   auditlog.AuditLogRepository
	assignRepo  lecturersubject.AssignmentRepository
	s3Storage   *filestorage.S3FileStorage
	llmClient   llm.LLMClient
}

func NewDocumentService(
	docRepo document.DocumentRepository,
	fileRepo documentfile.DocumentFileRepository,
	chunkRepo chunk.ChunkRepository,
	chapterRepo chapter.ChapterRepository,
	subjectRepo subject.SubjectRepository,
	termRepo academicterm.AcademicTermRepository,
	typeRepo documenttype.DocumentTypeRepository,
	langRepo language.LanguageRepository,
	sourceRepo documentsource.DocumentSourceRepository,
	reportRepo documentreport.DocumentReportRepository,
	jobRepo uploadjob.UploadJobRepository,
	userRepo user.UserRepository,
	auditRepo auditlog.AuditLogRepository,
	assignRepo lecturersubject.AssignmentRepository,
	s3Storage *filestorage.S3FileStorage,
	llmClient llm.LLMClient,
) *DocumentService {
	return &DocumentService{
		docRepo:     docRepo,
		fileRepo:    fileRepo,
		chunkRepo:   chunkRepo,
		chapterRepo: chapterRepo,
		subjectRepo: subjectRepo,
		termRepo:    termRepo,
		typeRepo:    typeRepo,
		langRepo:    langRepo,
		sourceRepo:  sourceRepo,
		reportRepo:  reportRepo,
		jobRepo:     jobRepo,
		userRepo:    userRepo,
		auditRepo:   auditRepo,
		assignRepo:  assignRepo,
		s3Storage:   s3Storage,
		llmClient:   llmClient,
	}
}

// Slug & Helper Logic

func BuildSlug(title string) string {
	normalized := strings.ToLower(strings.TrimSpace(title))
	var sb strings.Builder
	for i := 0; i < len(normalized); i++ {
		ch := normalized[i]
		if (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') {
			sb.WriteByte(ch)
		} else if sb.Len() > 0 && sb.String()[sb.Len()-1] != '-' {
			sb.WriteByte('-')
		}
	}
	slug := strings.Trim(sb.String(), "-")
	if slug == "" {
		return "document"
	}
	return slug
}

func BuildShortCode() string {
	bytes := make([]byte, 3)
	_, _ = crand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (s *DocumentService) EnsureUniqueSlug(ctx context.Context, baseSlug string) (string, error) {
	for {
		candidate := fmt.Sprintf("%s-%s", baseSlug, BuildShortCode())
		existing, err := s.docRepo.FindBySlug(ctx, candidate)
		if err != nil {
			return "", err
		}
		if existing == nil {
			return candidate, nil
		}
	}
}

// Core Document API

func (s *DocumentService) CreateDocument(ctx context.Context, input DocumentCreateInput, fileHeaderSize int64, fileReader io.Reader) (*DocumentCreateResultDto, error) {
	if input.SubjectID == nil {
		return nil, errors.New("vui long chon mon hoc duoc phan cong")
	}
	if err := s.EnsureLecturerCanUseSubject(ctx, input.OwnerUserID, *input.SubjectID); err != nil {
		return nil, err
	}

	// MD5 Hash computation
	hasher := md5.New()
	if _, err := io.Copy(hasher, fileReader); err != nil {
		return nil, fmt.Errorf("failed to compute file md5: %w", err)
	}
	md5Hash := hex.EncodeToString(hasher.Sum(nil))

	// Check duplicates
	exists, err := s.docRepo.ExistsByMd5(ctx, md5Hash)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("Tài liệu này đã tồn tại trong hệ thống (file trùng lặp). Vui lòng kiểm tra lại.")
	}

	slugBase := BuildSlug(input.Title)
	slug, err := s.EnsureUniqueSlug(ctx, slugBase)
	if err != nil {
		return nil, err
	}

	vis := "school_wide"
	if input.Visibility != nil {
		vis = *input.Visibility
	}

	doc := &document.Document{
		ID:               uuid.New(),
		OwnerUserID:      input.OwnerUserID,
		Title:            input.Title,
		Slug:             &slug,
		Description:      input.Description,
		SubjectID:        input.SubjectID,
		DocumentTypeID:   input.DocumentTypeID,
		AcademicTermID:   input.AcademicTermID,
		LanguageID:       input.LanguageID,
		Visibility:       vis,
		DocumentSourceID: input.DocumentSourceID,
		Status:           document.StatusProcessing,
		TotalChunks:      0,
		TotalChapters:    0,
		ViewCount:        0,
		DownloadCount:    0,
		Md5Hash:          &md5Hash,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := s.docRepo.Create(ctx, doc); err != nil {
		return nil, err
	}

	return &DocumentCreateResultDto{
		ID:   doc.ID,
		Slug: slug,
	}, nil
}

func (s *DocumentService) UploadOriginalFileToS3(ctx context.Context, docID uuid.UUID, reader io.Reader, filename string, contentType string) (string, string, error) {
	key := fmt.Sprintf("%s/%s", docID.String(), filename)

	if os.Getenv("AWS_ACCESS_KEY_ID") == "" {
		// Mock successful S3 upload for local dev without AWS setup
		return key, "http://localhost:8080/mock-s3/" + key, nil
	}

	urlStr, err := s.s3Storage.Save(ctx, key, reader, contentType)
	if err != nil {
		return "", "", err
	}
	return key, urlStr, nil
}

func (s *DocumentService) EnqueueUploadJob(ctx context.Context, ownerUserID uuid.UUID, docID uuid.UUID, fileName string, s3Key string, fileSize int64) error {
	msg := "Đang chờ xử lý"
	job := &uploadjob.UploadJob{
		ID:              uuid.New(),
		OwnerUserID:     ownerUserID,
		DocumentID:      &docID,
		FileName:        fileName,
		StoragePath:     &s3Key,
		FileSizeBytes:   fileSize,
		Status:          "pending",
		ProgressPercent: 0,
		Message:         &msg,
		IsNotified:      false,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
	return s.jobRepo.Create(ctx, job)
}

func (s *DocumentService) GetDocumentDetails(ctx context.Context, docID uuid.UUID, chunkPage, chunkPageSize int, incrementViewCount bool) (*DocumentDetailsDto, error) {
	doc, err := s.docRepo.FindByID(ctx, docID)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, nil
	}

	files, err := s.fileRepo.FindByDocumentID(ctx, docID)
	if err != nil {
		return nil, err
	}

	chapters, err := s.chapterRepo.FindByDocumentID(ctx, docID)
	if err != nil {
		return nil, err
	}

	chunks, err := s.chunkRepo.FindByDocumentID(ctx, docID)
	if err != nil {
		return nil, err
	}

	// Clamp pagination
	if chunkPageSize < 8 || chunkPageSize > 10 {
		chunkPageSize = 10
	}
	totalChunks := len(chunks)
	totalPages := int(math.Ceil(float64(totalChunks) / float64(chunkPageSize)))
	if totalPages < 1 {
		totalPages = 1
	}
	if chunkPage < 1 {
		chunkPage = 1
	}
	if chunkPage > totalPages {
		chunkPage = totalPages
	}

	startIndex := (chunkPage - 1) * chunkPageSize
	endIndex := startIndex + chunkPageSize
	if endIndex > totalChunks {
		endIndex = totalChunks
	}

	var pageChunks []*chunk.Chunk
	if startIndex < totalChunks {
		pageChunks = chunks[startIndex:endIndex]
	}

	// Increment view count if first page load
	if incrementViewCount && chunkPage == 1 {
		doc.ViewCount++
		doc.UpdatedAt = time.Now()
		_ = s.docRepo.Update(ctx, doc)
	}

	// Maps DTOs
	var filesDto []DocumentFileDto
	for _, f := range files {
		filesDto = append(filesDto, DocumentFileDto{
			ID:               f.ID,
			DocumentID:       f.DocumentID,
			OriginalFilename: f.OriginalFilename,
			StoragePath:      f.StoragePath,
			S3Key:            f.S3Key,
			FileUrl:          f.FileUrl,
			MimeType:         f.MimeType,
			FileSizeBytes:    f.FileSizeBytes,
			PageCount:        f.PageCount,
			ExtractionStatus: f.ExtractionStatus,
			CreatedAt:        f.CreatedAt,
		})
	}

	var chaptersDto []DocumentChapterDto
	for _, c := range chapters {
		chaptersDto = append(chaptersDto, DocumentChapterDto{
			ID:              c.ID,
			DocumentID:      c.DocumentID,
			ParentChapterID: c.ParentChapterID,
			Title:           c.Title,
			Summary:         c.Summary,
			ChapterOrder:    c.ChapterOrder,
			StartPage:       c.StartPage,
			EndPage:         c.EndPage,
			StartChunkIndex: c.StartChunkIndex,
			EndChunkIndex:   c.EndChunkIndex,
			IsAiGenerated:   c.IsAIGenerated,
			ConfidenceScore: c.ConfidenceScore,
			CreatedAt:       c.CreatedAt,
		})
	}

	var chunksDto []DocumentChunkDto
	for _, ch := range pageChunks {
		hashVal := ""
		if ch.ChunkHash != nil {
			hashVal = *ch.ChunkHash
		}
		chunksDto = append(chunksDto, DocumentChunkDto{
			ID:            ch.ID,
			DocumentID:    ch.DocumentID,
			ChapterID:     ch.ChapterID,
			ChunkOrder:    ch.ChunkOrder,
			PageNumber:    ch.PageNumber,
			Content:       ch.Content,
			ContentTokens: ch.ContentTokens,
			Metadata:      ch.Metadata,
			ChunkHash:     hashVal,
			HasEmbedding:  len(ch.Embedding) > 0,
			CreatedAt:     ch.CreatedAt,
		})
	}

	return &DocumentDetailsDto{
		ID:                 doc.ID,
		OwnerUserID:        doc.OwnerUserID,
		OwnerFullName:      doc.OwnerFullName,
		Title:              doc.Title,
		SubjectID:          doc.SubjectID,
		SubjectName:        doc.SubjectName,
		SubjectCode:        doc.SubjectCode,
		DocumentTypeID:     doc.DocumentTypeID,
		DocumentTypeName:   doc.DocumentTypeName,
		AcademicTermName:   doc.AcademicTermName,
		AcademicTermID:     doc.AcademicTermID,
		DocumentSourceID:   doc.DocumentSourceID,
		DocumentSourceName: doc.DocumentSourceName,
		Visibility:         doc.Visibility,
		LanguageID:         doc.LanguageID,
		LanguageCode:       doc.LanguageCode,
		LanguageName:       doc.LanguageName,
		Description:        doc.Description,
		Status:             doc.Status,
		TotalChunks:        doc.TotalChunks,
		TotalChapters:      doc.TotalChapters,
		ViewCount:          doc.ViewCount,
		DownloadCount:      doc.DownloadCount,
		ApprovedAt:         doc.ApprovedAt,
		FileCount:          len(files),
		Files:              filesDto,
		Chapters:           chaptersDto,
		Chunks:             chunksDto,
	}, nil
}

func (s *DocumentService) GetDocumentDetailsBySlug(ctx context.Context, slug string, requesterUserID *uuid.UUID, chunkPage, chunkPageSize int, incrementViewCount bool, isAdmin bool) (*DocumentDetailsDto, error) {
	doc, err := s.docRepo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, nil
	}

	// Visibility verification
	if !isAdmin {
		if doc.Visibility == "private" {
			if requesterUserID == nil || *requesterUserID != doc.OwnerUserID {
				return nil, errors.New("truy cập bị từ chối")
			}
		}
	}

	return s.GetDocumentDetails(ctx, doc.ID, chunkPage, chunkPageSize, incrementViewCount)
}

func (s *DocumentService) GetOwnedDocumentDetailsBySlug(ctx context.Context, slug string, ownerUserID uuid.UUID) (*DocumentDetailsDto, error) {
	doc, err := s.docRepo.FindOwnedBySlug(ctx, slug, ownerUserID)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, nil
	}
	return s.GetDocumentDetails(ctx, doc.ID, 1, 10, false)
}

func (s *DocumentService) GetMyDocuments(ctx context.Context, ownerUserID uuid.UUID, query *string, subjectID *uuid.UUID, termID *uuid.UUID, sortBy *string, typeID *uuid.UUID, langID *uuid.UUID, sourceID *uuid.UUID, page, pageSize int) (*MyDocumentsDto, error) {
	if pageSize < 6 || pageSize > 12 {
		pageSize = 6
	}
	if page < 1 {
		page = 1
	}

	params := document.FilterParams{
		Query:            query,
		SubjectID:        subjectID,
		AcademicTermID:   termID,
		DocumentTypeID:   typeID,
		LanguageID:       langID,
		DocumentSourceID: sourceID,
		SortBy:           sortBy,
		Page:             page,
		PageSize:         pageSize,
	}

	docs, total, err := s.docRepo.FindAllOwned(ctx, ownerUserID, params)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages < 1 {
		totalPages = 1
	}

	activeJobs, err := s.jobRepo.FindActiveByOwner(ctx, ownerUserID)
	if err != nil {
		activeJobs = nil
	}

	var documentsList []DocumentListItemDto
	for _, d := range docs {
		preview := ""
		if d.Description != nil {
			preview = *d.Description
		}
		documentsList = append(documentsList, DocumentListItemDto{
			ID:               d.ID,
			Slug:             *d.Slug,
			Title:            d.Title,
			SubjectID:        d.SubjectID,
			SubjectName:      d.SubjectName,
			SubjectCode:      d.SubjectCode,
			DocumentTypeID:   d.DocumentTypeID,
			DocumentTypeName: d.DocumentTypeName,
			AcademicTermName: d.AcademicTermName,
			Status:           d.Status,
			Visibility:       d.Visibility,
			CreatedAt:        d.CreatedAt,
			UpdatedAt:        d.UpdatedAt,
			FileCount:        0, // Managed by detail query or counted later
			ChunkCount:       d.TotalChunks,
			PreviewText:      preview,
			OwnerEmail:       d.OwnerEmail,
			OwnerName:        d.OwnerFullName,
			ViewCount:        d.ViewCount,
		})
	}

	var jobsDto []UploadJobSummaryDto
	for _, j := range activeJobs {
		jobsDto = append(jobsDto, UploadJobSummaryDto{
			ID:              j.ID,
			DocumentID:      j.DocumentID,
			FileName:        j.FileName,
			FileSizeBytes:   j.FileSizeBytes,
			Status:          j.Status,
			ProgressPercent: j.ProgressPercent,
			Message:         j.Message,
			CreatedAt:       j.CreatedAt,
			UpdatedAt:       j.UpdatedAt,
		})
	}

	pending, _ := s.docRepo.CountByStatus(ctx, ownerUserID, "pending")
	approved, _ := s.docRepo.CountByStatus(ctx, ownerUserID, "approved")
	rejected, _ := s.docRepo.CountByStatus(ctx, ownerUserID, "rejected")
	totalFiles, _ := s.docRepo.CountFilesByOwner(ctx, ownerUserID)
	totalChunks, _ := s.docRepo.CountChunksByOwner(ctx, ownerUserID)

	return &MyDocumentsDto{
		Documents:         documentsList,
		TotalDocuments:    total,
		PendingDocuments:  pending,
		ApprovedDocuments: approved,
		RejectedDocuments: rejected,
		TotalFiles:        totalFiles,
		TotalChunks:       totalChunks,
		Page:              page,
		PageSize:          pageSize,
		TotalPages:        totalPages,
		ActiveUploadJobs:  jobsDto,
	}, nil
}

func (s *DocumentService) GetAllDocuments(ctx context.Context, query *string, subjectID *uuid.UUID, page, pageSize int, requesterUserID *uuid.UUID, sortBy *string, typeID *uuid.UUID, langID *uuid.UUID, sourceID *uuid.UUID) (*MyDocumentsDto, error) {
	if pageSize < 6 || pageSize > 12 {
		pageSize = 6
	}
	if page < 1 {
		page = 1
	}

	params := document.FilterParams{
		Query:            query,
		SubjectID:        subjectID,
		DocumentTypeID:   typeID,
		LanguageID:       langID,
		DocumentSourceID: sourceID,
		SortBy:           sortBy,
		Page:             page,
		PageSize:         pageSize,
	}

	docs, total, err := s.docRepo.FindAllPublic(ctx, params, requesterUserID)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages < 1 {
		totalPages = 1
	}

	var documentsList []DocumentListItemDto
	for _, d := range docs {
		preview := ""
		if d.Description != nil {
			preview = *d.Description
		}
		documentsList = append(documentsList, DocumentListItemDto{
			ID:               d.ID,
			Slug:             *d.Slug,
			Title:            d.Title,
			SubjectID:        d.SubjectID,
			SubjectName:      d.SubjectName,
			SubjectCode:      d.SubjectCode,
			DocumentTypeID:   d.DocumentTypeID,
			DocumentTypeName: d.DocumentTypeName,
			AcademicTermName: d.AcademicTermName,
			Status:           d.Status,
			Visibility:       d.Visibility,
			CreatedAt:        d.CreatedAt,
			UpdatedAt:        d.UpdatedAt,
			ChunkCount:       d.TotalChunks,
			PreviewText:      preview,
			OwnerEmail:       d.OwnerEmail,
			OwnerName:        d.OwnerFullName,
			ViewCount:        d.ViewCount,
		})
	}

	return &MyDocumentsDto{
		Documents:         documentsList,
		TotalDocuments:    total,
		PendingDocuments:  0,
		ApprovedDocuments: 0,
		RejectedDocuments: 0,
		Page:              page,
		PageSize:          pageSize,
		TotalPages:        totalPages,
		ActiveUploadJobs:  []UploadJobSummaryDto{},
	}, nil
}

func (s *DocumentService) GetActiveUploadJobs(ctx context.Context, ownerUserID uuid.UUID) ([]*UploadJobSummaryDto, error) {
	jobs, err := s.jobRepo.FindActiveByOwner(ctx, ownerUserID)
	if err != nil {
		return nil, err
	}
	var res []*UploadJobSummaryDto
	for _, j := range jobs {
		res = append(res, &UploadJobSummaryDto{
			ID:              j.ID,
			DocumentID:      j.DocumentID,
			FileName:        j.FileName,
			FileSizeBytes:   j.FileSizeBytes,
			Status:          j.Status,
			ProgressPercent: j.ProgressPercent,
			Message:         j.Message,
			CreatedAt:       j.CreatedAt,
			UpdatedAt:       j.UpdatedAt,
		})
	}
	return res, nil
}

func (s *DocumentService) GetDeleteDocumentViewDataBySlug(ctx context.Context, slug string, ownerUserID uuid.UUID) (*DeleteDocumentViewData, error) {
	doc, err := s.docRepo.FindOwnedBySlug(ctx, slug, ownerUserID)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, nil
	}

	fileCount, _ := s.docRepo.CountFilesByDocument(ctx, doc.ID)
	chunkCount, _ := s.docRepo.CountChunksByDocument(ctx, doc.ID)

	return &DeleteDocumentViewData{
		ID:         doc.ID,
		Title:      doc.Title,
		FileCount:  fileCount,
		ChunkCount: chunkCount,
	}, nil
}

func (s *DocumentService) DeleteDocument(ctx context.Context, docID uuid.UUID) error {
	doc, err := s.docRepo.FindByID(ctx, docID)
	if err != nil {
		return err
	}
	if doc == nil {
		return errors.New("document not found")
	}

	// Delete from Upload Jobs
	_ = s.jobRepo.DeleteByDocumentID(ctx, docID)

	// S3 Asset cleanup
	files, err := s.fileRepo.FindByDocumentID(ctx, docID)
	if err == nil {
		for _, f := range files {
			key := f.StoragePath
			if f.S3Key != nil && *f.S3Key != "" {
				key = *f.S3Key
			}
			if key != "" {
				_ = s.s3Storage.Delete(ctx, key)
			}
		}
	}

	// Clean references
	_ = s.fileRepo.DeleteByDocumentID(ctx, docID)
	_ = s.chunkRepo.DeleteByDocumentID(ctx, docID)
	_ = s.chapterRepo.DeleteByDocumentID(ctx, docID)
	_ = s.reportRepo.DeleteByDocumentID(ctx, docID)

	// Clean document
	return s.docRepo.Delete(ctx, docID)
}

func (s *DocumentService) UpdateDocument(ctx context.Context, docID uuid.UUID, ownerUserID uuid.UUID, title string, description *string, subjectID, typeID, termID, langID, sourceID *uuid.UUID, visibility string) error {
	doc, err := s.docRepo.FindByID(ctx, docID)
	if err != nil {
		return err
	}
	if doc == nil {
		return errors.New("document not found")
	}

	if doc.OwnerUserID != ownerUserID {
		return errors.New("truy cập bị từ chối")
	}

	if subjectID == nil {
		return errors.New("vui long chon mon hoc duoc phan cong")
	}
	if err := s.EnsureLecturerCanUseSubject(ctx, ownerUserID, *subjectID); err != nil {
		return err
	}

	doc.Title = title
	doc.Description = description
	doc.SubjectID = subjectID
	doc.DocumentTypeID = typeID
	doc.AcademicTermID = termID
	doc.LanguageID = langID
	doc.DocumentSourceID = sourceID
	doc.Visibility = visibility
	doc.UpdatedAt = time.Now()

	return s.docRepo.Update(ctx, doc)
}

func (s *DocumentService) GetDashboardSummary(ctx context.Context, ownerUserID uuid.UUID) (*DashboardSummaryDto, error) {
	recentDocs, _, err := s.docRepo.FindAllOwned(ctx, ownerUserID, document.FilterParams{Page: 1, PageSize: 5})
	if err != nil {
		recentDocs = nil
	}

	activeJobs, err := s.jobRepo.FindActiveByOwner(ctx, ownerUserID)
	if err != nil {
		activeJobs = nil
	}

	var completedMessage *string
	for _, j := range activeJobs {
		if j.Status == "done" {
			msg := fmt.Sprintf("Tệp \"%s\" đã xử lý xong.", j.FileName)
			completedMessage = &msg
			break
		}
	}

	var recentDocsDto []DashboardRecentDocumentDto
	for _, d := range recentDocs {
		subName := d.SubjectName
		recentDocsDto = append(recentDocsDto, DashboardRecentDocumentDto{
			ID:         d.ID,
			Slug:       *d.Slug,
			Title:      d.Title,
			Subject:    subName,
			Status:     d.Status,
			UpdatedAt:  d.UpdatedAt,
			FileCount:  0, // file repo details or left 0
			ChunkCount: d.TotalChunks,
		})
	}

	var activeJobsDto []UploadJobSummaryDto
	for _, j := range activeJobs {
		activeJobsDto = append(activeJobsDto, UploadJobSummaryDto{
			ID:              j.ID,
			DocumentID:      j.DocumentID,
			FileName:        j.FileName,
			FileSizeBytes:   j.FileSizeBytes,
			Status:          j.Status,
			ProgressPercent: j.ProgressPercent,
			Message:         j.Message,
			CreatedAt:       j.CreatedAt,
			UpdatedAt:       j.UpdatedAt,
		})
	}

	totalDocs, totalCount, _ := s.docRepo.FindAllOwned(ctx, ownerUserID, document.FilterParams{Page: 1, PageSize: 1})
	if totalDocs == nil {
		totalCount = 0
	}

	pending, _ := s.docRepo.CountByStatus(ctx, ownerUserID, "pending")
	approved, _ := s.docRepo.CountByStatus(ctx, ownerUserID, "approved")
	rejected, _ := s.docRepo.CountByStatus(ctx, ownerUserID, "rejected")
	totalFiles, _ := s.docRepo.CountFilesByOwner(ctx, ownerUserID)
	totalChunks, _ := s.docRepo.CountChunksByOwner(ctx, ownerUserID)

	return &DashboardSummaryDto{
		TotalDocuments:         totalCount,
		TotalChunks:            totalChunks,
		TotalFiles:             totalFiles,
		ApprovedDocuments:      approved,
		PendingDocuments:       pending,
		RejectedDocuments:      rejected,
		RecentDocuments:        recentDocsDto,
		ActiveUploadJobs:       activeJobsDto,
		CompletedUploadMessage: completedMessage,
	}, nil
}

// Metadata CRUD Implementation

func (s *DocumentService) GetSubjects(ctx context.Context) ([]*SubjectDto, error) {
	subs, err := s.subjectRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*SubjectDto
	for _, sub := range subs {
		dtos = append(dtos, &SubjectDto{
			ID:             sub.ID,
			Code:           sub.Code,
			Name:           sub.Name,
			AcademicTermID: sub.AcademicTermID,
			CreatedAt:      sub.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *DocumentService) GetPublicSubjects(ctx context.Context) ([]*SubjectDto, error) {
	subs, err := s.subjectRepo.FindAllPublic(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*SubjectDto
	for _, sub := range subs {
		dtos = append(dtos, &SubjectDto{
			ID:             sub.ID,
			Code:           sub.Code,
			Name:           sub.Name,
			AcademicTermID: sub.AcademicTermID,
			CreatedAt:      sub.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *DocumentService) GetSubjectsByOwner(ctx context.Context, ownerUserID uuid.UUID) ([]*SubjectDto, error) {
	subs, err := s.subjectRepo.FindAllByOwner(ctx, ownerUserID)
	if err != nil {
		return nil, err
	}
	var dtos []*SubjectDto
	for _, sub := range subs {
		dtos = append(dtos, &SubjectDto{
			ID:             sub.ID,
			Code:           sub.Code,
			Name:           sub.Name,
			AcademicTermID: sub.AcademicTermID,
			CreatedAt:      sub.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *DocumentService) GetAssignedSubjectsByLecturer(ctx context.Context, lecturerID uuid.UUID) ([]*SubjectDto, error) {
	assignments, err := s.assignRepo.FindByLecturer(ctx, lecturerID)
	if err != nil {
		return nil, err
	}

	var dtos []*SubjectDto
	for _, assignment := range assignments {
		sub, err := s.subjectRepo.FindByID(ctx, assignment.SubjectID)
		if err != nil {
			return nil, err
		}
		if sub == nil {
			continue
		}
		dtos = append(dtos, &SubjectDto{
			ID:             sub.ID,
			Code:           sub.Code,
			Name:           sub.Name,
			AcademicTermID: sub.AcademicTermID,
			CreatedAt:      sub.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *DocumentService) EnsureLecturerCanUseSubject(ctx context.Context, lecturerID uuid.UUID, subjectID uuid.UUID) error {
	assignment, err := s.assignRepo.FindBySubject(ctx, subjectID)
	if err != nil {
		return err
	}
	if assignment == nil {
		return errors.New("mon hoc nay chua duoc phan cong cho giang vien")
	}
	if assignment.UserID != lecturerID {
		return errors.New("giang vien khong duoc phan cong mon hoc nay")
	}
	return nil
}

func toAssignmentDto(a *lecturersubject.Assignment) *LecturerSubjectAssignmentDto {
	return &LecturerSubjectAssignmentDto{
		UserID:        a.UserID,
		SubjectID:     a.SubjectID,
		CreatedAt:     a.CreatedAt,
		LecturerEmail: a.LecturerEmail,
		LecturerName:  a.LecturerName,
		SubjectCode:   a.SubjectCode,
		SubjectName:   a.SubjectName,
	}
}

func (s *DocumentService) GetLecturerSubjectAssignments(ctx context.Context) ([]*LecturerSubjectAssignmentDto, error) {
	assignments, err := s.assignRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	dtos := make([]*LecturerSubjectAssignmentDto, 0, len(assignments))
	for _, assignment := range assignments {
		dtos = append(dtos, toAssignmentDto(assignment))
	}
	return dtos, nil
}

func (s *DocumentService) GetLecturerSubjectAssignmentsByLecturer(ctx context.Context, lecturerID uuid.UUID) ([]*LecturerSubjectAssignmentDto, error) {
	assignments, err := s.assignRepo.FindByLecturer(ctx, lecturerID)
	if err != nil {
		return nil, err
	}
	dtos := make([]*LecturerSubjectAssignmentDto, 0, len(assignments))
	for _, assignment := range assignments {
		dtos = append(dtos, toAssignmentDto(assignment))
	}
	return dtos, nil
}

func (s *DocumentService) ReplaceLecturerSubjectAssignments(ctx context.Context, lecturerID uuid.UUID, subjectIDs []uuid.UUID) ([]*LecturerSubjectAssignmentDto, error) {
	lecturer, err := s.userRepo.FindByID(ctx, lecturerID)
	if err != nil {
		return nil, err
	}
	if lecturer == nil {
		return nil, errors.New("khong tim thay giang vien")
	}
	if lecturer.RoleID != 2 {
		return nil, errors.New("nguoi dung duoc phan cong phai la lecturer")
	}

	seen := map[uuid.UUID]bool{}
	uniqueSubjectIDs := make([]uuid.UUID, 0, len(subjectIDs))
	for _, subjectID := range subjectIDs {
		if seen[subjectID] {
			continue
		}
		seen[subjectID] = true

		sub, err := s.subjectRepo.FindByID(ctx, subjectID)
		if err != nil {
			return nil, err
		}
		if sub == nil {
			return nil, fmt.Errorf("khong tim thay mon hoc: %s", subjectID)
		}

		existing, err := s.assignRepo.FindBySubject(ctx, subjectID)
		if err != nil {
			return nil, err
		}
		if existing != nil && existing.UserID != lecturerID {
			subjectLabel := subjectID.String()
			if existing.SubjectCode != nil {
				subjectLabel = *existing.SubjectCode
			}
			lecturerLabel := existing.UserID.String()
			if existing.LecturerEmail != nil {
				lecturerLabel = *existing.LecturerEmail
			}
			return nil, fmt.Errorf("mon %s da duoc phan cong cho %s", subjectLabel, lecturerLabel)
		}

		uniqueSubjectIDs = append(uniqueSubjectIDs, subjectID)
	}

	if err := s.assignRepo.ReplaceForLecturer(ctx, lecturerID, uniqueSubjectIDs); err != nil {
		return nil, err
	}
	return s.GetLecturerSubjectAssignmentsByLecturer(ctx, lecturerID)
}

func (s *DocumentService) CreateSubject(ctx context.Context, code, name string, termID *uuid.UUID) (*SubjectDto, error) {
	if code == "" || name == "" {
		return nil, errors.New("Mã môn học và tên môn học không được để trống")
	}
	normCode := strings.ToUpper(strings.TrimSpace(code))

	// Check existing
	all, _ := s.subjectRepo.FindAll(ctx)
	for _, sub := range all {
		if strings.EqualFold(sub.Code, normCode) {
			return nil, errors.New("Mã môn học đã tồn tại trong hệ thống")
		}
	}

	sub := &subject.Subject{
		ID:             uuid.New(),
		Code:           normCode,
		Name:           strings.TrimSpace(name),
		AcademicTermID: termID,
		CreatedAt:      time.Now(),
	}

	if err := s.subjectRepo.Create(ctx, sub); err != nil {
		return nil, err
	}

	return &SubjectDto{
		ID:             sub.ID,
		Code:           sub.Code,
		Name:           sub.Name,
		AcademicTermID: sub.AcademicTermID,
		CreatedAt:      sub.CreatedAt,
	}, nil
}

func (s *DocumentService) UpdateSubject(ctx context.Context, id uuid.UUID, code, name string, termID *uuid.UUID) (*SubjectDto, error) {
	if code == "" || name == "" {
		return nil, errors.New("Mã môn học và tên môn học không được để trống")
	}
	normCode := strings.ToUpper(strings.TrimSpace(code))

	sub, err := s.subjectRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if sub == nil {
		return nil, errors.New("không tìm thấy môn học")
	}

	all, _ := s.subjectRepo.FindAll(ctx)
	for _, item := range all {
		if item.ID != id && strings.EqualFold(item.Code, normCode) {
			return nil, errors.New("Mã môn học đã tồn tại trong hệ thống")
		}
	}

	sub.Code = normCode
	sub.Name = strings.TrimSpace(name)
	sub.AcademicTermID = termID

	if err := s.subjectRepo.Update(ctx, sub); err != nil {
		return nil, err
	}

	return &SubjectDto{
		ID:             sub.ID,
		Code:           sub.Code,
		Name:           sub.Name,
		AcademicTermID: sub.AcademicTermID,
		CreatedAt:      sub.CreatedAt,
	}, nil
}

func (s *DocumentService) DeleteSubject(ctx context.Context, id uuid.UUID) error {
	return s.subjectRepo.Delete(ctx, id)
}

func (s *DocumentService) GetDocumentTypes(ctx context.Context) ([]*DocumentTypeDto, error) {
	types, err := s.typeRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*DocumentTypeDto
	for _, t := range types {
		dtos = append(dtos, &DocumentTypeDto{
			ID:          t.ID,
			Name:        t.Name,
			Description: t.Description,
			CreatedAt:   t.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *DocumentService) CreateDocumentType(ctx context.Context, name string, description *string) (*DocumentTypeDto, error) {
	if name == "" {
		return nil, errors.New("Tên loại học liệu không được để trống")
	}
	trimmed := strings.TrimSpace(name)

	all, _ := s.typeRepo.FindAll(ctx)
	for _, t := range all {
		if strings.EqualFold(t.Name, trimmed) {
			return nil, errors.New("Tên loại học liệu đã tồn tại trong hệ thống")
		}
	}

	dt := &documenttype.DocumentType{
		ID:          uuid.New(),
		Name:        trimmed,
		Description: description,
		CreatedAt:   time.Now(),
	}

	if err := s.typeRepo.Create(ctx, dt); err != nil {
		return nil, err
	}

	return &DocumentTypeDto{
		ID:          dt.ID,
		Name:        dt.Name,
		Description: dt.Description,
		CreatedAt:   dt.CreatedAt,
	}, nil
}

func (s *DocumentService) UpdateDocumentType(ctx context.Context, id uuid.UUID, name string, description *string) (*DocumentTypeDto, error) {
	if name == "" {
		return nil, errors.New("Tên loại học liệu không được để trống")
	}
	trimmed := strings.TrimSpace(name)

	dt, err := s.typeRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if dt == nil {
		return nil, errors.New("không tìm thấy loại học liệu")
	}

	all, _ := s.typeRepo.FindAll(ctx)
	for _, t := range all {
		if t.ID != id && strings.EqualFold(t.Name, trimmed) {
			return nil, errors.New("Tên loại học liệu đã tồn tại trong hệ thống")
		}
	}

	dt.Name = trimmed
	dt.Description = description

	if err := s.typeRepo.Update(ctx, dt); err != nil {
		return nil, err
	}

	return &DocumentTypeDto{
		ID:          dt.ID,
		Name:        dt.Name,
		Description: dt.Description,
		CreatedAt:   dt.CreatedAt,
	}, nil
}

func (s *DocumentService) DeleteDocumentType(ctx context.Context, id uuid.UUID) error {
	return s.typeRepo.Delete(ctx, id)
}

func (s *DocumentService) GetLanguages(ctx context.Context) ([]*LanguageDto, error) {
	langs, err := s.langRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*LanguageDto
	for _, l := range langs {
		dtos = append(dtos, &LanguageDto{
			ID:        l.ID,
			Code:      l.Code,
			Name:      l.Name,
			CreatedAt: l.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *DocumentService) CreateLanguage(ctx context.Context, code, name string) (*LanguageDto, error) {
	if code == "" || name == "" {
		return nil, errors.New("Mã ngôn ngữ và tên ngôn ngữ không được để trống")
	}
	normCode := strings.ToLower(strings.TrimSpace(code))
	trimmedName := strings.TrimSpace(name)

	all, _ := s.langRepo.FindAll(ctx)
	for _, l := range all {
		if strings.EqualFold(l.Code, normCode) {
			return nil, errors.New("Mã ngôn ngữ đã tồn tại trong hệ thống")
		}
		if strings.EqualFold(l.Name, trimmedName) {
			return nil, errors.New("Tên ngôn ngữ đã tồn tại trong hệ thống")
		}
	}

	l := &language.Language{
		ID:        uuid.New(),
		Code:      normCode,
		Name:      trimmedName,
		CreatedAt: time.Now(),
	}

	if err := s.langRepo.Create(ctx, l); err != nil {
		return nil, err
	}

	return &LanguageDto{
		ID:        l.ID,
		Code:      l.Code,
		Name:      l.Name,
		CreatedAt: l.CreatedAt,
	}, nil
}

func (s *DocumentService) UpdateLanguage(ctx context.Context, id uuid.UUID, code, name string) (*LanguageDto, error) {
	if code == "" || name == "" {
		return nil, errors.New("Mã ngôn ngữ và tên ngôn ngữ không được để trống")
	}
	normCode := strings.ToLower(strings.TrimSpace(code))
	trimmedName := strings.TrimSpace(name)

	l, err := s.langRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if l == nil {
		return nil, errors.New("không tìm thấy ngôn ngữ")
	}

	all, _ := s.langRepo.FindAll(ctx)
	for _, item := range all {
		if item.ID != id && strings.EqualFold(item.Code, normCode) {
			return nil, errors.New("Mã ngôn ngữ đã tồn tại trong hệ thống")
		}
		if item.ID != id && strings.EqualFold(item.Name, trimmedName) {
			return nil, errors.New("Tên ngôn ngữ đã tồn tại trong hệ thống")
		}
	}

	l.Code = normCode
	l.Name = trimmedName

	if err := s.langRepo.Update(ctx, l); err != nil {
		return nil, err
	}

	return &LanguageDto{
		ID:        l.ID,
		Code:      l.Code,
		Name:      l.Name,
		CreatedAt: l.CreatedAt,
	}, nil
}

func (s *DocumentService) DeleteLanguage(ctx context.Context, id uuid.UUID) error {
	return s.langRepo.Delete(ctx, id)
}

func (s *DocumentService) GetDocumentSources(ctx context.Context) ([]*DocumentSourceDto, error) {
	sources, err := s.sourceRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*DocumentSourceDto
	for _, src := range sources {
		dtos = append(dtos, &DocumentSourceDto{
			ID:        src.ID,
			Name:      src.Name,
			CreatedAt: src.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *DocumentService) CreateDocumentSource(ctx context.Context, name string) (*DocumentSourceDto, error) {
	if name == "" {
		return nil, errors.New("Tên nguồn tài liệu không được để trống")
	}
	trimmed := strings.TrimSpace(name)

	all, _ := s.sourceRepo.FindAll(ctx)
	for _, s := range all {
		if strings.EqualFold(s.Name, trimmed) {
			return nil, errors.New("Tên nguồn tài liệu đã tồn tại trong hệ thống")
		}
	}

	src := &documentsource.DocumentSource{
		ID:        uuid.New(),
		Name:      trimmed,
		CreatedAt: time.Now(),
	}

	if err := s.sourceRepo.Create(ctx, src); err != nil {
		return nil, err
	}

	return &DocumentSourceDto{
		ID:        src.ID,
		Name:      src.Name,
		CreatedAt: src.CreatedAt,
	}, nil
}

func (s *DocumentService) UpdateDocumentSource(ctx context.Context, id uuid.UUID, name string) (*DocumentSourceDto, error) {
	if name == "" {
		return nil, errors.New("Tên nguồn tài liệu không được để trống")
	}
	trimmed := strings.TrimSpace(name)

	src, err := s.sourceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if src == nil {
		return nil, errors.New("không tìm thấy nguồn tài liệu")
	}

	all, _ := s.sourceRepo.FindAll(ctx)
	for _, s := range all {
		if s.ID != id && strings.EqualFold(s.Name, trimmed) {
			return nil, errors.New("Tên nguồn tài liệu đã tồn tại trong hệ thống")
		}
	}

	src.Name = trimmed

	if err := s.sourceRepo.Update(ctx, src); err != nil {
		return nil, err
	}

	return &DocumentSourceDto{
		ID:        src.ID,
		Name:      src.Name,
		CreatedAt: src.CreatedAt,
	}, nil
}

func (s *DocumentService) DeleteDocumentSource(ctx context.Context, id uuid.UUID) error {
	return s.sourceRepo.Delete(ctx, id)
}

func (s *DocumentService) GetAcademicTerms(ctx context.Context) ([]*AcademicTermDto, error) {
	terms, err := s.termRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*AcademicTermDto
	for _, term := range terms {
		dtos = append(dtos, &AcademicTermDto{
			ID:        term.ID,
			Name:      term.Name,
			Order:     term.Order,
			CreatedAt: term.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *DocumentService) CreateAcademicTerm(ctx context.Context, name string, order int) (*AcademicTermDto, error) {
	if name == "" {
		return nil, errors.New("Tên học kỳ không được để trống")
	}
	if order < 0 {
		return nil, errors.New("Thứ tự học kỳ phải lớn hơn hoặc bằng 0")
	}
	trimmed := strings.TrimSpace(name)

	all, _ := s.termRepo.FindAll(ctx)
	for _, t := range all {
		if strings.EqualFold(t.Name, trimmed) {
			return nil, errors.New("Tên học kỳ đã tồn tại trong hệ thống")
		}
	}

	t := &academicterm.AcademicTerm{
		ID:        uuid.New(),
		Name:      trimmed,
		Order:     order,
		CreatedAt: time.Now(),
	}

	if err := s.termRepo.Create(ctx, t); err != nil {
		return nil, err
	}

	return &AcademicTermDto{
		ID:        t.ID,
		Name:      t.Name,
		Order:     t.Order,
		CreatedAt: t.CreatedAt,
	}, nil
}

func (s *DocumentService) UpdateAcademicTerm(ctx context.Context, id uuid.UUID, name string, order int) (*AcademicTermDto, error) {
	if name == "" {
		return nil, errors.New("Tên học kỳ không được để trống")
	}
	if order < 0 {
		return nil, errors.New("Thứ tự học kỳ phải lớn hơn hoặc bằng 0")
	}
	trimmed := strings.TrimSpace(name)

	t, err := s.termRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, errors.New("không tìm thấy học kỳ")
	}

	all, _ := s.termRepo.FindAll(ctx)
	for _, item := range all {
		if item.ID != id && strings.EqualFold(item.Name, trimmed) {
			return nil, errors.New("Tên học kỳ đã tồn tại trong hệ thống")
		}
	}

	t.Name = trimmed
	t.Order = order

	if err := s.termRepo.Update(ctx, t); err != nil {
		return nil, err
	}

	return &AcademicTermDto{
		ID:        t.ID,
		Name:      t.Name,
		Order:     t.Order,
		CreatedAt: t.CreatedAt,
	}, nil
}

func (s *DocumentService) DeleteAcademicTerm(ctx context.Context, id uuid.UUID) error {
	return s.termRepo.Delete(ctx, id)
}

// Reports Implementation

func (s *DocumentService) ReportDocument(ctx context.Context, docID uuid.UUID, reporterUserID uuid.UUID, reason string) (*DocumentReportDto, error) {
	if strings.TrimSpace(reason) == "" {
		return nil, errors.New("Lý do báo cáo không được để trống")
	}

	doc, err := s.docRepo.FindByID(ctx, docID)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, errors.New("tài liệu không tồn tại")
	}

	report := &documentreport.DocumentReport{
		ID:             uuid.New(),
		DocumentID:     docID,
		ReporterUserID: reporterUserID,
		Reason:         strings.TrimSpace(reason),
		Status:         "pending",
		CreatedAt:      time.Now(),
	}

	if err := s.reportRepo.Create(ctx, report); err != nil {
		return nil, err
	}

	title := doc.Title
	slug := ""
	if doc.Slug != nil {
		slug = *doc.Slug
	}

	return &DocumentReportDto{
		ID:             report.ID,
		DocumentID:     report.DocumentID,
		ReporterUserID: report.ReporterUserID,
		Reason:         report.Reason,
		Status:         report.Status,
		CreatedAt:      report.CreatedAt,
		DocumentTitle:  &title,
		DocumentSlug:   &slug,
	}, nil
}

func (s *DocumentService) GetPendingReports(ctx context.Context) ([]*DocumentReportDto, error) {
	reports, err := s.reportRepo.FindPending(ctx)
	if err != nil {
		return nil, err
	}

	var dtos []*DocumentReportDto
	for _, r := range reports {
		dtos = append(dtos, &DocumentReportDto{
			ID:             r.ID,
			DocumentID:     r.DocumentID,
			ReporterUserID: r.ReporterUserID,
			Reason:         r.Reason,
			Status:         r.Status,
			CreatedAt:      r.CreatedAt,
			DocumentTitle:  r.DocumentTitle,
			DocumentSlug:   r.DocumentSlug,
			ReporterEmail:  r.ReporterEmail,
		})
	}
	return dtos, nil
}

func (s *DocumentService) ResolveReport(ctx context.Context, reportID uuid.UUID, action string) error {
	report, err := s.reportRepo.FindByID(ctx, reportID)
	if err != nil {
		return err
	}
	if report == nil {
		return errors.New("báo cáo không tồn tại")
	}

	if strings.EqualFold(action, "delete") {
		// Deletes target document
		if err := s.DeleteDocument(ctx, report.DocumentID); err != nil {
			return err
		}
	} else {
		// Resolves all reports on this document
		all, err := s.reportRepo.FindByDocumentID(ctx, report.DocumentID)
		if err == nil {
			for _, r := range all {
				r.Status = "resolved"
				_ = s.reportRepo.Update(ctx, r)
			}
		}
	}
	return nil
}

// Admin Document & User Management

func (s *DocumentService) GetAdminDocuments(ctx context.Context, query *string, subjectID *uuid.UUID, page, pageSize int) (*MyDocumentsDto, error) {
	if pageSize < 5 || pageSize > 100 {
		pageSize = 10
	}
	if page < 1 {
		page = 1
	}

	params := document.FilterParams{
		Query:     query,
		SubjectID: subjectID,
		Page:      page,
		PageSize:  pageSize,
	}

	docs, total, err := s.docRepo.FindAllAdmin(ctx, params)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages < 1 {
		totalPages = 1
	}

	var documentsList []DocumentListItemDto
	for _, d := range docs {
		preview := ""
		if d.Description != nil {
			preview = *d.Description
		}
		documentsList = append(documentsList, DocumentListItemDto{
			ID:               d.ID,
			Slug:             *d.Slug,
			Title:            d.Title,
			SubjectID:        d.SubjectID,
			SubjectName:      d.SubjectName,
			SubjectCode:      d.SubjectCode,
			DocumentTypeID:   d.DocumentTypeID,
			DocumentTypeName: d.DocumentTypeName,
			AcademicTermName: d.AcademicTermName,
			Status:           d.Status,
			Visibility:       d.Visibility,
			CreatedAt:        d.CreatedAt,
			UpdatedAt:        d.UpdatedAt,
			ChunkCount:       d.TotalChunks,
			PreviewText:      preview,
			OwnerEmail:       d.OwnerEmail,
			OwnerName:        d.OwnerFullName,
			ViewCount:        d.ViewCount,
		})
	}

	return &MyDocumentsDto{
		Documents:         documentsList,
		TotalDocuments:    total,
		PendingDocuments:  0,
		ApprovedDocuments: 0,
		RejectedDocuments: 0,
		Page:              page,
		PageSize:          pageSize,
		TotalPages:        totalPages,
		ActiveUploadJobs:  []UploadJobSummaryDto{},
	}, nil
}

func (s *DocumentService) ApproveOrRejectDocument(ctx context.Context, docID uuid.UUID, approve bool) error {
	doc, err := s.docRepo.FindByID(ctx, docID)
	if err != nil {
		return err
	}
	if doc == nil {
		return errors.New("tài liệu không tồn tại")
	}

	now := time.Now()
	if approve {
		doc.Status = "approved"
		doc.ApprovedAt = &now
	} else {
		doc.Status = "rejected"
		doc.ApprovedAt = nil
	}
	doc.UpdatedAt = now

	return s.docRepo.Update(ctx, doc)
}

func (s *DocumentService) BlockOrUnblockUser(ctx context.Context, userID uuid.UUID, block bool) error {
	u, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	if u == nil {
		return errors.New("không tìm thấy người dùng")
	}

	u.IsBlocked = block
	u.IsActive = !block
	return s.userRepo.Update(ctx, u)
}

func (s *DocumentService) GetUsers(ctx context.Context) ([]*user.User, error) {
	return s.userRepo.FindAll(ctx)
}

// CompareDocuments compares multiple documents and returns the differences and common themes.
func (s *DocumentService) CompareDocuments(ctx context.Context, documentIDs []uuid.UUID, question string) (*ComparisonResultDto, error) {
	if len(documentIDs) < 2 {
		return nil, errors.New("at least 2 documents are required for comparison")
	}

	var allChunks []*chunk.Chunk
	for _, docID := range documentIDs {
		chunks, err := s.chunkRepo.FindByDocumentID(ctx, docID)
		if err != nil {
			return nil, fmt.Errorf("failed to get chunks for document %s: %w", docID, err)
		}
		allChunks = append(allChunks, chunks...)
	}

	if len(allChunks) == 0 {
		return nil, errors.New("no content found in the provided documents")
	}

	// Limit to a reasonable number of chunks to avoid exceeding token limits
	maxChunks := 40
	if len(allChunks) > maxChunks {
		allChunks = allChunks[:maxChunks]
	}

	var contextBuilder strings.Builder
	for i, ch := range allChunks {
		contextBuilder.WriteString(fmt.Sprintf("--- Chunk %d ---\n", i+1))
		contextBuilder.WriteString(fmt.Sprintf("Document ID: %s\n", ch.DocumentID))
		contextBuilder.WriteString(fmt.Sprintf("Content:\n%s\n\n", ch.Content))
	}

	systemPrompt := `You are an expert academic document analyzer. Your task is to compare the provided documents and answer the user's question.
You MUST output your response in strict JSON format matching the following structure:
{
  "differences": [
    {
      "topic": "Topic Name",
      "document1": "How document 1 addresses this",
      "document2": "How document 2 addresses this",
      "explanation": "Brief analysis of the difference"
    }
  ],
  "commonThemes": ["Theme 1", "Theme 2"],
  "summary": "Overall summary of the comparison."
}
DO NOT wrap the JSON in Markdown formatting like ` + "`" + `` + "`" + `` + "`json" + `. Just return the raw JSON object.`

	userPrompt := fmt.Sprintf("Question: %s\n\nDocuments Context:\n%s", question, contextBuilder.String())

	history := []llm.ChatMessage{
		{Role: "user", Content: userPrompt},
	}

	responseStr, err := s.llmClient.Generate(ctx, systemPrompt, history)
	if err != nil {
		return nil, fmt.Errorf("LLM comparison failed: %w", err)
	}

	// Clean up potential markdown formatting from LLM response
	responseStr = strings.TrimSpace(responseStr)
	if strings.HasPrefix(responseStr, "```json") {
		responseStr = strings.TrimPrefix(responseStr, "```json")
		responseStr = strings.TrimSuffix(responseStr, "```")
	} else if strings.HasPrefix(responseStr, "```") {
		responseStr = strings.TrimPrefix(responseStr, "```")
		responseStr = strings.TrimSuffix(responseStr, "```")
	}

	var result ComparisonResultDto
	if err := json.Unmarshal([]byte(responseStr), &result); err != nil {
		return nil, fmt.Errorf("failed to parse comparison result: %w\nResponse was: %s", err, responseStr)
	}

	return &result, nil
}
