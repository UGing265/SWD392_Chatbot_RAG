package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
	"swd392-chatbot-rag/internal/domain/user"
	"swd392-chatbot-rag/pkg/jwt"
)

type AuthHandler struct {
	db          *pgxpool.Pool
	jwtService  *jwt.JWTService
}

func NewAuthHandler(db *pgxpool.Pool) *AuthHandler {
	jwtService, _ := jwt.NewJWTService("your-secret-key-min-32-characters", "24h")
	return &AuthHandler{
		db:         db,
		jwtService: jwtService,
	}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	Token  string `json:"token"`
}

// Register godoc
// @Summary Register a new user
// @Description Create a new account with email, password, and username
// @Tags auth
// @Accept json
// @Produce json
// @Param request body handler.RegisterRequest true "Registration info"
// @Success 201 {object} handler.AuthResponse
// @Failure 400 {object} map[string]string
// @Router /api/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email exists
	var exists bool
	err := h.db.QueryRow(c.Request.Context(), "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	var userID string
	err = h.db.QueryRow(c.Request.Context(),
		`INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id`,
		req.Email, string(hashedPassword), req.Name,
	).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate token
	userUUID, _ := uuid.Parse(userID)
	token, err := h.jwtService.GenerateToken(userUUID, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, AuthResponse{
		UserID: userID,
		Email:  req.Email,
		Name:   req.Name,
		Token:  token,
	})
}

// Login godoc
// @Summary Login
// @Description Authenticate with email/username and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body handler.LoginRequest true "Credentials"
// @Success 200 {object} handler.AuthResponse
// @Failure 401 {object} map[string]string
// @Router /api/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	var user user.User
	err := h.db.QueryRow(c.Request.Context(),
		`SELECT id, email, password_hash, name FROM users WHERE email = $1`,
		req.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate token
	token, err := h.jwtService.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		UserID: user.ID.String(),
		Email:  user.Email,
		Name:   user.Name,
		Token:  token,
	})
}