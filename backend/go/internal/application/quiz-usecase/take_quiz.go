package quizusecase

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"swd392-chatbot-rag/internal/domain/quiz"
)

func (u *usecase) StartAttempt(ctx context.Context, quizID uuid.UUID, userID uuid.UUID, isPreview bool) (*quiz.Attempt, error) {
	q, err := u.quizRepo.GetQuizByID(ctx, quizID)
	if err != nil {
		return nil, err
	}

	if q.Status != quiz.StatusPublished && !isPreview {
		return nil, errors.New("cannot attempt an unpublished quiz")
	}

	attempt := &quiz.Attempt{
		ID:           uuid.New(),
		QuizID:       quizID,
		UserID:       userID,
		Score:        0,
		TotalCorrect: 0,
		IsPreview:    isPreview,
		StartedAt:    time.Now(),
	}

	if err := u.quizRepo.CreateAttempt(ctx, attempt); err != nil {
		return nil, err
	}

	return attempt, nil
}

func (u *usecase) SubmitAttempt(ctx context.Context, req SubmitAttemptReq) (*quiz.Attempt, error) {
	attempt, err := u.quizRepo.GetAttemptByID(ctx, req.AttemptID)
	if err != nil {
		return nil, err
	}

	if attempt.UserID != req.UserID {
		return nil, errors.New("unauthorized attempt submission")
	}

	if attempt.CompletedAt != nil {
		return nil, errors.New("attempt already submitted")
	}

	questions, err := u.quizRepo.GetQuestionsByQuizID(ctx, attempt.QuizID)
	if err != nil {
		return nil, err
	}

	totalCorrect := 0
	totalQuestions := len(questions)

	// Map questions for quick lookup
	questionMap := make(map[uuid.UUID]*quiz.Question)
	for _, q := range questions {
		options, _ := u.quizRepo.GetOptionsByQuestionID(ctx, q.ID)
		q.Options = options
		questionMap[q.ID] = q
	}

	for _, answerReq := range req.Answers {
		q, ok := questionMap[answerReq.QuestionID]
		if !ok {
			continue
		}

		isCorrect := false

		// Auto-grading logic based on Question Type
		switch q.QuestionType {
		case quiz.TypeSingleChoice, quiz.TypeTrueFalse:
			// Expect exactly 1 selected option
			if len(answerReq.SelectedOptionIDs) == 1 {
				for _, opt := range q.Options {
					if opt.ID == answerReq.SelectedOptionIDs[0] && opt.IsCorrect {
						isCorrect = true
						break
					}
				}
			}
		case quiz.TypeMultipleChoice:
			// All-or-nothing grading
			correctOptionIDs := make(map[uuid.UUID]bool)
			for _, opt := range q.Options {
				if opt.IsCorrect {
					correctOptionIDs[opt.ID] = true
				}
			}

			if len(answerReq.SelectedOptionIDs) == len(correctOptionIDs) {
				allMatch := true
				for _, selectedID := range answerReq.SelectedOptionIDs {
					if !correctOptionIDs[selectedID] {
						allMatch = false
						break
					}
				}
				isCorrect = allMatch
			}
		}

		// Save the answer
		attemptAnswer := &quiz.AttemptAnswer{
			ID:                uuid.New(),
			AttemptID:         attempt.ID,
			QuestionID:        q.ID,
			SelectedOptionIDs: answerReq.SelectedOptionIDs,
			IsCorrect:         isCorrect,
		}
		
		_ = u.quizRepo.CreateAttemptAnswer(ctx, attemptAnswer)

		if isCorrect {
			totalCorrect++
		}
	}

	score := 0.0
	if totalQuestions > 0 {
		score = float64(totalCorrect) / float64(totalQuestions) * 10.0 // Score out of 10
	}

	now := time.Now()
	attempt.TotalCorrect = totalCorrect
	attempt.Score = score
	attempt.CompletedAt = &now

	if err := u.quizRepo.UpdateAttempt(ctx, attempt); err != nil {
		return nil, err
	}

	return attempt, nil
}

func (u *usecase) GetAttemptHistory(ctx context.Context, quizID uuid.UUID, userID uuid.UUID) ([]*quiz.Attempt, error) {
	return u.quizRepo.ListAttemptsByQuizAndUser(ctx, quizID, userID)
}
