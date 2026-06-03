package main

import (
	"context"
	"log"

	"github.com/joho/godotenv"
	"swd392-chatbot-rag/internal/infrastructure/embedding"
	"swd392-chatbot-rag/internal/infrastructure/fileparser"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"
	"swd392-chatbot-rag/internal/infrastructure/repository/postgres"
	"swd392-chatbot-rag/internal/infrastructure/segmentation"
	"swd392-chatbot-rag/internal/infrastructure/worker"
	"swd392-chatbot-rag/internal/interface/router"
	"swd392-chatbot-rag/pkg/config"
	"swd392-chatbot-rag/pkg/database"
)

// @title           SWD392 Chatbot RAG API
// @version         1.0
// @description     API Server for SWD392 Chatbot RAG system.

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Load config
	cfg := config.Load()

	// Connect to database
	db, err := database.NewPostgresDB(cfg.DATABASE_URL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Connected to database successfully")

	// Initialize S3 storage
	s3Storage, err := filestorage.NewS3FileStorage(cfg.AWS_S3_BUCKET, cfg.AWS_REGION)
	if err != nil {
		log.Fatalf("Failed to initialize AWS S3 storage for worker: %v", err)
	}

	// Initialize worker repositories & services
	jobRepo := postgres.NewUploadJobRepository(db.Pool)
	docRepo := postgres.NewDocumentRepository(db.Pool)
	fileRepo := postgres.NewDocumentFileRepository(db.Pool)
	chunkRepo := postgres.NewChunkRepository(db.Pool)
	chapterRepo := postgres.NewChapterRepository(db.Pool)
	parserFactory := fileparser.NewParserFactory()
	embedClient := embedding.NewEmbeddingClient(cfg.GEMINI_API_KEY)
	segmentator := segmentation.NewGeminiChapterSegmentationService(cfg.GEMINI_API_KEY, "gemini-2.5-flash")

	// Create and start background worker
	bgWorker := worker.NewBackgroundWorker(
		jobRepo, docRepo, fileRepo, chunkRepo, chapterRepo,
		s3Storage, parserFactory, embedClient, segmentator,
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	
	go bgWorker.Start(ctx)
	log.Println("Background upload worker started successfully")

	// Setup router
	r := router.SetupRouter(db.Pool, cfg)

	// Start server
	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}