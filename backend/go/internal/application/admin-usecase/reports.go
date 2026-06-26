package admin_usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/documentreport"
)

func (uc *AdminUseCase) ReportDocument(ctx context.Context, docID uuid.UUID, reporterUserID uuid.UUID, reason string) (*application.DocumentReportDto, error) {
	if strings.TrimSpace(reason) == "" {
		return nil, errors.New("Lý do báo cáo không được để trống")
	}

	doc, err := uc.docRepo.FindByID(ctx, docID)
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

	if err := uc.reportRepo.Create(ctx, report); err != nil {
		return nil, err
	}

	title := doc.Title
	slug := ""
	if doc.Slug != nil {
		slug = *doc.Slug
	}

	return &application.DocumentReportDto{
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

func (uc *AdminUseCase) GetPendingReports(ctx context.Context) ([]*application.DocumentReportDto, error) {
	reports, err := uc.reportRepo.FindPending(ctx)
	if err != nil {
		return nil, err
	}

	var dtos []*application.DocumentReportDto
	for _, r := range reports {
		dtos = append(dtos, &application.DocumentReportDto{
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

func (uc *AdminUseCase) ResolveReport(ctx context.Context, reportID uuid.UUID, action string) error {
	report, err := uc.reportRepo.FindByID(ctx, reportID)
	if err != nil {
		return err
	}
	if report == nil {
		return errors.New("báo cáo không tồn tại")
	}

	if strings.EqualFold(action, "delete") {
		// Deletes target document
		if err := uc.docUseCase.DeleteDocument(ctx, report.DocumentID); err != nil {
			return err
		}
	} else {
		// Resolves all reports on this document
		all, err := uc.reportRepo.FindByDocumentID(ctx, report.DocumentID)
		if err == nil {
			for _, r := range all {
				r.Status = "resolved"
				_ = uc.reportRepo.Update(ctx, r)
			}
		}
	}
	return nil
}
