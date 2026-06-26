package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"swd392-chatbot-rag/internal/application"
	admin_usecase "swd392-chatbot-rag/internal/application/admin-usecase"
	document_usecase "swd392-chatbot-rag/internal/application/document-usecase"
	lookup_usecase "swd392-chatbot-rag/internal/application/lookup-usecase"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DocumentHandler struct {
	docUseCase    *document_usecase.DocumentUseCase
	lookupUseCase *lookup_usecase.LookupUseCase
	adminUseCase  *admin_usecase.AdminUseCase
}

func NewDocumentHandler(docUseCase *document_usecase.DocumentUseCase, lookupUseCase *lookup_usecase.LookupUseCase, adminUseCase *admin_usecase.AdminUseCase) *DocumentHandler {
	return &DocumentHandler{
		docUseCase:    docUseCase,
		lookupUseCase: lookupUseCase,
		adminUseCase:  adminUseCase,
	}
}

type ReportInput struct {
	Reason string `json:"reason" binding:"required"`
}

// List godoc
// @Summary List public documents
// @Description Get a paginated list of all public documents with optional filtering
// @Tags documents
// @Security BearerAuth
// @Produce json
// @Param q query string false "Search query"
// @Param subjectId query string false "Filter by subject ID (UUID)"
// @Param documentTypeId query string false "Filter by document type ID (UUID)"
// @Param languageId query string false "Filter by language ID (UUID)"
// @Param documentSourceId query string false "Filter by source ID (UUID)"
// @Param sortBy query string false "Sort order (date_desc, date_asc, title_asc, title_desc, views_asc, views_desc)"
// @Param page query int false "Page number (default 1)"
// @Param pageSize query int false "Page size (default 6)"
// @Success 200 {object} application.MyDocumentsDto
// @Failure 500 {object} map[string]string
// @Router /api/documents [get]
func (h *DocumentHandler) List(c *gin.Context) {
	q := c.Query("q")
	var queryPtr *string
	if q != "" {
		queryPtr = &q
	}

	var subjectIDPtr *uuid.UUID
	if subIDStr := c.Query("subjectId"); subIDStr != "" {
		if subID, err := uuid.Parse(subIDStr); err == nil {
			subjectIDPtr = &subID
		}
	}

	var typeIDPtr *uuid.UUID
	if typeIDStr := c.Query("documentTypeId"); typeIDStr != "" {
		if typeID, err := uuid.Parse(typeIDStr); err == nil {
			typeIDPtr = &typeID
		}
	}

	var langIDPtr *uuid.UUID
	if langIDStr := c.Query("languageId"); langIDStr != "" {
		if langID, err := uuid.Parse(langIDStr); err == nil {
			langIDPtr = &langID
		}
	}

	var sourceIDPtr *uuid.UUID
	if sourceIDStr := c.Query("documentSourceId"); sourceIDStr != "" {
		if sourceID, err := uuid.Parse(sourceIDStr); err == nil {
			sourceIDPtr = &sourceID
		}
	}

	sortBy := c.DefaultQuery("sortBy", "date_desc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "6"))

	// Requester ID (optional if public)
	var requesterIDPtr *uuid.UUID
	if userIDVal, exists := c.Get("user_id"); exists {
		uid := userIDVal.(uuid.UUID)
		requesterIDPtr = &uid
	}

	result, err := h.docUseCase.GetAllDocuments(c.Request.Context(), queryPtr, subjectIDPtr, page, pageSize, requesterIDPtr, &sortBy, typeIDPtr, langIDPtr, sourceIDPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch documents: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// MyDocuments godoc
// @Summary List owned documents
// @Description Get a list of documents owned by the logged-in lecturer
// @Tags documents
// @Security BearerAuth
// @Produce json
// @Param q query string false "Search query"
// @Param subjectId query string false "Filter by subject ID (UUID)"
// @Param termId query string false "Filter by term ID (UUID)"
// @Param documentTypeId query string false "Filter by document type ID (UUID)"
// @Param languageId query string false "Filter by language ID (UUID)"
// @Param documentSourceId query string false "Filter by source ID (UUID)"
// @Param sortBy query string false "Sort order"
// @Param page query int false "Page number"
// @Param pageSize query int false "Page size"
// @Success 200 {object} application.MyDocumentsDto
// @Failure 500 {object} map[string]string
// @Router /api/documents/my [get]
func (h *DocumentHandler) MyDocuments(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	q := c.Query("q")
	var queryPtr *string
	if q != "" {
		queryPtr = &q
	}

	var subjectIDPtr *uuid.UUID
	if subIDStr := c.Query("subjectId"); subIDStr != "" {
		if subID, err := uuid.Parse(subIDStr); err == nil {
			subjectIDPtr = &subID
		}
	}

	var termIDPtr *uuid.UUID
	if termIDStr := c.Query("termId"); termIDStr != "" {
		if termID, err := uuid.Parse(termIDStr); err == nil {
			termIDPtr = &termID
		}
	}

	var typeIDPtr *uuid.UUID
	if typeIDStr := c.Query("documentTypeId"); typeIDStr != "" {
		if typeID, err := uuid.Parse(typeIDStr); err == nil {
			typeIDPtr = &typeID
		}
	}

	var langIDPtr *uuid.UUID
	if langIDStr := c.Query("languageId"); langIDStr != "" {
		if langID, err := uuid.Parse(langIDStr); err == nil {
			langIDPtr = &langID
		}
	}

	var sourceIDPtr *uuid.UUID
	if sourceIDStr := c.Query("documentSourceId"); sourceIDStr != "" {
		if sourceID, err := uuid.Parse(sourceIDStr); err == nil {
			sourceIDPtr = &sourceID
		}
	}

	sortBy := c.DefaultQuery("sortBy", "date_desc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "6"))

	result, err := h.docUseCase.GetMyDocuments(c.Request.Context(), userID, queryPtr, subjectIDPtr, termIDPtr, &sortBy, typeIDPtr, langIDPtr, sourceIDPtr, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch my documents: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// Upload godoc
// @Summary Upload document file
// @Description Upload a document file (PDF/DOC/DOCX/PPT/PPTX) and start indexing
// @Tags documents
// @Security BearerAuth
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Document file"
// @Param title formData string false "Title"
// @Param description formData string false "Description"
// @Param subject_id formData string false "Subject ID (UUID)"
// @Param document_type_id formData string false "Document Type ID (UUID)"
// @Param academic_term_id formData string false "Academic Term ID (UUID)"
// @Param language_id formData string false "Language ID (UUID)"
// @Param document_source_id formData string false "Document Source ID (UUID)"
// @Param visibility formData string false "Visibility (public, school_wide, private)"
// @Success 201 {object} application.DocumentCreateResultDto
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/documents/upload [post]
func (h *DocumentHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	importLog := func(format string, v ...interface{}) {
		println(fmt.Sprintf("[UploadAPI] "+format, v...))
	}

	importLog("Bắt đầu xử lý file: %s (%d bytes)", file.Filename, file.Size)

	// Validate extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := false
	for _, a := range application.AllowedExtensions {
		if a == ext {
			allowed = true
			break
		}
	}
	if !allowed {
		importLog("LỖI: Định dạng file %s không được hỗ trợ", ext)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Chỉ hỗ trợ PDF, DOC, DOCX, PPT, PPTX"})
		return
	}

	title := c.PostForm("title")
	if strings.TrimSpace(title) == "" {
		title = file.Filename
	}

	description := c.PostForm("description")
	var descPtr *string
	if description != "" {
		descPtr = &description
	}

	var subjectID *uuid.UUID
	if subIDStr := c.PostForm("subject_id"); subIDStr != "" {
		if uid, err := uuid.Parse(subIDStr); err == nil {
			subjectID = &uid
		}
	}

	var typeID *uuid.UUID
	if typeIDStr := c.PostForm("document_type_id"); typeIDStr != "" {
		if uid, err := uuid.Parse(typeIDStr); err == nil {
			typeID = &uid
		}
	}

	var termID *uuid.UUID
	if termIDStr := c.PostForm("academic_term_id"); termIDStr != "" {
		if uid, err := uuid.Parse(termIDStr); err == nil {
			termID = &uid
		}
	}

	var langID *uuid.UUID
	if langIDStr := c.PostForm("language_id"); langIDStr != "" {
		if uid, err := uuid.Parse(langIDStr); err == nil {
			langID = &uid
		}
	}

	var sourceID *uuid.UUID
	if sourceIDStr := c.PostForm("document_source_id"); sourceIDStr != "" {
		if uid, err := uuid.Parse(sourceIDStr); err == nil {
			sourceID = &uid
		}
	}

	visibility := c.DefaultPostForm("visibility", "school_wide")
	userID := c.MustGet("user_id").(uuid.UUID)

	src, err := file.Open()
	if err != nil {
		importLog("LỖI: Không thể mở file reader: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}
	defer src.Close()

	input := application.DocumentCreateInput{
		Title:            title,
		Description:      descPtr,
		SubjectID:        subjectID,
		DocumentTypeID:   typeID,
		AcademicTermID:   termID,
		LanguageID:       langID,
		Visibility:       &visibility,
		DocumentSourceID: sourceID,
		OwnerUserID:      userID,
	}

	importLog("1. Đang tính MD5 và tạo bản ghi tài liệu trong Database...")
	saved, err := h.docUseCase.CreateDocument(c.Request.Context(), input, file.Size, src)
	if err != nil {
		importLog("LỖI khi tạo bản ghi tài liệu: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	importLog("✓ Đã tạo bản ghi tài liệu thành công. ID: %s, Slug: %s", saved.ID, saved.Slug)

	// Re-open for upload to S3
	freshSrc, err := file.Open()
	if err != nil {
		importLog("LỖI: Không thể mở lại file để upload S3: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file for S3 upload"})
		return
	}
	defer freshSrc.Close()

	importLog("2. Đang thực hiện upload file gốc lên AWS S3 (Bucket: %s)...", "aws-prn222-bucket")
	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	s3Key, _, err := h.docUseCase.UploadOriginalFileToS3(c.Request.Context(), saved.ID, freshSrc, file.Filename, contentType)
	if err != nil {
		importLog("LỖI khi upload lên AWS S3: %v", err)
		// Clean up the created document if upload fails
		_ = h.docUseCase.DeleteDocument(c.Request.Context(), saved.ID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "S3 upload failed: " + err.Error()})
		return
	}
	importLog("✓ Upload AWS S3 thành công. S3 Key: %s", s3Key)

	importLog("3. Đang đưa tác vụ chạy ngầm (Upload Job) vào hàng đợi...")
	err = h.docUseCase.EnqueueUploadJob(c.Request.Context(), userID, saved.ID, file.Filename, s3Key, file.Size)
	if err != nil {
		importLog("LỖI khi đưa Job chạy ngầm vào DB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enqueue background job: " + err.Error()})
		return
	}
	importLog("✓ Đã đưa tác vụ chạy ngầm vào hàng đợi thành công.")

	c.JSON(http.StatusCreated, saved)
}

// Details godoc
// @Summary Get document details by slug
// @Description Get detailed information of a document including files, chapters, and paginated chunks
// @Tags documents
// @Security BearerAuth
// @Produce json
// @Param slug path string true "Document Slug"
// @Param chunkPage query int false "Chunk page number (default 1)"
// @Param chunkPageSize query int false "Chunk page size (default 10, range 8-10)"
// @Success 200 {object} application.DocumentDetailsDto
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/documents/{slug} [get]
func (h *DocumentHandler) Details(c *gin.Context) {
	slug := c.Param("slug")
	chunkPage, _ := strconv.Atoi(c.DefaultQuery("chunkPage", "1"))
	chunkPageSize, _ := strconv.Atoi(c.DefaultQuery("chunkPageSize", "10"))

	var requesterIDPtr *uuid.UUID
	if userIDVal, exists := c.Get("user_id"); exists {
		uid := userIDVal.(uuid.UUID)
		requesterIDPtr = &uid
	}

	roleIDVal, roleExists := c.Get("role_id")
	isAdmin := false
	if roleExists && roleIDVal.(int16) == 1 {
		isAdmin = true
	}

	details, err := h.docUseCase.GetDocumentDetailsBySlug(c.Request.Context(), slug, requesterIDPtr, chunkPage, chunkPageSize, chunkPage == 1, isAdmin)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	if details == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	c.JSON(http.StatusOK, details)
}

// Edit godoc
// @Summary Edit document details
// @Description Update metadata info of a document owned by the lecturer
// @Tags documents
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param slug path string true "Document Slug"
// @Param body body application.DocumentEditInput true "Edit details"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/documents/{slug}/edit [post]
func (h *DocumentHandler) Edit(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var input struct {
		ID               string  `json:"id" binding:"required"`
		Title            string  `json:"title" binding:"required"`
		Description      *string `json:"description"`
		SubjectID        *string `json:"subject_id"`
		DocumentTypeID   *string `json:"document_type_id"`
		AcademicTermID   *string `json:"academic_term_id"`
		LanguageID       *string `json:"language_id"`
		Visibility       string  `json:"visibility" binding:"required"`
		DocumentSourceID *string `json:"document_source_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	docID, err := uuid.Parse(input.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	var subjectID *uuid.UUID
	if input.SubjectID != nil && *input.SubjectID != "" {
		if uid, err := uuid.Parse(*input.SubjectID); err == nil {
			subjectID = &uid
		}
	}

	var typeID *uuid.UUID
	if input.DocumentTypeID != nil && *input.DocumentTypeID != "" {
		if uid, err := uuid.Parse(*input.DocumentTypeID); err == nil {
			typeID = &uid
		}
	}

	var termID *uuid.UUID
	if input.AcademicTermID != nil && *input.AcademicTermID != "" {
		if uid, err := uuid.Parse(*input.AcademicTermID); err == nil {
			termID = &uid
		}
	}

	var langID *uuid.UUID
	if input.LanguageID != nil && *input.LanguageID != "" {
		if uid, err := uuid.Parse(*input.LanguageID); err == nil {
			langID = &uid
		}
	}

	var sourceID *uuid.UUID
	if input.DocumentSourceID != nil && *input.DocumentSourceID != "" {
		if uid, err := uuid.Parse(*input.DocumentSourceID); err == nil {
			sourceID = &uid
		}
	}

	err = h.docUseCase.UpdateDocument(c.Request.Context(), docID, userID, input.Title, input.Description, subjectID, typeID, termID, langID, sourceID, input.Visibility)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Document updated successfully"})
}

// Delete godoc
// @Summary Delete document
// @Description Delete document from database and S3 (only owner lecturer can delete)
// @Tags documents
// @Security BearerAuth
// @Produce json
// @Param slug path string true "Document Slug"
// @Success 200 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/documents/{slug}/delete [post]
func (h *DocumentHandler) Delete(c *gin.Context) {
	slug := c.Param("slug")
	userID := c.MustGet("user_id").(uuid.UUID)

	// Verify ownership
	details, err := h.docUseCase.GetOwnedDocumentDetailsBySlug(c.Request.Context(), slug, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if details == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found or access denied"})
		return
	}

	if err := h.docUseCase.DeleteDocument(c.Request.Context(), details.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete document: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Document deleted successfully"})
}

// DeleteViewData godoc
// @Summary Get delete document preview stats
// @Description View statistics of files and chunks that will be deleted prior to confirmation
// @Tags documents
// @Security BearerAuth
// @Produce json
// @Param slug path string true "Document Slug"
// @Success 200 {object} application.DeleteDocumentViewData
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/documents/{slug}/delete-view [get]
func (h *DocumentHandler) DeleteViewData(c *gin.Context) {
	slug := c.Param("slug")
	userID := c.MustGet("user_id").(uuid.UUID)

	viewData, err := h.docUseCase.GetDeleteDocumentViewDataBySlug(c.Request.Context(), slug, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if viewData == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	c.JSON(http.StatusOK, viewData)
}

// Report godoc
// @Summary Report document violation
// @Description Send a violation report for a document
// @Tags documents
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param slug path string true "Document Slug"
// @Param body body handler.ReportInput true "Report Reason"
// @Success 200 {object} application.DocumentReportDto
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/documents/{slug}/report [post]
func (h *DocumentHandler) Report(c *gin.Context) {
	slug := c.Param("slug")
	userID := c.MustGet("user_id").(uuid.UUID)

	var req ReportInput

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	doc, err := h.docUseCase.GetDocumentDetailsBySlug(c.Request.Context(), slug, &userID, 1, 1, false, false)
	if err != nil || doc == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	report, err := h.adminUseCase.ReportDocument(c.Request.Context(), doc.ID, userID, req.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// Dashboard godoc
// @Summary Lecturer dashboard statistics
// @Description Get document, file, and chunk count statistics for the logged-in lecturer
// @Tags lecturer
// @Security BearerAuth
// @Produce json
// @Success 200 {object} application.DashboardSummaryDto
// @Failure 500 {object} map[string]string
// @Router /api/documents/dashboard [get]
func (h *DocumentHandler) Dashboard(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	summary, err := h.adminUseCase.GetDashboardSummary(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}

// GetMetadataLookups godoc
// @Summary Get metadata lookups
// @Description Get dropdown listings of academic terms, subjects, types, sources, languages
// @Tags metadata
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/documents/lookups [get]
func (h *DocumentHandler) GetMetadataLookups(c *gin.Context) {
	var subjects interface{}
	if roleIDVal, exists := c.Get("role_id"); exists && roleIDVal.(int16) == 2 {
		userID := c.MustGet("user_id").(uuid.UUID)
		assignedSubjects, err := h.lookupUseCase.GetAssignedSubjectsByLecturer(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		subjects = assignedSubjects
	} else {
		allSubjects, _ := h.lookupUseCase.GetSubjects(c.Request.Context())
		subjects = allSubjects
	}
	types, _ := h.lookupUseCase.GetDocumentTypes(c.Request.Context())
	langs, _ := h.lookupUseCase.GetLanguages(c.Request.Context())
	sources, _ := h.lookupUseCase.GetDocumentSources(c.Request.Context())
	terms, _ := h.lookupUseCase.GetAcademicTerms(c.Request.Context())

	c.JSON(http.StatusOK, gin.H{
		"subjects":        subjects,
		"documentTypes":   types,
		"languages":       langs,
		"documentSources": sources,
		"academicTerms":   terms,
	})
}

// PublicSubjects godoc
// @Summary Get public subjects
// @Description Get a list of subjects that are public
// @Tags metadata
// @Produce json
// @Success 200 {array} application.SubjectDto
// @Router /api/subjects/public [get]
func (h *DocumentHandler) PublicSubjects(c *gin.Context) {
	publicSubjects, err := h.lookupUseCase.GetPublicSubjects(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, publicSubjects)
}

type CompareDocumentsRequest struct {
	DocumentIDs []string `json:"document_ids" binding:"required,min=2"`
	Question    string   `json:"question" binding:"required"`
}

// CompareDocuments godoc
// @Summary Compare documents
// @Description Compare multiple documents by extracting chunks and using LLM
// @Tags documents
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body handler.CompareDocumentsRequest true "Comparison Request"
// @Success 200 {object} application.ComparisonResultDto
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/documents/compare [post]
func (h *DocumentHandler) CompareDocuments(c *gin.Context) {
	var req CompareDocumentsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	docIDs := make([]uuid.UUID, 0, len(req.DocumentIDs))
	for _, idStr := range req.DocumentIDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID in document_ids"})
			return
		}
		docIDs = append(docIDs, id)
	}

	result, err := h.docUseCase.CompareDocuments(c.Request.Context(), docIDs, req.Question)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// ToggleBookmark godoc
// @Summary Toggle bookmark
// @Description Add or remove a document from bookmarks
// @Tags documents
// @Security BearerAuth
// @Produce json
// @Param slug path string true "Document Slug"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /api/documents/{slug}/bookmark [post]
func (h *DocumentHandler) ToggleBookmark(c *gin.Context) {
	slug := c.Param("slug")
	userID := c.MustGet("user_id").(uuid.UUID)

	// Need to find document ID by slug first
	doc, err := h.docUseCase.GetDocumentDetailsBySlug(c.Request.Context(), slug, nil, 1, 1, false, false)
	if err != nil || doc == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	bookmarked, err := h.docUseCase.ToggleBookmark(c.Request.Context(), userID, doc.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Bookmark toggled",
		"bookmarked": bookmarked,
	})
}

// ListBookmarks godoc
// @Summary List bookmarked documents
// @Description Get a list of documents bookmarked by the current user
// @Tags documents
// @Security BearerAuth
// @Produce json
// @Success 200 {array} application.DocumentDetailsDto
// @Failure 500 {object} map[string]string
// @Router /api/documents/bookmarks [get]
func (h *DocumentHandler) ListBookmarks(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	docs, err := h.docUseCase.ListBookmarks(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, docs)
}

// GetUploadJobs godoc
// @Summary List upload jobs
// @Description Get recent upload jobs for current user
// @Tags documents
// @Security BearerAuth
// @Produce json
// @Success 200 {array} uploadjob.UploadJob
// @Failure 500 {object} map[string]string
// @Router /api/documents/upload-jobs [get]
func (h *DocumentHandler) GetUploadJobs(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	jobs, err := h.docUseCase.GetRecentUploadJobs(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

// ExportCompareDocuments godoc
// @Summary Export document comparison to PDF
// @Description Compare multiple documents and export the result as a PDF
// @Tags documents
// @Security BearerAuth
// @Accept json
// @Produce application/pdf
// @Param body body handler.CompareDocumentsRequest true "Comparison Request"
// @Success 200 {file} file "ComparisonResult.pdf"
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/documents/compare/export [post]
func (h *DocumentHandler) ExportCompareDocuments(c *gin.Context) {
	var req CompareDocumentsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.DocumentIDs) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least two documents are required for comparison"})
		return
	}

	docIDs := make([]uuid.UUID, len(req.DocumentIDs))
	for i, idStr := range req.DocumentIDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID format: " + idStr})
			return
		}
		docIDs[i] = id
	}

	result, err := h.docUseCase.CompareDocuments(c.Request.Context(), docIDs, req.Question)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	pdfBytes, err := h.docUseCase.ExportCompareResultToPDF(c.Request.Context(), result)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF: " + err.Error()})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=ComparisonResult.pdf")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
