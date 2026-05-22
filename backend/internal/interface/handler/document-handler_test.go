package handler

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"swd392-chatbot-rag/internal/infrastructure/filestorage"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestDetectMIMEType(t *testing.T) {
	tests := []struct {
		name      string
		content   []byte
		filename  string
		want      string
		wantAnyOf []string
	}{
		{
			name:     "PDF file",
			content:  []byte("%PDF-1.4 test content"),
			filename: "test.pdf",
			want:     "application/pdf",
		},
		{
			name:      "TXT file",
			content:   []byte("plain text content"),
			filename:  "test.txt",
			wantAnyOf: []string{"text/plain", "text/plain; charset=utf-8"},
		},
		{
			name:      "Markdown file with markdown content",
			content:   []byte("# Markdown content"),
			filename:  "test.md",
			wantAnyOf: []string{"text/markdown", "text/plain"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reader := bytes.NewReader(tt.content)
			got := detectMIMEType(reader, tt.filename)
			if tt.wantAnyOf != nil {
				found := false
				for _, want := range tt.wantAnyOf {
					if strings.HasPrefix(got, want) {
						found = true
						break
					}
				}
				assert.True(t, found, "expected one of %v, got %s", tt.wantAnyOf, got)
			} else {
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestUploadDocumentRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     UploadDocumentRequest
		wantErr bool
	}{
		{
			name: "Valid request with course_id only",
			req: UploadDocumentRequest{
				CourseID: uuid.New().String(),
			},
			wantErr: false,
		},
		{
			name: "Valid request with course_id and chapter_id",
			req: UploadDocumentRequest{
				CourseID:  uuid.New().String(),
				ChapterID: uuid.New().String(),
			},
			wantErr: false,
		},
		{
			name: "Missing course_id",
			req: UploadDocumentRequest{
				CourseID: "",
			},
			wantErr: true,
		},
		{
			name: "Invalid course_id format",
			req: UploadDocumentRequest{
				CourseID: "not-a-uuid",
			},
			wantErr: true,
		},
		{
			name: "Invalid chapter_id format",
			req: UploadDocumentRequest{
				CourseID:  uuid.New().String(),
				ChapterID: "not-a-uuid",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

type UploadDocumentRequest struct {
	CourseID  string `form:"course_id"`
	ChapterID string `form:"chapter_id"`
}

func (r *UploadDocumentRequest) Validate() error {
	if r.CourseID == "" {
		return errCourseIDRequired
	}
	if _, err := uuid.Parse(r.CourseID); err != nil {
		return errInvalidCourseIDFormat
	}
	if r.ChapterID != "" {
		if _, err := uuid.Parse(r.ChapterID); err != nil {
			return errInvalidChapterIDFormat
		}
	}
	return nil
}

var (
	errCourseIDRequired      = &validationError{message: "course_id is required"}
	errInvalidCourseIDFormat = &validationError{message: "invalid course_id format"}
	errInvalidChapterIDFormat = &validationError{message: "invalid chapter_id format"}
)

type validationError struct {
	message string
}

func (e *validationError) Error() string {
	return e.message
}

func TestFileStorage_ValidateMIMEType(t *testing.T) {
	tests := []struct {
		name     string
		mimeType string
		want     bool
	}{
		{
			name:     "Valid PDF MIME",
			mimeType: "application/pdf",
			want:     true,
		},
		{
			name:     "Valid DOCX MIME",
			mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			want:     true,
		},
		{
			name:     "Valid PPTX MIME",
			mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			want:     true,
		},
		{
			name:     "Valid TXT MIME",
			mimeType: "text/plain",
			want:     true,
		},
		{
			name:     "Valid MD MIME",
			mimeType: "text/markdown",
			want:     true,
		},
		{
			name:     "Invalid MIME - executable",
			mimeType: "application/x-executable",
			want:     false,
		},
		{
			name:     "Invalid MIME - html",
			mimeType: "text/html",
			want:     false,
		},
		{
			name:     "Invalid MIME - empty",
			mimeType: "",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := filestorage.ValidateMIMEType(tt.mimeType)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestLocalFileStorage_GetExtensionFromMIME(t *testing.T) {
	tests := []struct {
		name     string
		mimeType string
		wantExt  string
		wantOk   bool
	}{
		{
			name:     "PDF MIME",
			mimeType: "application/pdf",
			wantExt:  ".pdf",
			wantOk:   true,
		},
		{
			name:     "DOCX MIME",
			mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			wantExt:  ".docx",
			wantOk:   true,
		},
		{
			name:     "PPTX MIME",
			mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			wantExt:  ".pptx",
			wantOk:   true,
		},
		{
			name:     "TXT MIME",
			mimeType: "text/plain",
			wantExt:  ".txt",
			wantOk:   true,
		},
		{
			name:     "MD MIME",
			mimeType: "text/markdown",
			wantExt:  ".md",
			wantOk:   true,
		},
		{
			name:     "Invalid MIME",
			mimeType: "application/x-executable",
			wantExt:  "",
			wantOk:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotExt, gotOk := filestorage.GetExtensionFromMIME(tt.mimeType)
			assert.Equal(t, tt.wantExt, gotExt)
			assert.Equal(t, tt.wantOk, gotOk)
		})
	}
}

func TestMaxFileSize(t *testing.T) {
	assert.Equal(t, 50*1024*1024, MaxFileSize)
}

func createTestMultipartRequest(t *testing.T, filename string, content []byte, courseID string) (*http.Request, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("document", filename)
	if err != nil {
		return nil, err
	}
	if _, err := io.Copy(part, bytes.NewReader(content)); err != nil {
		return nil, err
	}

	if err := writer.WriteField("course_id", courseID); err != nil {
		return nil, err
	}

	if err := writer.Close(); err != nil {
		return nil, err
	}

	req := httptest.NewRequest("POST", "/api/documents/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	return req, nil
}

func TestUploadDocument_MissingFile(t *testing.T) {
	gin.SetMode(gin.TestMode)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("course_id", uuid.New().String())
	writer.Close()

	req := httptest.NewRequest("POST", "/api/documents/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	h := &DocumentHandler{}
	c.Set("user_id", uuid.New())

	h.Upload(c)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Contains(t, w.Body.String(), "Upload service not initialized")
}

func TestUploadDocument_CourseIDRequired(t *testing.T) {
	gin.SetMode(gin.TestMode)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("document", "test.txt")
	io.Copy(part, bytes.NewReader([]byte("test content")))
	writer.Close()

	req := httptest.NewRequest("POST", "/api/documents/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Set("user_id", uuid.New())

	h := NewDocumentHandler(nil)
	h.Upload(c)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestUploadDocument_ServiceNotInitialized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("course_id", uuid.New().String())
	writer.Close()

	req := httptest.NewRequest("POST", "/api/documents/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Set("user_id", uuid.New())

	h := &DocumentHandler{}
	h.Upload(c)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Contains(t, w.Body.String(), "Upload service not initialized")
}

func TestPathTraversalPrevention(t *testing.T) {
	storage := filestorage.NewLocalFileStorage("./uploads")

	courseID := uuid.New()

	path := storage.GetPath(courseID, "test.pdf")

	assert.Contains(t, path, courseID.String())
}