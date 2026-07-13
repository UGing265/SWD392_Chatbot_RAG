package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"swd392-chatbot-rag/internal/application/quiz-usecase"
)

type QuizHandler struct {
	quizUsecase quizusecase.Usecase
}

func NewQuizHandler(qu quizusecase.Usecase) *QuizHandler {
	return &QuizHandler{
		quizUsecase: qu,
	}
}

type GenerateQuizReq struct {
	SubjectID           string   `json:"subject_id" binding:"required"`
	DocumentIDs         []string `json:"document_ids" binding:"required"`
	TotalQuestions      int      `json:"total_questions" binding:"required,min=1"`
	TrueFalseCount      int      `json:"true_false_count"`
	SingleChoiceCount   int      `json:"single_choice_count"`
	MultipleChoiceCount int      `json:"multiple_choice_count"`
}

// GenerateQuiz godoc
// @Summary Generate Quiz
// @Description Start background job to generate a quiz from documents
// @Tags quizzes
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param req body handler.GenerateQuizReq true "Generate Quiz Request"
// @Success 202 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/quizzes/lecturer/generate [post]
func (h *QuizHandler) GenerateQuiz(c *gin.Context) {
	var req GenerateQuizReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body", "details": err.Error()})
		return
	}

	lecturerID := c.MustGet("user_id").(uuid.UUID)

	subjectID, err := uuid.Parse(req.SubjectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject_id"})
		return
	}

	var docIDs []uuid.UUID
	for _, idStr := range req.DocumentIDs {
		id, err := uuid.Parse(idStr)
		if err == nil {
			docIDs = append(docIDs, id)
		}
	}

	usecaseReq := quizusecase.GenerateQuizReq{
		LecturerID:          lecturerID,
		SubjectID:           subjectID,
		DocumentIDs:         docIDs,
		TotalQuestions:      req.TotalQuestions,
		TrueFalseCount:      req.TrueFalseCount,
		SingleChoiceCount:   req.SingleChoiceCount,
		MultipleChoiceCount: req.MultipleChoiceCount,
	}

	job, err := h.quizUsecase.GenerateQuizAsync(c.Request.Context(), usecaseReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"message": "Quiz generation started",
		"job_id":  job.ID,
	})
}

// GetJobStatus godoc
// @Summary Get Job Status
// @Description Check the status of a quiz generation job
// @Tags quizzes
// @Security BearerAuth
// @Produce json
// @Param job_id path string true "Job ID"
// @Success 200 {object} quiz.GenerationJob
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/quizzes/lecturer/jobs/{job_id} [get]
func (h *QuizHandler) GetJobStatus(c *gin.Context) {
	jobIDStr := c.Param("job_id")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job_id"})
		return
	}

	job, err := h.quizUsecase.GetGenerationJobStatus(c.Request.Context(), jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, job)
}

// PublishQuiz godoc
// @Summary Publish Quiz
// @Description Change quiz status to published
// @Tags quizzes
// @Security BearerAuth
// @Produce json
// @Param quiz_id path string true "Quiz ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/quizzes/lecturer/{quiz_id}/publish [post]
func (h *QuizHandler) PublishQuiz(c *gin.Context) {
	quizIDStr := c.Param("quiz_id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quiz_id"})
		return
	}

	lecturerID := c.MustGet("user_id").(uuid.UUID)

	err = h.quizUsecase.PublishQuiz(c.Request.Context(), quizID, lecturerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Quiz published successfully"})
}

// ListQuizzesForLecturer godoc
// @Summary List Quizzes for Lecturer
// @Description List quizzes created by lecturer for a subject
// @Tags quizzes
// @Security BearerAuth
// @Produce json
// @Param subject_id path string true "Subject ID"
// @Success 200 {array} quiz.Quiz
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/quizzes/lecturer/subject/{subject_id} [get]
func (h *QuizHandler) ListQuizzesForLecturer(c *gin.Context) {
	subjectIDStr := c.Param("subject_id")
	subjectID, err := uuid.Parse(subjectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject_id"})
		return
	}

	lecturerID := c.MustGet("user_id").(uuid.UUID)

	quizzes, err := h.quizUsecase.ListQuizzesForLecturer(c.Request.Context(), subjectID, lecturerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, quizzes)
}

// ListQuizzesForStudent godoc
// @Summary List Quizzes for Student
// @Description List published quizzes for a subject
// @Tags quizzes
// @Security BearerAuth
// @Produce json
// @Param subject_id path string true "Subject ID"
// @Success 200 {array} quiz.Quiz
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/quizzes/student/subject/{subject_id} [get]
func (h *QuizHandler) ListQuizzesForStudent(c *gin.Context) {
	subjectIDStr := c.Param("subject_id")
	subjectID, err := uuid.Parse(subjectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject_id"})
		return
	}

	quizzes, err := h.quizUsecase.ListQuizzesForStudent(c.Request.Context(), subjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, quizzes)
}

// GetQuizDetail godoc
// @Summary Get Quiz Detail
// @Description Get quiz detail with questions and options
// @Tags quizzes
// @Security BearerAuth
// @Produce json
// @Param quiz_id path string true "Quiz ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/quizzes/{quiz_id}/detail [get]
func (h *QuizHandler) GetQuizDetail(c *gin.Context) {
	quizIDStr := c.Param("quiz_id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quiz_id"})
		return
	}

	quiz, questions, err := h.quizUsecase.GetQuizDetail(c.Request.Context(), quizID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"quiz":      quiz,
		"questions": questions,
	})
}

// StartAttempt godoc
// @Summary Start Quiz Attempt
// @Description Start a new quiz attempt for student or preview for lecturer
// @Tags quizzes
// @Security BearerAuth
// @Produce json
// @Param quiz_id path string true "Quiz ID"
// @Param preview query bool false "Is Preview"
// @Success 201 {object} quiz.Attempt
// @Failure 400 {object} map[string]string
// @Router /api/quizzes/student/{quiz_id}/attempt [post]
func (h *QuizHandler) StartAttempt(c *gin.Context) {
	quizIDStr := c.Param("quiz_id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quiz_id"})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	isPreview := c.Query("preview") == "true"

	attempt, err := h.quizUsecase.StartAttempt(c.Request.Context(), quizID, userID, isPreview)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, attempt)
}

type SubmitAttemptReq struct {
	AttemptID string `json:"attempt_id" binding:"required"`
	Answers   []struct {
		QuestionID        string   `json:"question_id" binding:"required"`
		SelectedOptionIDs []string `json:"selected_option_ids" binding:"required"`
	} `json:"answers" binding:"required"`
}

// SubmitAttempt godoc
// @Summary Submit Quiz Attempt
// @Description Submit an attempt with answers and auto-grade
// @Tags quizzes
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param req body handler.SubmitAttemptReq true "Submit Attempt Request"
// @Success 200 {object} quiz.Attempt
// @Failure 400 {object} map[string]string
// @Router /api/quizzes/student/attempt/submit [post]
func (h *QuizHandler) SubmitAttempt(c *gin.Context) {
	var req SubmitAttemptReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body", "details": err.Error()})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	attemptID, err := uuid.Parse(req.AttemptID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid attempt_id"})
		return
	}

	var usecaseAnswers []quizusecase.AttemptAnswerReq
	for _, ans := range req.Answers {
		qID, err := uuid.Parse(ans.QuestionID)
		if err != nil {
			continue
		}
		var optIDs []uuid.UUID
		for _, oStr := range ans.SelectedOptionIDs {
			oID, err := uuid.Parse(oStr)
			if err == nil {
				optIDs = append(optIDs, oID)
			}
		}
		usecaseAnswers = append(usecaseAnswers, quizusecase.AttemptAnswerReq{
			QuestionID:        qID,
			SelectedOptionIDs: optIDs,
		})
	}

	usecaseReq := quizusecase.SubmitAttemptReq{
		AttemptID: attemptID,
		UserID:    userID,
		Answers:   usecaseAnswers,
	}

	attempt, err := h.quizUsecase.SubmitAttempt(c.Request.Context(), usecaseReq)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, attempt)
}

// GetAttemptHistory godoc
// @Summary Get Attempt History
// @Description Get list of past attempts for a quiz
// @Tags quizzes
// @Security BearerAuth
// @Produce json
// @Param quiz_id path string true "Quiz ID"
// @Success 200 {array} quiz.Attempt
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/quizzes/student/{quiz_id}/attempts [get]
func (h *QuizHandler) GetAttemptHistory(c *gin.Context) {
	quizIDStr := c.Param("quiz_id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quiz_id"})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	attempts, err := h.quizUsecase.GetAttemptHistory(c.Request.Context(), quizID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": attempts})
}

// @Summary Get all subjects that have published quizzes
// @Description Returns a list of subjects that contain at least one published quiz.
// @Tags Quiz
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/quizzes/subjects [get]
func (h *QuizHandler) GetSubjectsWithQuizzes(c *gin.Context) {
	subjects, err := h.quizUsecase.ListSubjectsWithPublishedQuizzes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": subjects})
}
