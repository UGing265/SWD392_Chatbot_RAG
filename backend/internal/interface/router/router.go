package router

import (
	"swd392-chatbot-rag/internal/application/document-usecase"
	"swd392-chatbot-rag/internal/application/indexing"
	"swd392-chatbot-rag/internal/infrastructure/embedding"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"
	"swd392-chatbot-rag/internal/infrastructure/fileparser"
	"swd392-chatbot-rag/internal/infrastructure/repository/postgres"
	"swd392-chatbot-rag/internal/interface/handler"
	"swd392-chatbot-rag/internal/interface/middleware"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"swd392-chatbot-rag/pkg/config"

	_ "swd392-chatbot-rag/docs" // swag docs
	ginSwagger "github.com/swaggo/gin-swagger"
	swaggerFiles "github.com/swaggo/files"
)

func SetupRouter(db *pgxpool.Pool, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Swagger docs
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Initialize infrastructure
	fileStorage := filestorage.NewLocalFileStorage(cfg.UPLOAD_DIR)
	docRepo := postgres.NewDocumentRepository(db)
	chunkRepo := postgres.NewChunkRepository(db)
	parserFactory := fileparser.NewParserFactory()
	embedClient := embedding.NewEmbeddingClient(cfg.GEMINI_API_KEY)

	// Initialize indexing use case
	indexer := indexing.NewIndexingUseCase(docRepo, chunkRepo, parserFactory, embedClient)

	// Initialize document use cases
	uploadUC := document_usecase.NewUploadDocumentUseCase(docRepo, fileStorage, indexer)
	listUC := document_usecase.NewListDocumentsUseCase(docRepo)
	getUC := document_usecase.NewGetDocumentUseCase(docRepo)
	deleteUC := document_usecase.NewDeleteDocumentUseCase(docRepo, chunkRepo, fileStorage)
	getChunksUC := document_usecase.NewGetChunksUseCase(chunkRepo)

	// Initialize handlers
	healthHandler := handler.NewHealthHandler(db)
	documentHandler := handler.NewDocumentHandlerWithUseCase(db, uploadUC, listUC, getUC, deleteUC, getChunksUC, fileStorage)
	chatHandler := handler.NewChatHandler(db)

	// Health check (public)
	r.GET("/api/health", healthHandler.Health)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(db))
	{
		// Documents
		protected.GET("/documents", documentHandler.List)
		protected.GET("/documents/:id", documentHandler.GetByID)
		protected.GET("/documents/:id/chunks", documentHandler.GetChunks)
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