package auditlog

import (
	"time"

	"github.com/google/uuid"
)

type AuditLog struct {
	ID          uuid.UUID `json:"id" db:"id"`
	UserID      uuid.UUID `json:"user_id" db:"user_id"`
	Action      string    `json:"action" db:"action"`
	TargetTable string    `json:"target_table" db:"target_table"`
	TargetID    uuid.UUID `json:"target_id" db:"target_id"`
	IPAddress   *string   `json:"ip_address" db:"ip_address"`
	Description *string   `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}
