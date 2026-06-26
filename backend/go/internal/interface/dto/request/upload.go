package request

import (
	"errors"

	"github.com/google/uuid"
)

type UploadDocumentRequest struct {
	CourseID  string `form:"course_id" json:"course_id"`
	ChapterID string `form:"chapter_id" json:"chapter_id"`
}

func (r *UploadDocumentRequest) Validate() error {
	if r.CourseID == "" {
		return errors.New("course_id is required")
	}
	if _, err := uuid.Parse(r.CourseID); err != nil {
		return errors.New("invalid course_id format")
	}
	if r.ChapterID != "" {
		if _, err := uuid.Parse(r.ChapterID); err != nil {
			return errors.New("invalid chapter_id format")
		}
	}
	return nil
}
