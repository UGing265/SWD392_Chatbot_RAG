package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DocumentHandler struct {
	db     *pgxpool.Pool
	upload string
}

func NewDocumentHandler(db *pgxpool.Pool) *DocumentHandler {
	return &DocumentHandler{
		db:     db,
		upload: "./uploads",
	}
}

func (h *DocumentHandler) List(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userIDStr := userID.(uuid.UUID).String()

	rows, err := h.db.Query(c.Request.Context(),
		`SELECT id, file_name, file_type, status, chunk_count, uploaded_at, indexed_at
		FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC`,
		userIDStr,
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
		var uploadedAt, indexedAt *interface{}
		rows.Scan(&id, &fileName, &fileType, &status, &chunkCount, &uploadedAt, &indexedAt)
		documents = append(documents, map[string]interface{}{
			"id": id, "file_name": fileName, "file_type": fileType,
			"status": status, "chunk_count": chunkCount,
		})
	}

	c.JSON(http.StatusOK, gin.H{"documents": documents})
}

func (h *DocumentHandler) GetByID(c *gin.Context) {
	docID := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id":      docID,
		"message": "Document detail endpoint - to be implemented",
	})
}

func (h *DocumentHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	validExts := map[string]bool{".pdf": true, ".docx": true, ".pptx": true, ".txt": true, ".md": true}
	if !validExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type"})
		return
	}

	userID, _ := c.Get("user_id")
	courseID := c.PostForm("course_id")
	if courseID == "" {
		courseID = "00000000-0000-0000-0000-000000000001" // demo course
	}

	// Create uploads directory
	os.MkdirAll(h.upload, os.ModePerm)

	// Save file
	docID := uuid.New().String()
	filePath := filepath.Join(h.upload, docID+ext)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Insert into database
	_, err = h.db.Exec(c.Request.Context(),
		`INSERT INTO documents (id, user_id, course_id, file_name, file_type, file_path, status)
		VALUES ($1, $2, $3, $4, $5, $6, 'uploading')`,
		docID, userID.(uuid.UUID).String(), courseID, file.Filename, ext[1:], filePath,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save document: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":         docID,
		"file_name":  file.Filename,
		"file_type":  ext[1:],
		"status":     "uploading",
		"message":    "File uploaded. Indexing will begin shortly.",
	})
}

func (h *DocumentHandler) Delete(c *gin.Context) {
	docID := c.Param("id")
	userID, _ := c.Get("user_id")

	// Verify ownership
	var ownerID string
	err := h.db.QueryRow(c.Request.Context(),
		"SELECT user_id FROM documents WHERE id = $1", docID,
	).Scan(&ownerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}
	if ownerID != userID.(uuid.UUID).String() {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Delete chunks first
	h.db.Exec(c.Request.Context(), "DELETE FROM chunks WHERE document_id = $1", docID)
	// Delete document
	h.db.Exec(c.Request.Context(), "DELETE FROM documents WHERE id = $1", docID)

	c.JSON(http.StatusOK, gin.H{"message": "Document deleted"})
}