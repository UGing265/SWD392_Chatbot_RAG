package handler

import (
	"net/http"
	"strconv"

	"swd392-chatbot-rag/internal/application"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	service *application.DocumentService
}

func NewAdminHandler(service *application.DocumentService) *AdminHandler {
	return &AdminHandler{
		service: service,
	}
}

type SubjectInput struct {
	Code           string  `json:"code" binding:"required"`
	Name           string  `json:"name" binding:"required"`
	AcademicTermID *string `json:"academic_term_id"`
}

type DocumentTypeInput struct {
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description"`
}

type LanguageInput struct {
	Code string `json:"code" binding:"required"`
	Name string `json:"name" binding:"required"`
}

type DocumentSourceInput struct {
	Name string `json:"name" binding:"required"`
}

type AcademicTermInput struct {
	Name  string `json:"name" binding:"required"`
	Order int    `json:"order"`
}

// Users godoc
// @Summary List all users
// @Description Get a list of all users in the system (Admin only)
// @Tags admin-users
// @Security BearerAuth
// @Produce json
// @Success 200 {array} user.User
// @Failure 500 {object} map[string]string
// @Router /api/admin/users [get]
func (h *AdminHandler) Users(c *gin.Context) {
	users, err := h.service.GetUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// BlockUser godoc
// @Summary Block user
// @Description Block a user's account by ID (Admin only)
// @Tags admin-users
// @Security BearerAuth
// @Produce json
// @Param id path string true "User ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/users/{id}/block [post]
func (h *AdminHandler) BlockUser(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	if err := h.service.BlockOrUnblockUser(c.Request.Context(), uid, true); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User blocked successfully"})
}

// UnblockUser godoc
// @Summary Unblock user
// @Description Unblock a user's account by ID (Admin only)
// @Tags admin-users
// @Security BearerAuth
// @Produce json
// @Param id path string true "User ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/users/{id}/unblock [post]
func (h *AdminHandler) UnblockUser(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	if err := h.service.BlockOrUnblockUser(c.Request.Context(), uid, false); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User unblocked successfully"})
}

// Documents godoc
// @Summary List all documents (Admin view)
// @Description Get a paginated list of all system documents with status (Admin only)
// @Tags admin-documents
// @Security BearerAuth
// @Produce json
// @Param q query string false "Search keyword"
// @Param subjectId query string false "Subject ID (UUID)"
// @Param page query int false "Page number"
// @Param pageSize query int false "Page size"
// @Success 200 {object} application.MyDocumentsDto
// @Failure 500 {object} map[string]string
// @Router /api/admin/documents [get]
func (h *AdminHandler) Documents(c *gin.Context) {
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

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	result, err := h.service.GetAdminDocuments(c.Request.Context(), queryPtr, subjectIDPtr, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

// ApproveDocument godoc
// @Summary Approve document
// @Description Set document status to approved, making it public (Admin only)
// @Tags admin-documents
// @Security BearerAuth
// @Produce json
// @Param id path string true "Document ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/documents/{id}/approve [post]
func (h *AdminHandler) ApproveDocument(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID format"})
		return
	}

	if err := h.service.ApproveOrRejectDocument(c.Request.Context(), uid, true); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Document approved successfully"})
}

// RejectDocument godoc
// @Summary Reject document
// @Description Reject a pending document (Admin only)
// @Tags admin-documents
// @Security BearerAuth
// @Produce json
// @Param id path string true "Document ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/documents/{id}/reject [post]
func (h *AdminHandler) RejectDocument(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID format"})
		return
	}

	if err := h.service.ApproveOrRejectDocument(c.Request.Context(), uid, false); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Document rejected successfully"})
}

// DeleteDocument godoc
// @Summary Delete document (Admin)
// @Description Admin delete a document by ID (Admin only)
// @Tags admin-documents
// @Security BearerAuth
// @Produce json
// @Param id path string true "Document ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/documents/{id}/delete [post]
func (h *AdminHandler) DeleteDocument(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID format"})
		return
	}

	if err := h.service.DeleteDocument(c.Request.Context(), uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Document deleted successfully"})
}

// Reports godoc
// @Summary List pending violation reports
// @Description Get list of all pending document reports (Admin only)
// @Tags admin-reports
// @Security BearerAuth
// @Produce json
// @Success 200 {array} application.DocumentReportDto
// @Failure 500 {object} map[string]string
// @Router /api/admin/reports [get]
func (h *AdminHandler) Reports(c *gin.Context) {
	reports, err := h.service.GetPendingReports(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// ResolveReport godoc
// @Summary Resolve document report
// @Description Resolve a violation report by ignoring or deleting the document (Admin only)
// @Tags admin-reports
// @Security BearerAuth
// @Produce json
// @Param id path string true "Report ID (UUID)"
// @Param resolution query string true "Resolution choice (delete or ignore)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/reports/{id}/resolve [post]
func (h *AdminHandler) ResolveReport(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID format"})
		return
	}

	resolution := c.DefaultQuery("resolution", "ignore") // or "delete"

	if err := h.service.ResolveReport(c.Request.Context(), uid, resolution); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Report resolved successfully"})
}

// CreateSubject godoc
// @Summary Create metadata subject
// @Description Add a new subject (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body handler.SubjectInput true "Subject details"
// @Success 201 {object} application.SubjectDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/subjects [post]
func (h *AdminHandler) CreateSubject(c *gin.Context) {
	var input SubjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var termID *uuid.UUID
	if input.AcademicTermID != nil && *input.AcademicTermID != "" {
		if uid, err := uuid.Parse(*input.AcademicTermID); err == nil {
			termID = &uid
		}
	}

	sub, err := h.service.CreateSubject(c.Request.Context(), input.Code, input.Name, termID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, sub)
}

// UpdateSubject godoc
// @Summary Update metadata subject
// @Description Update subject code/name/term by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Subject ID (UUID)"
// @Param body body handler.SubjectInput true "Subject details"
// @Success 200 {object} application.SubjectDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/subjects/{id} [put]
func (h *AdminHandler) UpdateSubject(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subject ID format"})
		return
	}

	var input SubjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var termID *uuid.UUID
	if input.AcademicTermID != nil && *input.AcademicTermID != "" {
		if uVal, err := uuid.Parse(*input.AcademicTermID); err == nil {
			termID = &uVal
		}
	}

	sub, err := h.service.UpdateSubject(c.Request.Context(), uid, input.Code, input.Name, termID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sub)
}

// DeleteSubject godoc
// @Summary Delete metadata subject
// @Description Remove subject by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Produce json
// @Param id path string true "Subject ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/subjects/{id} [delete]
func (h *AdminHandler) DeleteSubject(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subject ID format"})
		return
	}

	if err := h.service.DeleteSubject(c.Request.Context(), uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Subject deleted successfully"})
}

// CreateDocumentType godoc
// @Summary Create document type
// @Description Add a new document type (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body handler.DocumentTypeInput true "Document Type details"
// @Success 201 {object} application.DocumentTypeDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/document-types [post]
func (h *AdminHandler) CreateDocumentType(c *gin.Context) {
	var input DocumentTypeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dt, err := h.service.CreateDocumentType(c.Request.Context(), input.Name, input.Description)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, dt)
}

// UpdateDocumentType godoc
// @Summary Update document type
// @Description Update document type details by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Type ID (UUID)"
// @Param body body handler.DocumentTypeInput true "Type details"
// @Success 200 {object} application.DocumentTypeDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/document-types/{id} [put]
func (h *AdminHandler) UpdateDocumentType(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document type ID"})
		return
	}

	var input DocumentTypeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dt, err := h.service.UpdateDocumentType(c.Request.Context(), uid, input.Name, input.Description)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, dt)
}

// DeleteDocumentType godoc
// @Summary Delete document type
// @Description Remove document type by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Produce json
// @Param id path string true "Type ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/document-types/{id} [delete]
func (h *AdminHandler) DeleteDocumentType(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type ID format"})
		return
	}

	if err := h.service.DeleteDocumentType(c.Request.Context(), uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Document type deleted successfully"})
}

// CreateLanguage godoc
// @Summary Create language
// @Description Add a new language (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body handler.LanguageInput true "Language details"
// @Success 201 {object} application.LanguageDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/languages [post]
func (h *AdminHandler) CreateLanguage(c *gin.Context) {
	var input LanguageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lang, err := h.service.CreateLanguage(c.Request.Context(), input.Code, input.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, lang)
}

// UpdateLanguage godoc
// @Summary Update language
// @Description Update language code/name by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Language ID (UUID)"
// @Param body body handler.LanguageInput true "Language details"
// @Success 200 {object} application.LanguageDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/languages/{id} [put]
func (h *AdminHandler) UpdateLanguage(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid language ID format"})
		return
	}

	var input LanguageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lang, err := h.service.UpdateLanguage(c.Request.Context(), uid, input.Code, input.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, lang)
}

// DeleteLanguage godoc
// @Summary Delete language
// @Description Remove language by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Produce json
// @Param id path string true "Language ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/languages/{id} [delete]
func (h *AdminHandler) DeleteLanguage(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid language ID"})
		return
	}

	if err := h.service.DeleteLanguage(c.Request.Context(), uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Language deleted successfully"})
}

// CreateDocumentSource godoc
// @Summary Create document source
// @Description Add a new document source (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body handler.DocumentSourceInput true "Source details"
// @Success 201 {object} application.DocumentSourceDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/document-sources [post]
func (h *AdminHandler) CreateDocumentSource(c *gin.Context) {
	var input DocumentSourceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	src, err := h.service.CreateDocumentSource(c.Request.Context(), input.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, src)
}

// UpdateDocumentSource godoc
// @Summary Update document source
// @Description Update source name by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Source ID (UUID)"
// @Param body body handler.DocumentSourceInput true "Source details"
// @Success 200 {object} application.DocumentSourceDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/document-sources/{id} [put]
func (h *AdminHandler) UpdateDocumentSource(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source ID format"})
		return
	}

	var input DocumentSourceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	src, err := h.service.UpdateDocumentSource(c.Request.Context(), uid, input.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, src)
}

// DeleteDocumentSource godoc
// @Summary Delete document source
// @Description Remove document source by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Produce json
// @Param id path string true "Source ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/document-sources/{id} [delete]
func (h *AdminHandler) DeleteDocumentSource(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source ID format"})
		return
	}

	if err := h.service.DeleteDocumentSource(c.Request.Context(), uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Document source deleted successfully"})
}

// CreateAcademicTerm godoc
// @Summary Create academic term
// @Description Add a new academic term (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body handler.AcademicTermInput true "Term details"
// @Success 201 {object} application.AcademicTermDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/academic-terms [post]
func (h *AdminHandler) CreateAcademicTerm(c *gin.Context) {
	var input AcademicTermInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	term, err := h.service.CreateAcademicTerm(c.Request.Context(), input.Name, input.Order)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, term)
}

// UpdateAcademicTerm godoc
// @Summary Update academic term
// @Description Update academic term name/order by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Term ID (UUID)"
// @Param body body handler.AcademicTermInput true "Term details"
// @Success 200 {object} application.AcademicTermDto
// @Failure 400 {object} map[string]string
// @Router /api/admin/academic-terms/{id} [put]
func (h *AdminHandler) UpdateAcademicTerm(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid academic term ID"})
		return
	}

	var input AcademicTermInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	term, err := h.service.UpdateAcademicTerm(c.Request.Context(), uid, input.Name, input.Order)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, term)
}

// DeleteAcademicTerm godoc
// @Summary Delete academic term
// @Description Remove academic term by ID (Admin only)
// @Tags admin-metadata
// @Security BearerAuth
// @Produce json
// @Param id path string true "Term ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/admin/academic-terms/{id} [delete]
func (h *AdminHandler) DeleteAcademicTerm(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid term ID format"})
		return
	}

	if err := h.service.DeleteAcademicTerm(c.Request.Context(), uid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Academic term deleted successfully"})
}
