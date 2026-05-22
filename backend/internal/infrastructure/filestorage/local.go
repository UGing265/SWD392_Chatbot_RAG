package filestorage

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

type FileStorage interface {
	Save(reader io.Reader, courseID uuid.UUID, fileName string, mimeType string) (string, error)
	Delete(filePath string) error
	GetPath(courseID uuid.UUID, fileName string) string
}

const (
	MaxFileSize = 50 * 1024 * 1024 // 50MB
)

var (
	ErrFileTooLarge       = errors.New("file size exceeds maximum allowed size")
	ErrInvalidMIMEType   = errors.New("invalid mime type")
	ErrEmptyFile          = errors.New("file is empty")
	ErrPathTraversal      = errors.New("path traversal detected")
)

var allowedMIMETypes = map[string]string{
	"application/pdf":                      ".pdf",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
	"text/plain":                           ".txt",
	"text/markdown":                        ".md",
}

type LocalFileStorage struct {
	basePath string
}

func NewLocalFileStorage(basePath string) *LocalFileStorage {
	return &LocalFileStorage{
		basePath: basePath,
	}
}

func (s *LocalFileStorage) Save(reader io.Reader, courseID uuid.UUID, originalFileName string, mimeType string) (string, error) {
	ext, ok := allowedMIMETypes[mimeType]
	if !ok {
		return "", ErrInvalidMIMEType
	}

	if err := os.MkdirAll(s.basePath, 0755); err != nil {
		return "", err
	}

	docID := uuid.New()
	safePath := s.buildSafePath(courseID, docID.String(), ext)

	file, err := os.Create(safePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	written, err := io.Copy(file, reader)
	if err != nil {
		os.Remove(safePath)
		return "", err
	}

	if written == 0 {
		os.Remove(safePath)
		return "", ErrEmptyFile
	}

	if written > MaxFileSize {
		os.Remove(safePath)
		return "", ErrFileTooLarge
	}

	return safePath, nil
}

func (s *LocalFileStorage) buildSafePath(courseID uuid.UUID, docID string, ext string) string {
	cleanPath := filepath.Clean(filepath.Join(s.basePath, courseID.String(), docID+ext))
	return cleanPath
}

func (s *LocalFileStorage) Delete(filePath string) error {
	cleanPath := filepath.Clean(filePath)

	if !strings.HasPrefix(cleanPath, filepath.Clean(s.basePath)) {
		return ErrPathTraversal
	}

	return os.Remove(cleanPath)
}

func (s *LocalFileStorage) GetPath(courseID uuid.UUID, fileName string) string {
	return filepath.Join(s.basePath, courseID.String(), fileName)
}

func GetExtensionFromMIME(mimeType string) (string, bool) {
	ext, ok := allowedMIMETypes[mimeType]
	return ext, ok
}

func ValidateMIMEType(mimeType string) bool {
	_, ok := allowedMIMETypes[mimeType]
	return ok
}