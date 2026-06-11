package main

import (
	"context"
	"io/ioutil"
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

	sqlBytes, err := ioutil.ReadFile("./migrations/001_initial.sql")
	if err != nil {
		log.Fatalf("Failed to read migration file: %v", err)
	}

	_, err = db.Pool.Exec(context.Background(), string(sqlBytes))
	if err != nil {
		log.Fatalf("Failed to execute migration: %v", err)
	}

	log.Println("Migration successful!")
}
