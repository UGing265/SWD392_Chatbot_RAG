# Research: Go File Upload Handling

## 1. Parsing Multipart/Form-Data (net/http)

Go's standard library provides built-in support for multipart form parsing via `net/http`:

```go
// Parse the multipart form, maxMemory specifies bytes to parse in memory
// Files larger than maxMemory are written to temp storage
err := r.ParseMultipartForm(10 << 20) // 10 MB max memory

// Retrieve a specific file
file, handler, err := r.FormFile("file") // "file" is the form field name
if err != nil {
    return err
}
defer file.Close()

fmt.Printf("FileName: %s, Size: %d\n", handler.Filename, handler.Size)
```

**Key Methods on `*http.Request`:**
- `ParseMultipartForm(maxMemory int64)` - Parses entire body as multipart
- `FormFile(key string)` - Gets file and header for a field
- `FormValue(key string)` - Gets string value from form
- `MultipartReader()` - Low-level streaming access to multipart parts

## 2. File Type Detection

**Magic Bytes Detection (Recommended)**

Use the `mimetype` library for reliable detection:

```go
import "github.com/gabriel-vasile/mimetype"

mtype := mimetype.Detect(data)
fmt.Println(mtype.String()) // e.g., "application/pdf"
```

**Magic Bytes for Your Supported Types:**

| File Type | Magic Bytes (Hex) | Notes |
|-----------|-------------------|-------|
| PDF | `25 50 44 46` (%PDF) | First 4 bytes |
| DOCX/PPTX | `50 4B 03 04` (PK) | ZIP-based |
| TXT/MD | No magic bytes | Text files |

## 3. File Size Validation

```go
const maxFileSize = 10 * 1024 * 1024 // 10 MB per file

if handler.Size > maxFileSize {
    http.Error(w, "file too large", http.StatusBadRequest)
    return
}
```

## 4. Secure File Path Construction (Path Traversal Prevention)

**Critical Pattern - NEVER use user input directly in paths:**

```go
// BAD - vulnerable to path traversal
filePath := "/uploads/" + filename  // attacker can send "../../../etc/passwd"

// GOOD - validate and sanitize
filePath := filepath.Join("/uploads", filename)
filePath = filepath.Clean(filePath)

// CRITICAL - ensure result is within expected directory
expectedDir := "/uploads/course123"
if !strings.HasPrefix(cleanPath, expectedDir) {
    return errors.New("invalid file path")
}
```

## 5. Recommended Storage Pattern

Directory structure per Architecture.md:
```
uploads/
├── {course_id}/
│   ├── {uuid}.pdf
│   └── {uuid}.docx
```

Implementation checklist:
1. Generate UUID for filename (never use original filename)
2. Validate file type via magic bytes + extension whitelist
3. Enforce size limits
4. Use `os.MkdirAll` to ensure directory exists
5. Use `filepath.Join` + `filepath.Clean` for path safety
6. Store original filename metadata in database, not filesystem

## Key Libraries

| Purpose | Library | Why |
|---------|---------|-----|
| MIME detection | `github.com/gabriel-vasile/mimetype` | Fast, magic bytes based |
| UUID generation | `github.com/google/uuid` | Standard, collision-free |