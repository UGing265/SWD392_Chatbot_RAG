package config

import (
	"os"
)

type Config struct {
	DATABASE_URL string
	JWT_SECRET   string
	JWT_EXPIRY  string
	GEMINI_API_KEY string
	UPLOAD_DIR  string
	MAX_FILE_SIZE int64
}

func Load() *Config {
	return &Config{
		DATABASE_URL:   getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/swd392"),
		JWT_SECRET:     getEnv("JWT_SECRET", "your-secret-key-min-32-characters"),
		JWT_EXPIRY:     getEnv("JWT_EXPIRY", "24h"),
		GEMINI_API_KEY: getEnv("GEMINI_API_KEY", ""),
		UPLOAD_DIR:     getEnv("UPLOAD_DIR", "./uploads"),
		MAX_FILE_SIZE:  int64(parseInt(getEnv("MAX_FILE_SIZE", "52428800"))),
	}
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