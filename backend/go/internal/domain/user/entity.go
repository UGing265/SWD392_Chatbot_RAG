package user

import (
	"time"

	"github.com/google/uuid"
)

type Role struct {
	ID   int16  `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type User struct {
	ID              uuid.UUID `json:"id" db:"id"`
	Email           string    `json:"email" db:"email"`
	Name            string    `json:"name" db:"name"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
	EmailVerified   bool      `json:"email_verified" db:"emailVerified"`
	Image           *string   `json:"image" db:"image"`
	CreatedAtBA     time.Time `json:"created_at_ba" db:"createdAt"`
	UpdatedAtBA     time.Time `json:"updated_at_ba" db:"updatedAt"`
	Username        *string   `json:"username" db:"username"`
	DisplayUsername *string   `json:"display_username" db:"displayUsername"`
	RoleID          int16     `json:"role_id" db:"role_id"`
	IsActive        bool      `json:"is_active" db:"is_active"`
	IsBlocked       bool      `json:"is_blocked" db:"is_blocked"`

	// Relation field
	RoleName string `json:"role_name,omitempty" db:"role_name"`
}
