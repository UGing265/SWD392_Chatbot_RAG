package document_usecase

import (
	"swd392-chatbot-rag/internal/domain/chapter"
	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/domain/documentfile"
	"swd392-chatbot-rag/internal/domain/documentreport"
	"swd392-chatbot-rag/internal/domain/lecturersubject"
	"swd392-chatbot-rag/internal/domain/subject"
	"swd392-chatbot-rag/internal/domain/uploadjob"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"
	"swd392-chatbot-rag/internal/infrastructure/llm"
)

type DocumentUseCase struct {
	docRepo      document.DocumentRepository
	fileRepo     documentfile.DocumentFileRepository
	chunkRepo    chunk.ChunkRepository
	chapterRepo  chapter.ChapterRepository
	jobRepo      uploadjob.UploadJobRepository
	s3Storage    *filestorage.S3FileStorage
	llmClient    llm.LLMClient
	bookmarkRepo document.BookmarkRepository
	reportRepo   documentreport.DocumentReportRepository
	subjectRepo  subject.SubjectRepository
	assignRepo   lecturersubject.AssignmentRepository
}

func NewDocumentUseCase(
	docRepo document.DocumentRepository, fileRepo documentfile.DocumentFileRepository, chunkRepo chunk.ChunkRepository, chapterRepo chapter.ChapterRepository, jobRepo uploadjob.UploadJobRepository, bookmarkRepo document.BookmarkRepository, s3Storage *filestorage.S3FileStorage, llmClient llm.LLMClient, reportRepo documentreport.DocumentReportRepository, subjectRepo subject.SubjectRepository, assignRepo lecturersubject.AssignmentRepository,
) *DocumentUseCase {
	return &DocumentUseCase{
		docRepo:      docRepo,
		fileRepo:     fileRepo,
		chunkRepo:    chunkRepo,
		chapterRepo:  chapterRepo,
		jobRepo:      jobRepo,
		s3Storage:    s3Storage,
		llmClient:    llmClient,
		bookmarkRepo: bookmarkRepo,
		reportRepo:   reportRepo,
		subjectRepo:  subjectRepo,
		assignRepo:   assignRepo,
	}
}
