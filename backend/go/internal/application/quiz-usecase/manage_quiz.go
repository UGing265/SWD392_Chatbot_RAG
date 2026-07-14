package quizusecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"swd392-chatbot-rag/internal/domain/quiz"
	"swd392-chatbot-rag/internal/domain/subject"
)

func (u *usecase) PublishQuiz(ctx context.Context, quizID uuid.UUID, lecturerID uuid.UUID) error {
	q, err := u.quizRepo.GetQuizByID(ctx, quizID)
	if err != nil {
		return err
	}

	if q.LecturerID != lecturerID {
		return errors.New("only the creator can publish this quiz")
	}

	if q.Status == quiz.StatusPublished {
		return errors.New("quiz is already published")
	}

	// Validation rule: Must have questions
	questions, err := u.quizRepo.GetQuestionsByQuizID(ctx, quizID)
	if err != nil {
		return err
	}

	if len(questions) == 0 {
		return errors.New("cannot publish an empty quiz")
	}

	for _, reqQ := range questions {
		options, err := u.quizRepo.GetOptionsByQuestionID(ctx, reqQ.ID)
		if err != nil {
			return err
		}
		
		correctCount := 0
		for _, opt := range options {
			if opt.IsCorrect {
				correctCount++
			}
		}

		// Validation logic based on question type
		switch reqQ.QuestionType {
		case quiz.TypeSingleChoice:
			if correctCount != 1 {
				return errors.New("single_choice question must have exactly 1 correct option")
			}
		case quiz.TypeMultipleChoice:
			if correctCount < 1 || correctCount >= len(options) {
				return errors.New("multiple_choice question must have >=1 correct option and < total options")
			}
		case quiz.TypeTrueFalse:
			if len(options) != 2 || correctCount != 1 {
				return errors.New("true_false question must have exactly 2 options and 1 correct option")
			}
		}
	}

	q.Status = quiz.StatusPublished
	return u.quizRepo.UpdateQuiz(ctx, q)
}

func (u *usecase) GetQuizDetail(ctx context.Context, quizID uuid.UUID) (*quiz.Quiz, []*quiz.Question, error) {
	q, err := u.quizRepo.GetQuizByID(ctx, quizID)
	if err != nil {
		return nil, nil, err
	}

	questions, err := u.quizRepo.GetQuestionsByQuizID(ctx, quizID)
	if err != nil {
		return nil, nil, err
	}

	for _, qItem := range questions {
		options, err := u.quizRepo.GetOptionsByQuestionID(ctx, qItem.ID)
		if err == nil {
			qItem.Options = options
		}
	}

	return q, questions, nil
}

func (u *usecase) ListQuizzesForStudent(ctx context.Context, subjectID uuid.UUID) ([]*quiz.Quiz, error) {
	// For students, only list Published quizzes.
	return u.quizRepo.ListQuizzesBySubject(ctx, subjectID, false, nil)
}

func (u *usecase) ListQuizzesForLecturer(ctx context.Context, subjectID uuid.UUID, lecturerID uuid.UUID) ([]*quiz.Quiz, error) {
	// For lecturers, list Published quizzes from everyone AND Draft/Archived quizzes created by themselves.
	return u.quizRepo.ListQuizzesBySubject(ctx, subjectID, true, &lecturerID)
}

func (u *usecase) ListSubjectsWithPublishedQuizzes(ctx context.Context) ([]*subject.Subject, error) {
	return u.quizRepo.ListSubjectsWithPublishedQuizzes(ctx)
}
