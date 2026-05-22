package handler

import (
	"errors"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"swd392-chatbot-rag/internal/application/document-usecase"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"
	"swd392-chatbot-rag/internal/interface/dto/request"
	"swd392-chatbot-rag/internal/interface/dto/response"

	"github.com/gin-gonic/gin"
	"github.com/gabriel-vasile/mimetype"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

const MaxFileSize = 50 * 1024 * 1024 // 50MB

type DocumentHandler struct {
	db          *pgxpool.Pool
	uploadUC    *document_usecase.UploadDocumentUseCase
	listUC      *document_usecase.ListDocumentsUseCase
	getUC       *document_usecase.GetDocumentUseCase
	deleteUC    *document_usecase.DeleteDocumentUseCase
	getChunksUC *document_usecase.GetChunksUseCase
	storage     *filestorage.LocalFileStorage
}

func NewDocumentHandler(db *pgxpool.Pool) *DocumentHandler {
	return &DocumentHandler{
		db:      db,
		storage: filestorage.NewLocalFileStorage("./uploads"),
	}
}

func NewDocumentHandlerWithUseCase(
	db *pgxpool.Pool,
	uploadUC *document_usecase.UploadDocumentUseCase,
	listUC *document_usecase.ListDocumentsUseCase,
	getUC *document_usecase.GetDocumentUseCase,
	deleteUC *document_usecase.DeleteDocumentUseCase,
	getChunksUC *document_usecase.GetChunksUseCase,
	storage *filestorage.LocalFileStorage,
) *DocumentHandler {
	return &DocumentHandler{
		db:          db,
		uploadUC:    uploadUC,
		listUC:      listUC,
		getUC:       getUC,
		deleteUC:    deleteUC,
		getChunksUC: getChunksUC,
		storage:     storage,
	}
}

func (h *DocumentHandler) List(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userIDUUID := userID.(uuid.UUID)

	if h.listUC != nil {
		docs, err := h.listUC.Execute(c.Request.Context(), userIDUUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch documents"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"documents": docs})
		return
	}

	// Fallback to direct query
	rows, err := h.db.Query(c.Request.Context(),
		`SELECT id, file_name, file_type, status, chunk_count, uploaded_at, indexed_at
		FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC`,
		userIDUUID.String(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch documents"})
		return
	}
	defer rows.Close()

	var documents []map[string]interface{}
	for rows.Next() {
		var id string
		var fileName, fileType, status string
		var chunkCount int
		var uploadedAt, indexedAt interface{}
		rows.Scan(&id, &fileName, &fileType, &status, &chunkCount, &uploadedAt, &indexedAt)
		documents = append(documents, map[string]interface{}{
			"id": id, "file_name": fileName, "file_type": fileType,
			"status": status, "chunk_count": chunkCount,
		})
	}

	c.JSON(http.StatusOK, gin.H{"documents": documents})
}

func (h *DocumentHandler) GetByID(c *gin.Context) {
	docIDStr := c.Param("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID format"})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	if h.getUC != nil {
		doc, err := h.getUC.Execute(c.Request.Context(), docID)
		if err != nil {
			if errors.Is(err, document_usecase.ErrDocumentNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch document"})
			return
		}

		// Check ownership
		if doc.UserID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		c.JSON(http.StatusOK, doc)
		return
	}

	// Fallback
	c.JSON(http.StatusOK, gin.H{
		"id":      docIDStr,
		"message": "Document detail endpoint - to be implemented",
	})
}

func (h *DocumentHandler) GetChunks(c *gin.Context) {
	docIDStr := c.Param("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID format"})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	// Verify document ownership
	if h.getUC != nil {
		doc, err := h.getUC.Execute(c.Request.Context(), docID)
		if err != nil {
			if errors.Is(err, document_usecase.ErrDocumentNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify document"})
			return
		}
		if doc.UserID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
	}

	if h.getChunksUC == nil {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "GetChunksUseCase not initialized"})
		return
	}

	chunks, err := h.getChunksUC.Execute(c.Request.Context(), docID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chunks"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"document_id": docIDStr,
		"chunks":      chunks,
		"count":       len(chunks),
	})
}

func detectMIMEType(r io.Reader, filename string) string {
	mimeObj, err := mimetype.DetectReader(r)
	if err != nil {
		ext := strings.ToLower(filepath.Ext(filename))
		switch ext {
		case ".pdf":
			return "application/pdf"
		case ".docx":
			return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		case ".pptx":
			return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
		case ".txt":
			return "text/plain"
		case ".md":
			return "text/markdown"
		default:
			return ""
		}
	}

	mimeStr := mimeObj.String()
	if mimeStr == "application/octet-stream" {
		ext := strings.ToLower(filepath.Ext(filename))
		switch ext {
		case ".pdf":
			return "application/pdf"
		case ".docx":
			return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		case ".pptx":
			return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
		case ".txt":
			return "text/plain"
		case ".md":
			return "text/markdown"
		}
	}
	return mimeStr
}

func (h *DocumentHandler) Upload(c *gin.Context) {
	if h.uploadUC == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload service not initialized"})
		return
	}

	file, err := c.FormFile("document")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	if file.Size > MaxFileSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 50MB limit"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}
	defer src.Close()

	mimeType := detectMIMEType(src, file.Filename)

	if !filestorage.ValidateMIMEType(mimeType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type"})
		return
	}

	var req request.UploadDocumentRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	courseID, _ := uuid.Parse(req.CourseID)
	var chapterID *uuid.UUID
	if req.ChapterID != "" {
		parsedChapterID, _ := uuid.Parse(req.ChapterID)
		chapterID = &parsedChapterID
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	result, err := h.uploadUC.Execute(c.Request.Context(), document_usecase.UploadParams{
		UserID:    userID,
		CourseID:  courseID,
		ChapterID: chapterID,
		File:      src,
		FileName:  file.Filename,
		FileSize:  file.Size,
		MIMEType:  mimeType,
	})
	if err != nil {
		if errors.Is(err, filestorage.ErrFileTooLarge) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 50MB limit"})
			return
		}
		if errors.Is(err, filestorage.ErrInvalidMIMEType) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload document"})
		return
	}

	resp := response.UploadResponse{
		DocumentID: result.DocumentID,
		Status:     result.Status,
		FileName:   result.FileName,
	}
	c.JSON(http.StatusCreated, resp)
}

func (h *DocumentHandler) Delete(c *gin.Context) {
	docIDStr := c.Param("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID format"})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	if h.deleteUC != nil {
		err := h.deleteUC.Execute(c.Request.Context(), docID, userID)
		if err != nil {
			if errors.Is(err, document_usecase.ErrDocumentNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
				return
			}
			if errors.Is(err, document_usecase.ErrAccessDenied) {
				c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete document"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Document deleted successfully"})
		return
	}

	// Fallback to direct query
	var ownerID string
	err = h.db.QueryRow(c.Request.Context(),
		"SELECT user_id FROM documents WHERE id = $1", docIDStr,
	).Scan(&ownerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}
	if ownerID != userID.String() {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	h.db.Exec(c.Request.Context(), "DELETE FROM chunks WHERE document_id = $1", docIDStr)
	h.db.Exec(c.Request.Context(), "DELETE FROM documents WHERE id = $1", docIDStr)

	c.JSON(http.StatusOK, gin.H{"message": "Document deleted"})
}