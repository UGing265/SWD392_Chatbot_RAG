package user

import (
	"context"

	"github.com/google/uuid"
)

type UserRepository interface {
	FindByID(ctx context.Context, id uuid.UUID) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindAll(ctx context.Context) ([]*User, error)
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id uuid.UUID) error
}
