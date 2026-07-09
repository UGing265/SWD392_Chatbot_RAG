package lookup_usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/academicterm"
)

func (uc *LookupUseCase) GetAcademicTerms(ctx context.Context) ([]*application.AcademicTermDto, error) {
	terms, err := uc.termRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*application.AcademicTermDto
	for _, term := range terms {
		dtos = append(dtos, &application.AcademicTermDto{
			ID:        term.ID,
			Name:      term.Name,
			Order:     term.Order,
			CreatedAt: term.CreatedAt,
		})
	}
	return dtos, nil
}

func (uc *LookupUseCase) CreateAcademicTerm(ctx context.Context, name string, order int) (*application.AcademicTermDto, error) {
	if name == "" {
		return nil, errors.New("Tên học kỳ không được để trống")
	}
	if order < 0 {
		return nil, errors.New("Thứ tự học kỳ phải lớn hơn hoặc bằng 0")
	}
	trimmed := strings.TrimSpace(name)

	all, _ := uc.termRepo.FindAll(ctx)
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

	if err := uc.termRepo.Create(ctx, t); err != nil {
		return nil, err
	}

	return &application.AcademicTermDto{
		ID:        t.ID,
		Name:      t.Name,
		Order:     t.Order,
		CreatedAt: t.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) UpdateAcademicTerm(ctx context.Context, id uuid.UUID, name string, order int) (*application.AcademicTermDto, error) {
	if name == "" {
		return nil, errors.New("Tên học kỳ không được để trống")
	}
	if order < 0 {
		return nil, errors.New("Thứ tự học kỳ phải lớn hơn hoặc bằng 0")
	}
	trimmed := strings.TrimSpace(name)

	t, err := uc.termRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, errors.New("không tìm thấy học kỳ")
	}

	all, _ := uc.termRepo.FindAll(ctx)
	for _, item := range all {
		if item.ID != id && strings.EqualFold(item.Name, trimmed) {
			return nil, errors.New("Tên học kỳ đã tồn tại trong hệ thống")
		}
	}

	t.Name = trimmed
	t.Order = order

	if err := uc.termRepo.Update(ctx, t); err != nil {
		return nil, err
	}

	return &application.AcademicTermDto{
		ID:        t.ID,
		Name:      t.Name,
		Order:     t.Order,
		CreatedAt: t.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) DeleteAcademicTerm(ctx context.Context, id uuid.UUID) error {
	return uc.termRepo.Delete(ctx, id)
}
