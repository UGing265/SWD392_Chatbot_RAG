package chatusecase

import (
	"context"
	"fmt"

	"swd392-chatbot-rag/internal/domain/message"

	"github.com/google/uuid"
)

// MessageWithCitations wraps a message with its associated citations.
type MessageWithCitations struct {
	Message   *message.Message           `json:"message"`
	Citations []*message.MessageCitation `json:"citations,omitempty"`
}

// GetHistory returns ordered messages for a session with citations loaded.
func (uc *ChatUseCase) GetHistory(ctx context.Context, userID, sessionID uuid.UUID) ([]*MessageWithCitations, error) {
	// Verify ownership
	if _, err := uc.GetSession(ctx, sessionID, userID); err != nil {
		return nil, err
	}

	messages, err := uc.msgRepo.GetBySessionID(ctx, sessionID, 100)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}

	result := make([]*MessageWithCitations, 0, len(messages))
	for _, msg := range messages {
		entry := &MessageWithCitations{Message: msg}
		if msg.Role == message.RoleBot {
			citations, err := uc.msgRepo.GetCitationsByMessageID(ctx, msg.ID)
			if err == nil {
				entry.Citations = citations
			}
		}
		result = append(result, entry)
	}
	return result, nil
}
