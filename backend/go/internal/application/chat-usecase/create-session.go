package chat_usecase

import (
	"context"
	"fmt"
	"time"

	"swd392-chatbot-rag/internal/domain/chatsession"

	"github.com/google/uuid"
)

// CreateSession creates a new chat session for the user.
func (uc *ChatUseCase) CreateSession(ctx context.Context, userID, courseID uuid.UUID, title *string, documentIDs []uuid.UUID) (*chatsession.ChatSession, error) {
	if len(documentIDs) > 5 {
		return nil, fmt.Errorf("không được chọn quá 5 tài liệu trong một phiên chat")
	}

	sessionTitle := "New chat"
	if title != nil && *title != "" {
		sessionTitle = *title
	}

	now := time.Now().UTC()
	session := &chatsession.ChatSession{
		ID:          uuid.New(),
		UserID:      userID,
		CourseID:    courseID,
		Title:       sessionTitle,
		IsStarred:   false,
		Status:      chatsession.StatusActive,
		CreatedAt:   now,
		UpdatedAt:   now,
		DocumentIDs: documentIDs,
	}

	if err := uc.sessionRepo.Create(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}
	return session, nil
}

// GetUserSessions returns all sessions belonging to a user.
func (uc *ChatUseCase) GetUserSessions(ctx context.Context, userID uuid.UUID) ([]*chatsession.ChatSession, error) {
	return uc.sessionRepo.GetByUserID(ctx, userID)
}

// GetSession returns a single session, verifying ownership.
func (uc *ChatUseCase) GetSession(ctx context.Context, sessionID, userID uuid.UUID) (*chatsession.ChatSession, error) {
	session, err := uc.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("session not found: %w", err)
	}
	if session.UserID != userID {
		return nil, fmt.Errorf("session does not belong to user")
	}
	return session, nil
}

// DeleteSession deletes a session owned by the user.
func (uc *ChatUseCase) DeleteSession(ctx context.Context, sessionID, userID uuid.UUID) error {
	session, err := uc.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("session not found: %w", err)
	}
	if session.UserID != userID {
		return fmt.Errorf("session does not belong to user")
	}
	return uc.sessionRepo.Delete(ctx, sessionID)
}
