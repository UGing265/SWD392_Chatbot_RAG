# Phase 01: File Upload Handler

## Context Links

- `../plan.md` - Plan overview
- `../research/file-upload-research.md` - Research findings

## Overview

- **Priority:** High
- **Current status:** Pending
- **Brief description:** Implement secure multipart/form-data file upload handler with type detection, size validation, and path traversal prevention.

## Architecture

```
HTTP Request (multipart/form-data)
    │
    ▼
[DocumentHandler.Upload]
    │
    ├── JWT Validation → get user_id
    ├── ParseMultipartForm
    ├── Get FormFile("document")
    ├── Validate file size (max 50MB)
    ├── Detect MIME via magic bytes (mimetype)
    ├── Validate extension whitelist (.pdf, .docx, .pptx, .txt, .md)
    ├── Generate UUID filename
    ├── Secure path: uploads/{course_id}/{uuid}.ext
    ├── Write file to disk
    ├── Create Document entity (status="uploading")
    ├── Save to DB
    ├── Enqueue background indexing job
    │
    ▼
Return {document_id, status: "uploading"}
```

## Requirements

### Functional
- Accept multipart/form-data with `file`, `course_id`, `chapter_id` (optional) fields
- Return immediately with document_id and "uploading" status
- Background worker handles actual processing

### Non-Functional
- Max file size: 50MB
- Allowed types: PDF, DOCX, PPTX, TXT, MD
- Path traversal prevention via `filepath.Join` + `filepath.Clean` + prefix check
- File storage: `uploads/{course_id}/{uuid}.{ext}`

## Related Code Files

### New Files to Create
- `backend/internal/interface/handler/document-handler.go` - Upload handler
- `backend/internal/interface/dto/request/upload.go` - Request DTO
- `backend/internal/interface/dto/response/document.go` - Response DTO

### Existing Files to Modify
- `backend/internal/interface/router.go` - Add upload route

## Implementation Steps

### 1. Create Request DTO
```go
// internal/interface/dto/request/upload.go
type UploadDocumentRequest struct {
    CourseID  string `form:"course_id" json:"course_id"`
    ChapterID string `form:"chapter_id" json:"chapter_id"` // optional
}

func (r *UploadDocumentRequest) Validate() error {
    if r.CourseID == "" {
        return errors.New("course_id is required")
    }
    if _, err := uuid.Parse(r.CourseID); err != nil {
        return errors.New("invalid course_id format")
    }
    if r.ChapterID != "" {
        if _, err := uuid.Parse(r.ChapterID); err != nil {
            return errors.New("invalid chapter_id format")
        }
    }
    return nil
}
```

### 2. Create Response DTO
```go
// internal/interface/dto/response/document.go
type DocumentResponse struct {
    ID           uuid.UUID  `json:"id"`
    FileName     string     `json:"file_name"`
    FileType     string     `json:"file_type"`
    Status       string     `json:"status"`
    ChunkCount   int        `json:"chunk_count"`
    EmbeddingCount int      `json:"embedding_count"`
    UploadedAt   time.Time  `json:"uploaded_at"`
    IndexedAt    *time.Time `json:"indexed_at,omitempty"`
}

type UploadResponse struct {
    DocumentID uuid.UUID `json:"document_id"`
    Status     string    `json:"status"`
    FileName   string    `json:"file_name"`
}
```

### 3. Create DocumentHandler
```go
// internal/interface/handler/document-handler.go
const (
    maxFileSize = 50 * 1024 * 1024 // 50 MB
    maxMemory   = 10 * 1024 * 1024 // 10 MB in memory
)

type DocumentHandler struct {
    uploadUC     *application.UploadDocumentUseCase
    fileStorage  infrastructure.FileStorage
}

func (h *DocumentHandler) Upload(w http.ResponseWriter, r *http.Request) {
    // 1. Limit body size
    r.Body = http.MaxBytesReader(w, r.Body, maxFileSize)

    // 2. Parse multipart form
    if err := r.ParseMultipartForm(maxMemory); err != nil {
        http.Error(w, "file too large or invalid form", http.StatusBadRequest)
        return
    }
    defer r.MultipartForm.RemoveAll()

    // 3. Get user_id from JWT middleware
    userID, ok := middleware.GetUserID(r.Context())
    if !ok {
        http.Error(w, "unauthorized", http.StatusUnauthorized)
        return
    }

    // 4. Get file from form
    file, handler, err := r.FormFile("document")
    if err != nil {
        http.Error(w, "no file provided", http.StatusBadRequest)
        return
    }
    defer file.Close()

    // 5. Validate file size
    if handler.Size > maxFileSize {
        http.Error(w, "file exceeds 50MB limit", http.StatusBadRequest)
        return
    }

    // 6. Read file for MIME detection
    data, err := io.ReadAll(file)
    if err != nil {
        http.Error(w, "failed to read file", http.StatusInternalServerError)
        return
    }

    // 7. Detect MIME via magic bytes
    mime := mimetype.Detect(data)
    if !isAllowedMIME(mime) {
        http.Error(w, "unsupported file type", http.StatusBadRequest)
        return
    }

    // 8. Get course_id, chapter_id
    var req dto.UploadDocumentRequest
    if err := r.ParseForm(); err != nil {
        http.Error(w, "invalid form data", http.StatusBadRequest)
        return
    }
    req.CourseID = r.Form.Get("course_id")
    req.ChapterID = r.Form.Get("chapter_id")
    if err := req.Validate(); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // 9. Generate new file reader
    fileReader := bytes.NewReader(data)

    // 10. Execute use case
    resp, err := h.uploadUC.Execute(r.Context(), userID, &req, handler.Filename, fileReader, mime.Extension())
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // 11. Return response
    json.NewEncoder(w).Encode(resp)
}

func isAllowedMIME(mime *mimetype.MIME) bool {
    allowed := map[string]bool{
        "application/pdf": true,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
        "text/plain":      true,
        "text/markdown":   true,
    }
    return allowed[mime.String()]
}
```

### 4. Add Route
```go
// internal/interface/router.go
func SetupRouter(...) {
    // ...
    docs := r.Group("/api/documents")
    docs.Use(middleware.JWTAuth())
    docs.POST("/upload", docHandler.Upload)
    // ...
}
```

## Success Criteria

- [ ] File uploads via POST `/api/documents/upload` with multipart/form-data
- [ ] Returns document_id and status "uploading" immediately
- [ ] File saved to `uploads/{course_id}/{uuid}.ext`
- [ ] MIME type validated via magic bytes
- [ ] File size limit enforced (50MB)
- [ ] Path traversal prevented
- [ ] JWT required for upload
- [ ] Invalid requests return appropriate 4xx errors

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Large file DoS | Body size limit at middleware level |
| Path traversal | `filepath.Join` + prefix check + UUID filenames |
| Memory exhaustion | `ParseMultipartForm` with maxMemory limit |
| Unknown MIME types | Magic bytes detection + extension whitelist |

## Security Considerations

1. **Never trust client-filename** - generate UUID-based names
2. **MIME sniffing bypass** - check magic bytes not just extension
3. **Directory traversal** - `filepath.Clean` + prefix validation
4. **Size limits** - both per-file (50MB) and request body
5. **Authentication** - JWT required, user_id extracted from token