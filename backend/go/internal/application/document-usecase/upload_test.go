package document_usecase_test

import (
	"bytes"
	"context"
	"strings"
	"testing"

	"github.com/google/uuid"
	
	"swd392-chatbot-rag/internal/application"
	document_usecase "swd392-chatbot-rag/internal/application/document-usecase"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/domain/lecturersubject"
	"swd392-chatbot-rag/internal/domain/subject"
)

// --- MOCKS ---

type mockAssignRepo struct {
	lecturersubject.AssignmentRepository
	FindBySubjectFunc func(ctx context.Context, subjectID uuid.UUID) (*lecturersubject.Assignment, error)
}
func (m *mockAssignRepo) FindBySubject(ctx context.Context, subjectID uuid.UUID) (*lecturersubject.Assignment, error) {
	if m.FindBySubjectFunc != nil {
		return m.FindBySubjectFunc(ctx, subjectID)
	}
	return nil, nil
}

type mockSubjectRepo struct {
	subject.SubjectRepository
	GetByIDFunc func(ctx context.Context, id uuid.UUID) (*subject.Subject, error)
}
func (m *mockSubjectRepo) GetByID(ctx context.Context, id uuid.UUID) (*subject.Subject, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id)
	}
	return nil, nil
}

type mockDocumentRepo struct {
	document.DocumentRepository
	FindBySlugFunc  func(ctx context.Context, slug string) (*document.Document, error)
	ExistsByMd5Func func(ctx context.Context, md5Hash string) (bool, error)
	CreateFunc      func(ctx context.Context, doc *document.Document) error
	FindByIDFunc    func(ctx context.Context, id uuid.UUID) (*document.Document, error)
}
func (m *mockDocumentRepo) FindBySlug(ctx context.Context, slug string) (*document.Document, error) {
	if m.FindBySlugFunc != nil {
		return m.FindBySlugFunc(ctx, slug)
	}
	return nil, nil
}
func (m *mockDocumentRepo) ExistsByMd5(ctx context.Context, md5Hash string) (bool, error) {
	if m.ExistsByMd5Func != nil {
		return m.ExistsByMd5Func(ctx, md5Hash)
	}
	return false, nil
}
func (m *mockDocumentRepo) Create(ctx context.Context, doc *document.Document) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, doc)
	}
	return nil
}
func (m *mockDocumentRepo) FindByID(ctx context.Context, id uuid.UUID) (*document.Document, error) {
	if m.FindByIDFunc != nil {
		return m.FindByIDFunc(ctx, id)
	}
	return nil, nil
}


// --- TESTS ---

func TestCreateDocument_Success(t *testing.T) {
	ctx := context.Background()
	subjectID := uuid.New()
	userID := uuid.New()
	vis := "school_wide"

	descStr := "Test Desc"
	descPtr := &descStr

	input := application.DocumentCreateInput{
		OwnerUserID:    userID,
		Title:          "Test Document",
		Description:    descPtr,
		SubjectID:      &subjectID,
		DocumentTypeID: nil,
		Visibility:     &vis,
	}

	docRepo := &mockDocumentRepo{
		ExistsByMd5Func: func(ctx context.Context, md5Hash string) (bool, error) {
			return false, nil
		},
		FindBySlugFunc: func(ctx context.Context, slug string) (*document.Document, error) {
			return nil, nil // Slug is unique
		},
		CreateFunc: func(ctx context.Context, doc *document.Document) error {
			return nil
		},
	}

	subRepo := &mockSubjectRepo{
		GetByIDFunc: func(ctx context.Context, id uuid.UUID) (*subject.Subject, error) {
			return &subject.Subject{ID: subjectID}, nil
		},
	}

	assignRepo := &mockAssignRepo{
		FindBySubjectFunc: func(ctx context.Context, s uuid.UUID) (*lecturersubject.Assignment, error) {
			return &lecturersubject.Assignment{UserID: userID, SubjectID: s}, nil // Lecturer is assigned
		},
	}

	uc := document_usecase.NewDocumentUseCase(
		docRepo, nil, nil, nil, nil, nil, nil, nil, nil, subRepo, assignRepo,
	)

	fileReader := bytes.NewReader([]byte("test file content"))
	
	result, err := uc.CreateDocument(ctx, input, 17, fileReader)
	
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result == nil {
		t.Fatalf("expected result, got nil")
	}
	if !strings.HasPrefix(result.Slug, "test-document") {
		t.Errorf("expected slug to start with test-document, got %s", result.Slug)
	}
}

func TestCreateDocument_DuplicateFile(t *testing.T) {
	ctx := context.Background()
	subjectID := uuid.New()
	userID := uuid.New()

	input := application.DocumentCreateInput{
		OwnerUserID: userID,
		Title:       "Test Document",
		SubjectID:   &subjectID,
	}

	docRepo := &mockDocumentRepo{
		ExistsByMd5Func: func(ctx context.Context, md5Hash string) (bool, error) {
			return true, nil // File already exists
		},
	}
	subRepo := &mockSubjectRepo{
		GetByIDFunc: func(ctx context.Context, id uuid.UUID) (*subject.Subject, error) {
			return &subject.Subject{ID: subjectID}, nil
		},
	}
	assignRepo := &mockAssignRepo{
		FindBySubjectFunc: func(ctx context.Context, s uuid.UUID) (*lecturersubject.Assignment, error) {
			return &lecturersubject.Assignment{UserID: userID, SubjectID: s}, nil
		},
	}

	uc := document_usecase.NewDocumentUseCase(
		docRepo, nil, nil, nil, nil, nil, nil, nil, nil, subRepo, assignRepo,
	)

	fileReader := bytes.NewReader([]byte("duplicate content"))
	
	_, err := uc.CreateDocument(ctx, input, 17, fileReader)
	
	if err == nil {
		t.Fatalf("expected error for duplicate file, got nil")
	}
	if !strings.Contains(err.Error(), "Tài liệu này đã tồn tại") {
		t.Errorf("expected duplicate error message, got %v", err)
	}
}

func TestCreateDocument_NoSubjectAssigned(t *testing.T) {
	ctx := context.Background()
	subjectID := uuid.New()
	userID := uuid.New()

	input := application.DocumentCreateInput{
		OwnerUserID: userID,
		Title:       "Test Document",
		SubjectID:   &subjectID,
	}

	subRepo := &mockSubjectRepo{
		GetByIDFunc: func(ctx context.Context, id uuid.UUID) (*subject.Subject, error) {
			return &subject.Subject{ID: subjectID}, nil
		},
	}
	assignRepo := &mockAssignRepo{
		FindBySubjectFunc: func(ctx context.Context, s uuid.UUID) (*lecturersubject.Assignment, error) {
			return nil, nil // Not assigned!
		},
	}

	uc := document_usecase.NewDocumentUseCase(
		nil, nil, nil, nil, nil, nil, nil, nil, nil, subRepo, assignRepo,
	)

	fileReader := bytes.NewReader([]byte("some content"))
	
	_, err := uc.CreateDocument(ctx, input, 12, fileReader)
	
	if err == nil {
		t.Fatalf("expected error for unassigned subject, got nil")
	}
	if !strings.Contains(err.Error(), "mon hoc nay chua duoc phan cong cho giang vien") {
		t.Errorf("unexpected error message: %v", err)
	}
}
