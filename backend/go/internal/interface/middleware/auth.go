package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

		// Verify JWT token
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = os.Getenv("BETTER_AUTH_SECRET")
		}
		if secret == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		// Extract user ID (sub)
		sub, ok := claims["sub"].(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing subject in token"})
			return
		}

		userID, err := uuid.Parse(sub)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID format in token"})
			return
		}

		// Extract role
		roleStr, ok := claims["role"].(string)
		if !ok || roleStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid role in token"})
			return
		}
		
		var roleID int16
		if roleStr == "admin" {
			roleID = 1
		} else if roleStr == "lecturer" {
			roleID = 2
		} else if roleStr == "student" {
			roleID = 3
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unknown role in token"})
			return
		}

		// Store user info in context
		c.Set("user_id", userID)
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