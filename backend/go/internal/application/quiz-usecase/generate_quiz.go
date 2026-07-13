package quizusecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"swd392-chatbot-rag/internal/domain/quiz"
	"swd392-chatbot-rag/internal/infrastructure/llm"
)

func (u *usecase) GenerateQuizAsync(ctx context.Context, req GenerateQuizReq) (*quiz.GenerationJob, error) {
	// 1. Validate ownership & Subject consistency
	if len(req.DocumentIDs) == 0 {
		return nil, errors.New("at least one document must be selected")
	}

	for _, docID := range req.DocumentIDs {
		doc, err := u.docRepo.FindByID(ctx, docID)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch document %s: %v", docID, err)
		}
		
		// 1. Quyền truy cập tài liệu: Public (school_wide) hoặc là của chính lecturer
		if doc.Visibility != "school_wide" && doc.OwnerUserID != req.LecturerID {
			return nil, fmt.Errorf("document %s is not public or owned by you", docID)
		}

		// 2. Tính đồng nhất môn học
		if doc.SubjectID == nil || *doc.SubjectID != req.SubjectID {
			return nil, errors.New("all selected documents must belong to the specified subject")
		}
	}

	// 2. Create Background Job
	job := &quiz.GenerationJob{
		ID:         uuid.New(),
		SubjectID:  req.SubjectID,
		LecturerID: req.LecturerID,
		Status:     quiz.JobStatusPending,
		Progress:   0,
	}

	if err := u.quizRepo.CreateGenerationJob(ctx, job); err != nil {
		return nil, err
	}

	// 3. Trigger Async Background Worker (In real app, this should use a queue like asynq/redis)
	go u.runGenerationWorker(req, job.ID)

	return job, nil
}

func (u *usecase) GetGenerationJobStatus(ctx context.Context, jobID uuid.UUID) (*quiz.GenerationJob, error) {
	return u.quizRepo.GetGenerationJobByID(ctx, jobID)
}

type LLMOption struct {
	Content   string `json:"content"`
	IsCorrect bool   `json:"is_correct"`
}

type LLMQuestion struct {
	Content     string      `json:"content"`
	Type        string      `json:"type"`
	Explanation string      `json:"explanation"`
	Options     []LLMOption `json:"options"`
}

type LLMQuiz struct {
	Title     string        `json:"title"`
	Questions []LLMQuestion `json:"questions"`
}

func (u *usecase) runGenerationWorker(req GenerateQuizReq, jobID uuid.UUID) {
	ctx := context.Background()

	failJob := func(err error) {
		job, _ := u.quizRepo.GetGenerationJobByID(ctx, jobID)
		if job != nil {
			job.Status = quiz.JobStatusFailed
			errMsg := err.Error()
			job.ErrorMessage = &errMsg
			_ = u.quizRepo.UpdateGenerationJob(ctx, job)
		}
	}

	// 1. Fetch chunks
	var contextText strings.Builder
	for _, docID := range req.DocumentIDs {
		chunks, err := u.chunkRepo.FindByDocumentID(ctx, docID)
		if err != nil {
			failJob(fmt.Errorf("failed to fetch chunks for doc %s: %w", docID, err))
			return
		}
		for _, ch := range chunks {
			if contextText.Len() > 50000 {
				break
			}
			contextText.WriteString(ch.Content + "\n\n")
		}
	}

	if contextText.Len() == 0 {
		failJob(fmt.Errorf("no context found for provided document IDs"))
		return
	}

	// 2. Build prompt
	sysPrompt := fmt.Sprintf(`You are an expert professor. Generate a quiz based ONLY on the provided context.
Do NOT hallucinate. You MUST adhere to the following constraints:
- Total questions: %d
- True/False questions: %d
- Single choice questions: %d
- Multiple choice questions: %d

For multiple choice questions, there MUST be at least 1 correct answer and it MUST be strictly less than the total number of options.
For single choice and multiple choice, generate between 3 and 5 options randomly.
Return ONLY valid JSON in the following format:
{
  "title": "A relevant title for the quiz",
  "questions": [
    {
      "content": "Question text",
      "type": "single_choice", // or "multiple_choice" or "true_false"
      "explanation": "Why this answer is correct",
      "options": [
        {"content": "Option text", "is_correct": true}
      ]
    }
  ]
}`, req.TotalQuestions, req.TrueFalseCount, req.SingleChoiceCount, req.MultipleChoiceCount)

	userMessage := fmt.Sprintf("Context:\n%s\n\nPlease generate the quiz now.", contextText.String())
	history := []llm.ChatMessage{
		{Role: "user", Content: userMessage},
	}

	// 3. Send to LLM
	llmClient, ok := u.llmService.(llm.LLMClient)
	if !ok {
		failJob(errors.New("LLM client not configured correctly"))
		return
	}

	respText, err := llmClient.Generate(ctx, sysPrompt, history)
	if err != nil {
		failJob(fmt.Errorf("LLM generation failed: %w", err))
		return
	}

	// 4. Parse JSON
	cleanedText := strings.TrimPrefix(strings.TrimSpace(respText), "```json")
	cleanedText = strings.TrimPrefix(cleanedText, "```")
	cleanedText = strings.TrimSuffix(cleanedText, "```")
	cleanedText = strings.TrimSpace(cleanedText)

	var llmResult LLMQuiz
	if err := json.Unmarshal([]byte(cleanedText), &llmResult); err != nil {
		failJob(fmt.Errorf("failed to parse JSON: %w", err))
		return
	}

	// 5. Save Quiz
	newQuiz := &quiz.Quiz{
		ID:             uuid.New(),
		SubjectID:      req.SubjectID,
		LecturerID:     req.LecturerID,
		Title:          llmResult.Title,
		Status:         quiz.StatusDraft,
		TotalQuestions: len(llmResult.Questions),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	if err := u.quizRepo.CreateQuiz(ctx, newQuiz); err != nil {
		failJob(fmt.Errorf("failed to create quiz: %w", err))
		return
	}

	for i, q := range llmResult.Questions {
		qType := quiz.TypeSingleChoice
		if q.Type == "multiple_choice" {
			qType = quiz.TypeMultipleChoice
		} else if q.Type == "true_false" {
			qType = quiz.TypeTrueFalse
		}

		newQ := &quiz.Question{
			ID:           uuid.New(),
			QuizID:       newQuiz.ID,
			QuestionType: qType,
			Content:      q.Content,
			OrderIndex:   i + 1,
			CreatedAt:    time.Now(),
		}
		if q.Explanation != "" {
			exp := q.Explanation
			newQ.Explanation = &exp
		}
		_ = u.quizRepo.CreateQuestion(ctx, newQ)

		for j, opt := range q.Options {
			newOpt := &quiz.Option{
				ID:         uuid.New(),
				QuestionID: newQ.ID,
				Content:    opt.Content,
				IsCorrect:  opt.IsCorrect,
				OrderIndex: j + 1,
			}
			_ = u.quizRepo.CreateOption(ctx, newOpt)
		}
	}

	// 6. Update Job Status
	job, _ := u.quizRepo.GetGenerationJobByID(ctx, jobID)
	if job != nil {
		job.Status = quiz.JobStatusCompleted
		job.ResultQuizID = &newQuiz.ID
		job.Progress = 100
		_ = u.quizRepo.UpdateGenerationJob(ctx, job)
	}
}
