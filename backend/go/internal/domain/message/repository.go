package message

import (
	"context"

	"github.com/google/uuid"
)

// MessageRepository defines the interface for message and citation persistence.
type MessageRepository interface {
	Create(ctx context.Context, msg *Message) error
	GetBySessionID(ctx context.Context, sessionID uuid.UUID, limit int) ([]*Message, error)
	CreateCitations(ctx context.Context, citations []*MessageCitation) error
	GetCitationsByMessageID(ctx context.Context, messageID uuid.UUID) ([]*MessageCitation, error)
	SearchSimilarChunks(ctx context.Context, embedding []float32, courseID uuid.UUID, topK int) ([]*SimilarChunk, error)
}
