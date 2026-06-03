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

		// Bearer check
		tokenString := authHeader
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else if strings.HasPrefix(authHeader, "bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "bearer ")
		}
		
		tokenString = strings.TrimSpace(tokenString)

		// Unescape
		if decoded, err := url.QueryUnescape(tokenString); err == nil {
			tokenString = decoded
		}

		// split token for Better Auth
		if parts := strings.SplitN(tokenString, ".", 2); len(parts) == 2 {
			tokenString = parts[0]
		}

		// Query Better Auth session from database with roles/status
		var userIDStr, email string
		var roleID int16
		var isActive, isBlocked bool
		err := db.QueryRow(context.Background(), `
			SELECT s."userId", u.email, u.role_id, u.is_active, u.is_blocked 
			FROM session s 
			JOIN users u ON s."userId" = u.id 
			WHERE s.token = $1 AND s."expiresAt" > NOW()
		`, tokenString).Scan(&userIDStr, &email, &roleID, &isActive, &isBlocked)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired session token",
			})
			return
		}

		if isBlocked || !isActive {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Account is blocked or inactive",
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
		c.Set("role_id", roleID)

		c.Next()
	}
}

// RequireRoles checks if user has one of the allowed role IDs
func RequireRoles(allowedRoles ...int16) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleIDVal, exists := c.Get("role_id")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		roleID := roleIDVal.(int16)
		allowed := false
		for _, r := range allowedRoles {
			if roleID == r {
				allowed = true
				break
			}
		}

		if !allowed {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Permission denied (insufficient privileges)",
			})
			return
		}

		c.Next()
	}
}