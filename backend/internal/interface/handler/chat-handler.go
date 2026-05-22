package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ChatHandler struct {
	db *pgxpool.Pool
}

func NewChatHandler(db *pgxpool.Pool) *ChatHandler {
	return &ChatHandler{db: db}
}

func (h *ChatHandler) ListSessions(c *gin.Context) {
	userID, _ := c.Get("user_id")

	rows, err := h.db.Query(c.Request.Context(),
		`SELECT id, title, status, is_starred, created_at, updated_at
		FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC`,
		userID.(uuid.UUID).String(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sessions"})
		return
	}
	defer rows.Close()

	var sessions []map[string]interface{}
	for rows.Next() {
		var id, title, status string
		var isStarred bool
		var createdAt, updatedAt interface{}
		rows.Scan(&id, &title, &status, &isStarred, &createdAt, &updatedAt)
		sessions = append(sessions, map[string]interface{}{
			"id": id, "title": title, "status": status, "is_starred": isStarred,
		})
	}

	c.JSON(http.StatusOK, gin.H{"sessions": sessions})
}

func (h *ChatHandler) CreateSession(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		CourseID string `json:"course_id"`
		Title    string `json:"title"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	courseID := req.CourseID
	if courseID == "" {
		courseID = "00000000-0000-0000-0000-000000000001"
	}

	title := req.Title
	if title == "" {
		title = "New Chat"
	}

	sessionID := uuid.New().String()
	_, err := h.db.Exec(c.Request.Context(),
		`INSERT INTO chat_sessions (id, user_id, course_id, title, status)
		VALUES ($1, $2, $3, $4, 'active')`,
		sessionID, userID.(uuid.UUID).String(), courseID, title,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":    sessionID,
		"title": title,
		"status": "active",
	})
}

func (h *ChatHandler) GetSession(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Get session endpoint - to be implemented",
	})
}

func (h *ChatHandler) GetMessages(c *gin.Context) {
	sessionID := c.Param("id")

	rows, err := h.db.Query(c.Request.Context(),
		`SELECT id, role, content, out_of_scope, created_at
		FROM messages WHERE session_id = $1 ORDER BY created_at ASC`,
		sessionID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}
	defer rows.Close()

	var messages []map[string]interface{}
	for rows.Next() {
		var id, role, content string
		var outOfScope bool
		var createdAt interface{}
		rows.Scan(&id, &role, &content, &outOfScope, &createdAt)
		messages = append(messages, map[string]interface{}{
			"id": id, "role": role, "content": content, "out_of_scope": outOfScope,
		})
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	sessionID := c.Param("id")

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save user message
	msgID := uuid.New().String()
	h.db.Exec(c.Request.Context(),
		`INSERT INTO messages (id, session_id, role, content) VALUES ($1, $2, 'user', $3)`,
		msgID, sessionID, req.Content,
	)

	// TODO: RAG pipeline
	// 1. Embed query with Gemini Embedding 2
	// 2. Search pgvector for relevant chunks
	// 3. Build prompt with retrieved context
	// 4. Call Gemini LLM
	// 5. Save bot response with citations

	c.JSON(http.StatusOK, gin.H{
		"id":      msgID,
		"content": "RAG response - to be implemented",
	})
}