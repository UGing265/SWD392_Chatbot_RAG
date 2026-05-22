package middleware

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func AuthMiddleware(db *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			return
		}

		// Mềm dẻo: Tự động trích xuất token dù có chữ Bearer hay không
		tokenString := authHeader
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else if strings.HasPrefix(authHeader, "bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "bearer ")
		}
		
		tokenString = strings.TrimSpace(tokenString)

		// Giải mã URL-encoded token (Swagger UI tự encode %2F, %3D...)
		if decoded, err := url.QueryUnescape(tokenString); err == nil {
			tokenString = decoded
		}

		// Better Auth gửi token dạng "token.signature" — DB chỉ lưu phần "token"
		if parts := strings.SplitN(tokenString, ".", 2); len(parts) == 2 {
			tokenString = parts[0]
		}

		// Query Better Auth session from database
		var userIDStr, email string
		err := db.QueryRow(context.Background(), `
			SELECT s."userId", u.email 
			FROM session s 
			JOIN users u ON s."userId" = u.id 
			WHERE s.token = $1 AND s."expiresAt" > NOW()
		`, tokenString).Scan(&userIDStr, &email)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired session token",
			})
			return
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid user ID format in session",
			})
			return
		}

		// Store user info in context
		c.Set("user_id", userID)
		c.Set("email", email)

		c.Next()
	}
}