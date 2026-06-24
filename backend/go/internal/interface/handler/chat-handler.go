package handler

import (
	"io"
	"net/http"

	"swd392-chatbot-rag/internal/application/chatusecase"
	"swd392-chatbot-rag/internal/interface/dto/request"
	"swd392-chatbot-rag/internal/interface/dto/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ChatHandler handles all chat-related HTTP endpoints.
type ChatHandler struct {
	useCase *chatusecase.ChatUseCase
}

// NewChatHandler creates a new ChatHandler.
func NewChatHandler(useCase *chatusecase.ChatUseCase) *ChatHandler {
	return &ChatHandler{useCase: useCase}
}

// ListSessions godoc
// @Summary List user chat sessions
// @Tags chat
// @Security BearerAuth
// @Produce json
// @Success 200 {array} response.SessionResponse
// @Router /api/chat/sessions [get]
func (h *ChatHandler) ListSessions(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	sessions, err := h.useCase.GetUserSessions(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result := make([]response.SessionResponse, 0, len(sessions))
	for _, s := range sessions {
		result = append(result, response.SessionResponse{
			ID: s.ID, CourseID: s.CourseID, Title: s.Title,
			IsStarred: s.IsStarred, Status: s.Status,
			CreatedAt: s.CreatedAt, UpdatedAt: s.UpdatedAt,
			DocumentIDs: s.DocumentIDs,
		})
	}
	c.JSON(http.StatusOK, result)
}

// CreateSession godoc
// @Summary Create new chat session
// @Tags chat
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body request.CreateSessionRequest true "Session info"
// @Success 201 {object} response.SessionResponse
// @Router /api/chat/sessions [post]
func (h *ChatHandler) CreateSession(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var req request.CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.DocumentIDs) > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 5 documents allowed per session"})
		return
	}

	session, err := h.useCase.CreateSession(c.Request.Context(), userID, req.CourseID, req.Title, req.DocumentIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response.SessionResponse{
		ID: session.ID, CourseID: session.CourseID, Title: session.Title,
		IsStarred: session.IsStarred, Status: session.Status,
		CreatedAt: session.CreatedAt, UpdatedAt: session.UpdatedAt,
		DocumentIDs: session.DocumentIDs,
	})
}

// GetSession godoc
// @Summary Get session details
// @Tags chat
// @Security BearerAuth
// @Produce json
// @Param id path string true "Session ID"
// @Success 200 {object} response.SessionResponse
// @Router /api/chat/sessions/{id} [get]
func (h *ChatHandler) GetSession(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	session, err := h.useCase.GetSession(c.Request.Context(), sessionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response.SessionResponse{
		ID: session.ID, CourseID: session.CourseID, Title: session.Title,
		IsStarred: session.IsStarred, Status: session.Status,
		CreatedAt: session.CreatedAt, UpdatedAt: session.UpdatedAt,
		DocumentIDs: session.DocumentIDs,
	})
}

// GetHistory godoc
// @Summary Get chat history
// @Tags chat
// @Security BearerAuth
// @Produce json
// @Param id path string true "Session ID"
// @Success 200 {array} response.MessageResponse
// @Router /api/chat/sessions/{id}/messages [get]
func (h *ChatHandler) GetHistory(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	entries, err := h.useCase.GetHistory(c.Request.Context(), userID, sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	result := make([]response.MessageResponse, 0, len(entries))
	for _, e := range entries {
		msg := response.MessageResponse{
			ID: e.Message.ID, Role: e.Message.Role,
			Content: e.Message.Content, OutOfScope: e.Message.OutOfScope,
			CreatedAt: e.Message.CreatedAt,
		}
		for _, cit := range e.Citations {
			msg.Citations = append(msg.Citations, response.CitationResponse{
				ChunkID: cit.ChunkID, Excerpt: cit.Excerpt,
				RelevanceScore: cit.RelevanceScore,
			})
		}
		result = append(result, msg)
	}
	c.JSON(http.StatusOK, result)
}

// SendMessage godoc
// @Summary Send message (RAG pipeline)
// @Tags chat
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Session ID"
// @Param body body request.SendMessageRequest true "Message"
// @Success 200 {object} response.SendMessageResponse
// @Router /api/chat/sessions/{id}/messages [post]
func (h *ChatHandler) SendMessage(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	var req request.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.useCase.SendMessage(c.Request.Context(), userID, sessionID, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Build bot citations
	botCitations := make([]response.CitationResponse, 0, len(result.Citations))
	for _, ch := range result.Citations {
		botCitations = append(botCitations, response.CitationResponse{
			ChunkID:        ch.ChunkID,
			FileName:       ch.FileName,
			PageLabel:      ch.PageLabel,
			Excerpt:        ch.Content,
			RelevanceScore: ch.RelevanceScore,
		})
	}

	c.JSON(http.StatusOK, response.SendMessageResponse{
		UserMessage: response.MessageResponse{
			ID:          result.UserMessage.ID,
			Role:        result.UserMessage.Role,
			Content:     result.UserMessage.Content,
			CreatedAt:   result.UserMessage.CreatedAt,
		},
		BotMessage: response.MessageResponse{
			ID:          result.BotMessage.ID,
			Role:        result.BotMessage.Role,
			Content:     result.BotMessage.Content,
			OutOfScope:  result.BotMessage.OutOfScope,
			Citations:   botCitations,
			CreatedAt:   result.BotMessage.CreatedAt,
		},
	})
}

// DeleteSession godoc
// @Summary Delete a chat session
// @Tags chat
// @Security BearerAuth
// @Param id path string true "Session ID"
// @Success 200 {object} map[string]string
// @Router /api/chat/sessions/{id} [delete]
func (h *ChatHandler) DeleteSession(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	if err := h.useCase.DeleteSession(c.Request.Context(), sessionID, userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Session deleted"})
}

// StreamMessage godoc
// @Summary Stream message (RAG pipeline)
// @Tags chat
// @Security BearerAuth
// @Accept json
// @Produce text/event-stream
// @Param id path string true "Session ID"
// @Param body body request.SendMessageRequest true "Message"
// @Success 200 {string} string "SSE tokens"
// @Router /api/chat/sessions/{id}/messages/stream [post]
func (h *ChatHandler) StreamMessage(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	var req request.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set up SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Streaming not supported"})
		return
	}

	tokenCh, _, err := h.useCase.StreamMessage(c.Request.Context(), userID, sessionID, req.Content)
	if err != nil {
		c.SSEvent("error", err.Error())
		flusher.Flush()
		return
	}

	c.Stream(func(w io.Writer) bool {
		token, ok := <-tokenCh
		if !ok {
			return false
		}
		c.SSEvent("message", token)
		return true
	})
}
