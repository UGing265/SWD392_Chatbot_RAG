package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
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

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format. Use: Bearer <token>",
			})
			return
		}

		tokenString := parts[1]

		// Query Better Auth session from database
		var userID, email string
		err := db.QueryRow(context.Background(), `
			SELECT s."userId", u.email 
			FROM session s 
			JOIN users u ON s."userId" = u.id 
			WHERE s.token = $1 AND s."expiresAt" > NOW()
		`, tokenString).Scan(&userID, &email)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired session token",
			})
			return
		}

		// Store user info in context
		c.Set("user_id", userID)
		c.Set("email", email)

		c.Next()
	}
}