package lookup_usecase

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/lecturersubject"
	"swd392-chatbot-rag/internal/domain/subject"
)

func (uc *LookupUseCase) GetSubjects(ctx context.Context) ([]*application.SubjectDto, error) {
	subs, err := uc.subjectRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*application.SubjectDto
	for _, sub := range subs {
		dtos = append(dtos, &application.SubjectDto{
			ID:             sub.ID,
			Code:           sub.Code,
			Name:           sub.Name,
						CreatedAt:      sub.CreatedAt,
		})
	}
	return dtos, nil
}

func (uc *LookupUseCase) GetPublicSubjects(ctx context.Context) ([]*application.SubjectDto, error) {
	subs, err := uc.subjectRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*application.SubjectDto
	for _, sub := range subs {
		dtos = append(dtos, &application.SubjectDto{
			ID:             sub.ID,
			Code:           sub.Code,
			Name:           sub.Name,
						CreatedAt:      sub.CreatedAt,
		})
	}
	return dtos, nil
}

func (uc *LookupUseCase) GetSubjectsByOwner(ctx context.Context, ownerUserID uuid.UUID) ([]*application.SubjectDto, error) {
	subs, err := uc.subjectRepo.FindAllByOwner(ctx, ownerUserID)
	if err != nil {
		return nil, err
	}
	var dtos []*application.SubjectDto
	for _, sub := range subs {
		dtos = append(dtos, &application.SubjectDto{
			ID:             sub.ID,
			Code:           sub.Code,
			Name:           sub.Name,
						CreatedAt:      sub.CreatedAt,
		})
	}
	return dtos, nil
}

func (uc *LookupUseCase) GetAssignedSubjectsByLecturer(ctx context.Context, lecturerID uuid.UUID) ([]*application.SubjectDto, error) {
	assignments, err := uc.assignRepo.FindByLecturer(ctx, lecturerID)
	if err != nil {
		return nil, err
	}

	var dtos []*application.SubjectDto
	for _, assignment := range assignments {
		sub, err := uc.subjectRepo.FindByID(ctx, assignment.SubjectID)
		if err != nil {
			return nil, err
		}
		if sub == nil {
			continue
		}
		dtos = append(dtos, &application.SubjectDto{
			ID:             sub.ID,
			Code:           sub.Code,
			Name:           sub.Name,
						CreatedAt:      sub.CreatedAt,
		})
	}
	return dtos, nil
}

func (uc *LookupUseCase) EnsureLecturerCanUseSubject(ctx context.Context, lecturerID uuid.UUID, subjectID uuid.UUID) error {
	assignment, err := uc.assignRepo.FindBySubject(ctx, subjectID)
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

func (uc *LookupUseCase) GetLecturerSubjectAssignments(ctx context.Context) ([]*application.LecturerSubjectAssignmentDto, error) {
	assignments, err := uc.assignRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	dtos := make([]*application.LecturerSubjectAssignmentDto, 0, len(assignments))
	for _, assignment := range assignments {
		dtos = append(dtos, toAssignmentDto(assignment))
	}
	return dtos, nil
}

func (uc *LookupUseCase) GetLecturerSubjectAssignmentsByLecturer(ctx context.Context, lecturerID uuid.UUID) ([]*application.LecturerSubjectAssignmentDto, error) {
	assignments, err := uc.assignRepo.FindByLecturer(ctx, lecturerID)
	if err != nil {
		return nil, err
	}
	dtos := make([]*application.LecturerSubjectAssignmentDto, 0, len(assignments))
	for _, assignment := range assignments {
		dtos = append(dtos, toAssignmentDto(assignment))
	}
	return dtos, nil
}

func (uc *LookupUseCase) ReplaceLecturerSubjectAssignments(ctx context.Context, lecturerID uuid.UUID, subjectIDs []uuid.UUID) ([]*application.LecturerSubjectAssignmentDto, error) {
	lecturer, err := uc.userRepo.FindByID(ctx, lecturerID)
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

		sub, err := uc.subjectRepo.FindByID(ctx, subjectID)
		if err != nil {
			return nil, err
		}
		if sub == nil {
			return nil, fmt.Errorf("khong tim thay mon hoc: %s", subjectID)
		}

		existing, err := uc.assignRepo.FindBySubject(ctx, subjectID)
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

	if err := uc.assignRepo.ReplaceForLecturer(ctx, lecturerID, uniqueSubjectIDs); err != nil {
		return nil, err
	}
	return uc.GetLecturerSubjectAssignmentsByLecturer(ctx, lecturerID)
}

func (uc *LookupUseCase) CreateSubject(ctx context.Context, code, name string, termID *uuid.UUID) (*application.SubjectDto, error) {
	if code == "" || name == "" {
		return nil, errors.New("Mã môn học và tên môn học không được để trống")
	}
	normCode := strings.ToUpper(strings.TrimSpace(code))

	// Check existing
	all, _ := uc.subjectRepo.FindAll(ctx)
	for _, sub := range all {
		if strings.EqualFold(sub.Code, normCode) {
			return nil, errors.New("Mã môn học đã tồn tại trong hệ thống")
		}
	}

	sub := &subject.Subject{
		ID:             uuid.New(),
		Code:           normCode,
		Name:           strings.TrimSpace(name),
				CreatedAt:      time.Now(),
	}

	if err := uc.subjectRepo.Create(ctx, sub); err != nil {
		return nil, err
	}

	return &application.SubjectDto{
		ID:             sub.ID,
		Code:           sub.Code,
		Name:           sub.Name,
				CreatedAt:      sub.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) UpdateSubject(ctx context.Context, id uuid.UUID, code, name string, termID *uuid.UUID) (*application.SubjectDto, error) {
	if code == "" || name == "" {
		return nil, errors.New("Mã môn học và tên môn học không được để trống")
	}
	normCode := strings.ToUpper(strings.TrimSpace(code))

	sub, err := uc.subjectRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if sub == nil {
		return nil, errors.New("không tìm thấy môn học")
	}

	all, _ := uc.subjectRepo.FindAll(ctx)
	for _, item := range all {
		if item.ID != id && strings.EqualFold(item.Code, normCode) {
			return nil, errors.New("Mã môn học đã tồn tại trong hệ thống")
		}
	}

	sub.Code = normCode
	sub.Name = strings.TrimSpace(name)
	
	if err := uc.subjectRepo.Update(ctx, sub); err != nil {
		return nil, err
	}

	return &application.SubjectDto{
		ID:             sub.ID,
		Code:           sub.Code,
		Name:           sub.Name,
				CreatedAt:      sub.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) DeleteSubject(ctx context.Context, id uuid.UUID) error {
	return uc.subjectRepo.Delete(ctx, id)
}

func toAssignmentDto(a *lecturersubject.Assignment) *application.LecturerSubjectAssignmentDto {
	return &application.LecturerSubjectAssignmentDto{
		UserID:        a.UserID,
		SubjectID:     a.SubjectID,
		CreatedAt:     a.CreatedAt,
		LecturerEmail: a.LecturerEmail,
		LecturerName:  a.LecturerName,
		SubjectCode:   a.SubjectCode,
		SubjectName:   a.SubjectName,
	}
}
