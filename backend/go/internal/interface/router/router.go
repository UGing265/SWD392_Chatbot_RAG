package router

import (
	"log"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"
	"swd392-chatbot-rag/internal/infrastructure/repository/postgres"
	"swd392-chatbot-rag/internal/interface/handler"
	"swd392-chatbot-rag/internal/interface/middleware"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"swd392-chatbot-rag/pkg/config"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "swd392-chatbot-rag/docs" // swag docs
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
	termRepo := postgres.NewAcademicTermRepository(db)
	typeRepo := postgres.NewDocumentTypeRepository(db)
	langRepo := postgres.NewLanguageRepository(db)
	sourceRepo := postgres.NewDocumentSourceRepository(db)
	reportRepo := postgres.NewDocumentReportRepository(db)
	jobRepo := postgres.NewUploadJobRepository(db)
	userRepo := postgres.NewUserRepository(db)
	auditRepo := postgres.NewAuditLogRepository(db)
	assignRepo := postgres.NewLecturerSubjectRepository(db)

	// Initialize Service
	docService := application.NewDocumentService(
		docRepo, fileRepo, chunkRepo, chapterRepo, subjectRepo,
		termRepo, typeRepo, langRepo, sourceRepo, reportRepo,
		jobRepo, userRepo, auditRepo, assignRepo, s3Storage,
	)

	// Initialize Handlers
	healthHandler := handler.NewHealthHandler(db)
	documentHandler := handler.NewDocumentHandler(docService)
	adminHandler := handler.NewAdminHandler(docService)

	// Health check (public)
	r.GET("/api/health", healthHandler.Health)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(db))
	{
		// Lookups metadata (for student/lecturer)
		protected.GET("/documents/lookups", documentHandler.GetMetadataLookups)

		// Lecturer specific document actions (must be BEFORE :slug wildcard)
		protected.GET("/documents/my", middleware.RequireRoles(2), documentHandler.MyDocuments)
		protected.GET("/documents/dashboard", middleware.RequireRoles(2), documentHandler.Dashboard)
		protected.POST("/documents/upload", middleware.RequireRoles(2), documentHandler.Upload)

		// Student & Lecturer documents list
		protected.GET("/documents", middleware.RequireRoles(2, 3), documentHandler.List)
		protected.GET("/documents/:slug", middleware.RequireRoles(1, 2, 3), documentHandler.Details)

		// Slug-based actions
		protected.POST("/documents/:slug/edit", middleware.RequireRoles(2), documentHandler.Edit)
		protected.POST("/documents/:slug/delete", middleware.RequireRoles(2), documentHandler.Delete)
		protected.GET("/documents/:slug/delete-view", middleware.RequireRoles(2), documentHandler.DeleteViewData)

		// Report document (student & lecturer)
		protected.POST("/documents/:slug/report", middleware.RequireRoles(2, 3), documentHandler.Report)

		// Admin routes (requires Admin role: 1)
		admin := protected.Group("/admin")
		admin.Use(middleware.RequireRoles(1))
		{
			// Users management
			admin.GET("/users", adminHandler.Users)
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

			// Metadata Academic Terms CRUD
			admin.POST("/academic-terms", adminHandler.CreateAcademicTerm)
			admin.PUT("/academic-terms/:id", adminHandler.UpdateAcademicTerm)
			admin.DELETE("/academic-terms/:id", adminHandler.DeleteAcademicTerm)
		}
	}

	return r
}
