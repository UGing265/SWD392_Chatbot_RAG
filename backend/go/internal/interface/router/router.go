package router

import (
	"log"

	admin_usecase "swd392-chatbot-rag/internal/application/admin-usecase"
	chat_usecase "swd392-chatbot-rag/internal/application/chat-usecase"
	document_usecase "swd392-chatbot-rag/internal/application/document-usecase"
	lookup_usecase "swd392-chatbot-rag/internal/application/lookup-usecase"
	"swd392-chatbot-rag/internal/infrastructure/embedding"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"
	"swd392-chatbot-rag/internal/infrastructure/llm"
	"swd392-chatbot-rag/internal/infrastructure/repository/postgres"
	"swd392-chatbot-rag/internal/interface/handler"
	"swd392-chatbot-rag/internal/interface/middleware"

	"swd392-chatbot-rag/pkg/config"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	_ "swd392-chatbot-rag/docs" // swag docs

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter(db *pgxpool.Pool, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Swagger docs
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Initialize S3 storage
	s3Storage, err := filestorage.NewS3FileStorage(cfg.AWS_S3_BUCKET, cfg.AWS_REGION)
	if err != nil {
		log.Fatalf("Failed to initialize AWS S3 storage: %v", err)
	}

	// Initialize repositories
	docRepo := postgres.NewDocumentRepository(db)
	fileRepo := postgres.NewDocumentFileRepository(db)
	chunkRepo := postgres.NewChunkRepository(db)
	chapterRepo := postgres.NewChapterRepository(db)
	subjectRepo := postgres.NewSubjectRepository(db)

	typeRepo := postgres.NewDocumentTypeRepository(db)
	langRepo := postgres.NewLanguageRepository(db)
	sourceRepo := postgres.NewDocumentSourceRepository(db)
	reportRepo := postgres.NewDocumentReportRepository(db)
	jobRepo := postgres.NewUploadJobRepository(db)
	userRepo := postgres.NewUserRepository(db)
	auditRepo := postgres.NewAuditLogRepository(db)
	assignRepo := postgres.NewLecturerSubjectRepository(db)
	bookmarkRepo := postgres.NewBookmarkRepository(db)

	embedClient := embedding.NewEmbeddingClient(cfg.GEMINI_API_KEY)
	llmClient := llm.NewGeminiLLMClient(cfg.GEMINI_API_KEY, cfg.GEMINI_CHAT_MODEL)

	// Initialize Service
	docUseCase := document_usecase.NewDocumentUseCase(
		docRepo, fileRepo, chunkRepo, chapterRepo, jobRepo, bookmarkRepo, s3Storage, llmClient, reportRepo, subjectRepo, assignRepo,
	)
	lookupUseCase := lookup_usecase.NewLookupUseCase(
		subjectRepo, typeRepo, langRepo, sourceRepo, assignRepo, userRepo,
	)
	adminUseCase := admin_usecase.NewAdminUseCase(
		docRepo, reportRepo, userRepo, auditRepo, jobRepo, chunkRepo, fileRepo, docUseCase,
	)

	// Initialize Chat module
	chatSessionRepo := postgres.NewChatSessionRepository(db)
	msgRepo := postgres.NewMessageRepository(db)
	chatUseCase := chat_usecase.NewChatUseCase(chatSessionRepo, msgRepo, embedClient, llmClient, s3Storage)

	// Initialize Handlers
	healthHandler := handler.NewHealthHandler(db)
	documentHandler := handler.NewDocumentHandler(docUseCase, lookupUseCase, adminUseCase)
	adminHandler := handler.NewAdminHandler(adminUseCase, lookupUseCase, docUseCase)
	chatHandler := handler.NewChatHandler(chatUseCase)

	// Health check (public)
	r.GET("/api/health", healthHandler.Health)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(db))
	{
		// Lookups metadata (for student/lecturer)
		protected.GET("/documents/lookups", documentHandler.GetMetadataLookups)

		// Public subjects list
		protected.GET("/subjects/public", documentHandler.PublicSubjects)

		// Lecturer specific document actions (must be BEFORE :slug wildcard)
		protected.GET("/documents/my", middleware.RequireRoles(2), documentHandler.MyDocuments)
		protected.GET("/documents/dashboard", middleware.RequireRoles(2), documentHandler.Dashboard)
		protected.POST("/documents/upload", middleware.RequireRoles(2), documentHandler.Upload)
		protected.GET("/documents/upload-jobs", middleware.RequireRoles(2, 3), documentHandler.GetUploadJobs)

		// Student & Lecturer bookmarks
		protected.GET("/documents/bookmarks", middleware.RequireRoles(2, 3), documentHandler.ListBookmarks)

		// Student & Lecturer documents list
		protected.GET("/documents", middleware.RequireRoles(2, 3), documentHandler.List)
		protected.POST("/documents/compare", middleware.RequireRoles(2, 3), documentHandler.CompareDocuments)
		protected.POST("/documents/compare/export", middleware.RequireRoles(2, 3), documentHandler.ExportCompareDocuments)
		protected.GET("/documents/:slug", middleware.RequireRoles(1, 2, 3), documentHandler.Details)

		// Slug-based actions
		protected.POST("/documents/:slug/edit", middleware.RequireRoles(2), documentHandler.Edit)
		protected.POST("/documents/:slug/delete", middleware.RequireRoles(2), documentHandler.Delete)
		protected.GET("/documents/:slug/delete-view", middleware.RequireRoles(2), documentHandler.DeleteViewData)
		protected.POST("/documents/:slug/bookmark", middleware.RequireRoles(2, 3), documentHandler.ToggleBookmark)

		// Report document (student & lecturer)
		protected.POST("/documents/:slug/report", middleware.RequireRoles(2, 3), documentHandler.Report)

		// Chat routes (student & lecturer: roles 2, 3)
		protected.GET("/chat/sessions", middleware.RequireRoles(2, 3), chatHandler.ListSessions)
		protected.POST("/chat/sessions", middleware.RequireRoles(2, 3), chatHandler.CreateSession)
		protected.GET("/chat/sessions/:id", middleware.RequireRoles(2, 3), chatHandler.GetSession)
		protected.GET("/chat/sessions/:id/messages", middleware.RequireRoles(2, 3), chatHandler.GetHistory)
		protected.POST("/chat/sessions/:id/messages", middleware.RequireRoles(2, 3), chatHandler.SendMessage)
		protected.POST("/chat/sessions/:id/messages/stream", middleware.RequireRoles(2, 3), chatHandler.StreamMessage)
		protected.DELETE("/chat/sessions/:id", middleware.RequireRoles(2, 3), chatHandler.DeleteSession)

		// Admin routes (requires Admin role: 1)
		admin := protected.Group("/admin")
		admin.Use(middleware.RequireRoles(1))
		{
			// Users management
			admin.GET("/users", adminHandler.Users)
			admin.POST("/users/import", adminHandler.ImportUsersExcel)
			admin.POST("/users/:id/block", adminHandler.BlockUser)
			admin.POST("/users/:id/unblock", adminHandler.UnblockUser)

			// Lecturer subject assignments
			admin.GET("/user-subjects", adminHandler.LecturerSubjectAssignments)
			admin.GET("/lecturers/:id/subjects", adminHandler.LecturerSubjects)
			admin.PUT("/lecturers/:id/subjects", adminHandler.ReplaceLecturerSubjects)

			// Documents review & management
			admin.GET("/documents", adminHandler.Documents)
			admin.POST("/documents/:id/approve", adminHandler.ApproveDocument)
			admin.POST("/documents/:id/reject", adminHandler.RejectDocument)
			admin.POST("/documents/:id/delete", adminHandler.DeleteDocument)

			// Reports resolution
			admin.GET("/reports", adminHandler.Reports)
			admin.POST("/reports/:id/resolve", adminHandler.ResolveReport)

			// Metadata Subjects CRUD
			admin.POST("/subjects", adminHandler.CreateSubject)
			admin.PUT("/subjects/:id", adminHandler.UpdateSubject)
			admin.DELETE("/subjects/:id", adminHandler.DeleteSubject)

			// Metadata Document Types CRUD
			admin.POST("/document-types", adminHandler.CreateDocumentType)
			admin.PUT("/document-types/:id", adminHandler.UpdateDocumentType)
			admin.DELETE("/document-types/:id", adminHandler.DeleteDocumentType)

			// Metadata Languages CRUD
			admin.POST("/languages", adminHandler.CreateLanguage)
			admin.PUT("/languages/:id", adminHandler.UpdateLanguage)
			admin.DELETE("/languages/:id", adminHandler.DeleteLanguage)

			// Metadata Document Sources CRUD
			admin.POST("/document-sources", adminHandler.CreateDocumentSource)
			admin.PUT("/document-sources/:id", adminHandler.UpdateDocumentSource)
			admin.DELETE("/document-sources/:id", adminHandler.DeleteDocumentSource)


		}

		// Audit Logs
		admin.GET("/audit-logs", adminHandler.GetAuditLogs)
	}

	return r
}
