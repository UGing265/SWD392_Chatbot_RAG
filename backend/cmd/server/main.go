package main

import (
	"log"

	"github.com/joho/godotenv"
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

	// Setup router
	r := router.SetupRouter(db.Pool, cfg)

	// Start server
	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}