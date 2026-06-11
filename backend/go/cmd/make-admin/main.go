package main

import (
	"context"
	"log"

	"github.com/joho/godotenv"
	"swd392-chatbot-rag/pkg/config"
	"swd392-chatbot-rag/pkg/database"
)

func main() {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found, using defaults")
	}

	cfg := config.Load()

	db, err := database.NewPostgresDB(cfg.DATABASE_URL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	_, err = db.Pool.Exec(context.Background(), "UPDATE users SET role_id = 1 WHERE email = 'admin@test.com'")
	if err != nil {
		log.Fatalf("Failed to execute update: %v", err)
	}

	log.Println("Update successful!")
}
