package lookup_usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/documentsource"
	"swd392-chatbot-rag/internal/domain/documenttype"
	"swd392-chatbot-rag/internal/domain/language"
)

func (uc *LookupUseCase) GetDocumentTypes(ctx context.Context) ([]*application.DocumentTypeDto, error) {
	types, err := uc.typeRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*application.DocumentTypeDto
	for _, t := range types {
		dtos = append(dtos, &application.DocumentTypeDto{
			ID:          t.ID,
			Name:        t.Name,
			Description: t.Description,
			CreatedAt:   t.CreatedAt,
		})
	}
	return dtos, nil
}

func (uc *LookupUseCase) CreateDocumentType(ctx context.Context, name string, description *string) (*application.DocumentTypeDto, error) {
	if name == "" {
		return nil, errors.New("Tên loại học liệu không được để trống")
	}
	trimmed := strings.TrimSpace(name)

	all, _ := uc.typeRepo.FindAll(ctx)
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

	if err := uc.typeRepo.Create(ctx, dt); err != nil {
		return nil, err
	}

	return &application.DocumentTypeDto{
		ID:          dt.ID,
		Name:        dt.Name,
		Description: dt.Description,
		CreatedAt:   dt.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) UpdateDocumentType(ctx context.Context, id uuid.UUID, name string, description *string) (*application.DocumentTypeDto, error) {
	if name == "" {
		return nil, errors.New("Tên loại học liệu không được để trống")
	}
	trimmed := strings.TrimSpace(name)

	dt, err := uc.typeRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if dt == nil {
		return nil, errors.New("không tìm thấy loại học liệu")
	}

	all, _ := uc.typeRepo.FindAll(ctx)
	for _, t := range all {
		if t.ID != id && strings.EqualFold(t.Name, trimmed) {
			return nil, errors.New("Tên loại học liệu đã tồn tại trong hệ thống")
		}
	}

	dt.Name = trimmed
	dt.Description = description

	if err := uc.typeRepo.Update(ctx, dt); err != nil {
		return nil, err
	}

	return &application.DocumentTypeDto{
		ID:          dt.ID,
		Name:        dt.Name,
		Description: dt.Description,
		CreatedAt:   dt.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) DeleteDocumentType(ctx context.Context, id uuid.UUID) error {
	return uc.typeRepo.Delete(ctx, id)
}

func (uc *LookupUseCase) GetLanguages(ctx context.Context) ([]*application.LanguageDto, error) {
	langs, err := uc.langRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*application.LanguageDto
	for _, l := range langs {
		dtos = append(dtos, &application.LanguageDto{
			ID:        l.ID,
			Code:      l.Code,
			Name:      l.Name,
			CreatedAt: l.CreatedAt,
		})
	}
	return dtos, nil
}

func (uc *LookupUseCase) CreateLanguage(ctx context.Context, code, name string) (*application.LanguageDto, error) {
	if code == "" || name == "" {
		return nil, errors.New("Mã ngôn ngữ và tên ngôn ngữ không được để trống")
	}
	normCode := strings.ToLower(strings.TrimSpace(code))
	trimmedName := strings.TrimSpace(name)

	all, _ := uc.langRepo.FindAll(ctx)
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

	if err := uc.langRepo.Create(ctx, l); err != nil {
		return nil, err
	}

	return &application.LanguageDto{
		ID:        l.ID,
		Code:      l.Code,
		Name:      l.Name,
		CreatedAt: l.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) UpdateLanguage(ctx context.Context, id uuid.UUID, code, name string) (*application.LanguageDto, error) {
	if code == "" || name == "" {
		return nil, errors.New("Mã ngôn ngữ và tên ngôn ngữ không được để trống")
	}
	normCode := strings.ToLower(strings.TrimSpace(code))
	trimmedName := strings.TrimSpace(name)

	l, err := uc.langRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if l == nil {
		return nil, errors.New("không tìm thấy ngôn ngữ")
	}

	all, _ := uc.langRepo.FindAll(ctx)
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

	if err := uc.langRepo.Update(ctx, l); err != nil {
		return nil, err
	}

	return &application.LanguageDto{
		ID:        l.ID,
		Code:      l.Code,
		Name:      l.Name,
		CreatedAt: l.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) DeleteLanguage(ctx context.Context, id uuid.UUID) error {
	return uc.langRepo.Delete(ctx, id)
}

func (uc *LookupUseCase) GetDocumentSources(ctx context.Context) ([]*application.DocumentSourceDto, error) {
	sources, err := uc.sourceRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var dtos []*application.DocumentSourceDto
	for _, src := range sources {
		dtos = append(dtos, &application.DocumentSourceDto{
			ID:        src.ID,
			Name:      src.Name,
			CreatedAt: src.CreatedAt,
		})
	}
	return dtos, nil
}

func (uc *LookupUseCase) CreateDocumentSource(ctx context.Context, name string) (*application.DocumentSourceDto, error) {
	if name == "" {
		return nil, errors.New("Tên nguồn tài liệu không được để trống")
	}
	trimmed := strings.TrimSpace(name)

	all, _ := uc.sourceRepo.FindAll(ctx)
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

	if err := uc.sourceRepo.Create(ctx, src); err != nil {
		return nil, err
	}

	return &application.DocumentSourceDto{
		ID:        src.ID,
		Name:      src.Name,
		CreatedAt: src.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) UpdateDocumentSource(ctx context.Context, id uuid.UUID, name string) (*application.DocumentSourceDto, error) {
	if name == "" {
		return nil, errors.New("Tên nguồn tài liệu không được để trống")
	}
	trimmed := strings.TrimSpace(name)

	src, err := uc.sourceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if src == nil {
		return nil, errors.New("không tìm thấy nguồn tài liệu")
	}

	all, _ := uc.sourceRepo.FindAll(ctx)
	for _, s := range all {
		if s.ID != id && strings.EqualFold(s.Name, trimmed) {
			return nil, errors.New("Tên nguồn tài liệu đã tồn tại trong hệ thống")
		}
	}

	src.Name = trimmed

	if err := uc.sourceRepo.Update(ctx, src); err != nil {
		return nil, err
	}

	return &application.DocumentSourceDto{
		ID:        src.ID,
		Name:      src.Name,
		CreatedAt: src.CreatedAt,
	}, nil
}

func (uc *LookupUseCase) DeleteDocumentSource(ctx context.Context, id uuid.UUID) error {
	return uc.sourceRepo.Delete(ctx, id)
}
