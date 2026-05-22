package chapter

import (
	"time"

	"github.com/google/uuid"
)

type Chapter struct {
	ID        uuid.UUID `json:"id" db:"id"`
	CourseID  uuid.UUID `json:"course_id" db:"course_id"`
	Title     string    `json:"title" db:"title"`
	ChapterNo *int      `json:"chapter_no" db:"chapter_no"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}