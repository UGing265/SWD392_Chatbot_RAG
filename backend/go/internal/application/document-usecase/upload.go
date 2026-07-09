package document_usecase

import (
	"context"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/domain/uploadjob"
)

func (uc *DocumentUseCase) EnsureUniqueSlug(ctx context.Context, baseSlug string) (string, error) {
	for {
		candidate := fmt.Sprintf("%s-%s", baseSlug, BuildShortCode())
		existing, err := uc.docRepo.FindBySlug(ctx, candidate)
		if err != nil {
			return "", err
		}
		if existing == nil {
			return candidate, nil
		}
	}
}

func (uc *DocumentUseCase) CreateDocument(ctx context.Context, input application.DocumentCreateInput, fileHeaderSize int64, fileReader io.Reader) (*application.DocumentCreateResultDto, error) {
	if input.SubjectID == nil {
		return nil, errors.New("vui long chon mon hoc duoc phan cong")
	}
	if err := uc.EnsureLecturerCanUseSubject(ctx, input.OwnerUserID, *input.SubjectID); err != nil {
		return nil, err
	}

	// MD5 Hash computation
	hasher := md5.New()
	if _, err := io.Copy(hasher, fileReader); err != nil {
		return nil, fmt.Errorf("failed to compute file md5: %w", err)
	}
	md5Hash := hex.EncodeToString(hasher.Sum(nil))

	// Check duplicates
	exists, err := uc.docRepo.ExistsByMd5(ctx, md5Hash)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("Tài liệu này đã tồn tại trong hệ thống (file trùng lặp). Vui lòng kiểm tra lại.")
	}

	slugBase := BuildSlug(input.Title)
	slug, err := uc.EnsureUniqueSlug(ctx, slugBase)
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

	if err := uc.docRepo.Create(ctx, doc); err != nil {
		return nil, err
	}

	return &application.DocumentCreateResultDto{
		ID:   doc.ID,
		Slug: slug,
	}, nil
}

func (uc *DocumentUseCase) UploadOriginalFileToS3(ctx context.Context, docID uuid.UUID, reader io.Reader, filename string, contentType string) (string, string, error) {
	key := fmt.Sprintf("%s/%s", docID.String(), filename)

	if os.Getenv("AWS_ACCESS_KEY_ID") == "" {
		// Mock successful S3 upload for local dev without AWS setup
		return key, "http://localhost:8080/mock-s3/" + key, nil
	}

	urlStr, err := uc.s3Storage.Save(ctx, key, reader, contentType)
	if err != nil {
		return "", "", err
	}
	return key, urlStr, nil
}

func (uc *DocumentUseCase) EnqueueUploadJob(ctx context.Context, ownerUserID uuid.UUID, docID uuid.UUID, fileName string, s3Key string, fileSize int64) error {
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
	return uc.jobRepo.Create(ctx, job)
}

func (uc *DocumentUseCase) GetActiveUploadJobs(ctx context.Context, ownerUserID uuid.UUID) ([]*application.UploadJobSummaryDto, error) {
	jobs, err := uc.jobRepo.FindActiveByOwner(ctx, ownerUserID)
	if err != nil {
		return nil, err
	}
	var res []*application.UploadJobSummaryDto
	for _, j := range jobs {
		res = append(res, &application.UploadJobSummaryDto{
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

func (uc *DocumentUseCase) GetRecentUploadJobs(ctx context.Context, userID uuid.UUID) ([]*uploadjob.UploadJob, error) {
	return uc.jobRepo.GetRecentJobsByUser(ctx, userID)
}

func BuildShortCode() string {
	bytes := make([]byte, 3)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

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
	res := sb.String()
	if len(res) > 0 && res[len(res)-1] == '-' {
		res = res[:len(res)-1]
	}
	return res
}
