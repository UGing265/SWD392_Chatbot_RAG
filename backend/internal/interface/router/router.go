package router

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"swd392-chatbot-rag/internal/interface/handler"
	"swd392-chatbot-rag/internal/interface/middleware"
	"swd392-chatbot-rag/pkg/config"
)

func SetupRouter(db *pgxpool.Pool, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Initialize handlers (placeholder - will wire dependencies)
	healthHandler := handler.NewHealthHandler()
	authHandler := handler.NewAuthHandler(db)
	documentHandler := handler.NewDocumentHandler(db)
	chatHandler := handler.NewChatHandler(db)

	// Health check (public)
	r.GET("/api/health", healthHandler.Health)

	// Auth routes (public)
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(cfg.JWT_SECRET))
	{
		// Documents
		protected.GET("/documents", documentHandler.List)
		protected.GET("/documents/:id", documentHandler.GetByID)
		protected.POST("/documents/upload", documentHandler.Upload)
		protected.DELETE("/documents/:id", documentHandler.Delete)

		// Chat
		protected.GET("/chat/sessions", chatHandler.ListSessions)
		protected.POST("/chat/sessions", chatHandler.CreateSession)
		protected.GET("/chat/sessions/:id", chatHandler.GetSession)
		protected.GET("/chat/sessions/:id/messages", chatHandler.GetMessages)
		protected.POST("/chat/sessions/:id/messages", chatHandler.SendMessage)
	}

	return r
}