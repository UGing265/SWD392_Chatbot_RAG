package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/user"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) FindByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var u user.User
	err := r.pool.QueryRow(ctx,
		`SELECT u.id, u.email, u.name, u.created_at, u.updated_at, u."emailVerified", u.image, u."createdAt", u."updatedAt", u.username, u."displayUsername", u.role_id, u.is_active, u.is_blocked, r.name as role_name
		FROM users u
		LEFT JOIN roles r ON u.role_id = r.id
		WHERE u.id = $1`, id,
	).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt, &u.EmailVerified, &u.Image, &u.CreatedAtBA, &u.UpdatedAtBA, &u.Username, &u.DisplayUsername, &u.RoleID, &u.IsActive, &u.IsBlocked, &u.RoleName)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var u user.User
	err := r.pool.QueryRow(ctx,
		`SELECT u.id, u.email, u.name, u.created_at, u.updated_at, u."emailVerified", u.image, u."createdAt", u."updatedAt", u.username, u."displayUsername", u.role_id, u.is_active, u.is_blocked, r.name as role_name
		FROM users u
		LEFT JOIN roles r ON u.role_id = r.id
		WHERE u.email = $1`, email,
	).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt, &u.EmailVerified, &u.Image, &u.CreatedAtBA, &u.UpdatedAtBA, &u.Username, &u.DisplayUsername, &u.RoleID, &u.IsActive, &u.IsBlocked, &u.RoleName)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindAll(ctx context.Context) ([]*user.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := r.pool.Query(ctx,
		`SELECT u.id, u.email, u.name, u.created_at, u.updated_at, u."emailVerified", u.image, u."createdAt", u."updatedAt", u.username, u."displayUsername", u.role_id, u.is_active, u.is_blocked, r.name as role_name
		FROM users u
		LEFT JOIN roles r ON u.role_id = r.id
		ORDER BY u.created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*user.User
	for rows.Next() {
		var u user.User
		err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt, &u.EmailVerified, &u.Image, &u.CreatedAtBA, &u.UpdatedAtBA, &u.Username, &u.DisplayUsername, &u.RoleID, &u.IsActive, &u.IsBlocked, &u.RoleName)
		if err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, nil
}

func (r *UserRepository) Update(ctx context.Context, u *user.User) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx,
		`UPDATE users SET name = $2, role_id = $3, is_active = $4, is_blocked = $5, updated_at = NOW(), "updatedAt" = NOW()
		WHERE id = $1`,
		u.ID, u.Name, u.RoleID, u.IsActive, u.IsBlocked,
	)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.pool.Exec(ctx, "DELETE FROM users WHERE id = $1", id)
	return err
}
