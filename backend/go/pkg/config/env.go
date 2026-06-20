package config

import (
	"os"
)

type Config struct {
	DATABASE_URL           string
	JWT_SECRET             string
	JWT_EXPIRY             string
	GEMINI_API_KEY         string
	GEMINI_CHAT_MODEL      string
	UPLOAD_DIR             string
	MAX_FILE_SIZE          int64
	AWS_ACCESS_KEY_ID      string
	AWS_SECRET_ACCESS_KEY  string
	AWS_REGION             string
	AWS_S3_BUCKET          string
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseInt(s string) int64 {
	var n int64
	for _, c := range s {
		if c >= '0' && c <= '9' {
			n = n*10 + int64(c-'0')
		}
	}
	return n
}

func Load() *Config {
	return &Config{
		DATABASE_URL:          getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/postgres"),
		JWT_SECRET:            getEnv("JWT_SECRET", "9d7bca84f7b60e61dbfe7e4e1a0b332d"),
		JWT_EXPIRY:            getEnv("JWT_EXPIRY", "24h"),
		GEMINI_API_KEY:        getEnv("GEMINI_API_KEY", ""),
		GEMINI_CHAT_MODEL:     getEnv("GEMINI_CHAT_MODEL", "gemini-2.5-flash"),
		UPLOAD_DIR:            getEnv("UPLOAD_DIR", "./uploads"),
		MAX_FILE_SIZE:         parseInt(getEnv("MAX_FILE_SIZE", "52428800")),
		AWS_ACCESS_KEY_ID:     getEnv("AWS_ACCESS_KEY_ID", ""),
		AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWS_REGION:            getEnv("AWS_REGION", "us-east-1"),
		AWS_S3_BUCKET:         getEnv("AWS_S3_BUCKET", ""),
	}
}