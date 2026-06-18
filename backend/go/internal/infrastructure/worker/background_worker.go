package worker

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"swd392-chatbot-rag/internal/domain/chapter"
	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/domain/documentfile"
	"swd392-chatbot-rag/internal/domain/uploadjob"
	"swd392-chatbot-rag/internal/infrastructure/chunker"
	"swd392-chatbot-rag/internal/infrastructure/embedding"
	"swd392-chatbot-rag/internal/infrastructure/fileparser"
	"swd392-chatbot-rag/internal/infrastructure/filestorage"
	"swd392-chatbot-rag/internal/infrastructure/segmentation"

	"github.com/google/uuid"
)

type BackgroundWorker struct {
	jobRepo      uploadjob.UploadJobRepository
	docRepo      document.DocumentRepository
	fileRepo     documentfile.DocumentFileRepository
	chunkRepo    chunk.ChunkRepository
	chapterRepo  chapter.ChapterRepository
	storage      *filestorage.S3FileStorage
	parser       *fileparser.ParserFactory
	chunker      *chunker.TextChunker
	embedder     embedding.EmbeddingClient
	segmentator  *segmentation.GeminiChapterSegmentationService
}

func NewBackgroundWorker(
	jobRepo uploadjob.UploadJobRepository,
	docRepo document.DocumentRepository,
	fileRepo documentfile.DocumentFileRepository,
	chunkRepo chunk.ChunkRepository,
	chapterRepo chapter.ChapterRepository,
	storage *filestorage.S3FileStorage,
	parser *fileparser.ParserFactory,
	embedder embedding.EmbeddingClient,
	segmentator *segmentation.GeminiChapterSegmentationService,
) *BackgroundWorker {
	return &BackgroundWorker{
		jobRepo:     jobRepo,
		docRepo:     docRepo,
		fileRepo:    fileRepo,
		chunkRepo:   chunkRepo,
		chapterRepo: chapterRepo,
		storage:     storage,
		parser:      parser,
		chunker:     chunker.NewTextChunker(500, 100), // Default chunk size & overlap
		embedder:    embedder,
		segmentator: segmentator,
	}
}

func (w *BackgroundWorker) Start(ctx context.Context) {
	log.Println("Background upload worker started...")
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Background upload worker stopping...")
			return
		case <-ticker.C:
			w.processNextJob(ctx)
		}
	}
}

func (w *BackgroundWorker) processNextJob(ctx context.Context) {
	job, err := w.jobRepo.GetNextPendingJob(ctx)
	if err != nil {
		log.Printf("Background worker error fetching job: %v", err)
		return
	}
	if job == nil {
		return
	}

	log.Printf("Processing upload job %s for document %v", job.ID, job.DocumentID)
	if job.DocumentID == nil {
		w.failJob(ctx, job, "Thiếu document ID")
		return
	}

	doc, err := w.docRepo.FindByID(ctx, *job.DocumentID)
	if err != nil || doc == nil {
		w.failJob(ctx, job, "Không tìm thấy tài liệu")
		return
	}

	if job.StoragePath == nil || *job.StoragePath == "" {
		w.failJob(ctx, job, "Thiếu storage key/path")
		return
	}

	// Step 1: Processing
	w.updateJobProgress(ctx, job, "processing", 5, "Đang tải tệp từ lưu trữ")

	// Tải file về thư mục tạm
	ext := filepath.Ext(job.FileName)
	tempFile, err := os.CreateTemp("", fmt.Sprintf("upload-*%s", ext))
	if err != nil {
		w.failJob(ctx, job, fmt.Sprintf("Không thể tạo tệp tạm: %v", err))
		return
	}
	tempFilePath := tempFile.Name()
	defer os.Remove(tempFilePath)
	defer tempFile.Close()

	// Đọc từ Storage
	reader, err := w.storage.OpenRead(ctx, *job.StoragePath)
	if err != nil {
		w.failJob(ctx, job, fmt.Sprintf("Không thể đọc tệp từ storage: %v", err))
		return
	}
	defer reader.Close()

	if _, err := io.Copy(tempFile, reader); err != nil {
		w.failJob(ctx, job, fmt.Sprintf("Lỗi tải tệp: %v", err))
		return
	}

	w.updateJobProgress(ctx, job, "processing", 15, "Đang phân tích nội dung văn bản")

	// Tính checksum SHA256
	checksum, err := computeSHA256(tempFilePath)
	if err != nil {
		w.failJob(ctx, job, fmt.Sprintf("Không thể tính checksum: %v", err))
		return
	}

	// Parse Text
	parserObj := w.parser.Get(strings.ToLower(ext))
	if parserObj == nil {
		w.failJob(ctx, job, "Không hỗ trợ định dạng file này")
		return
	}

	extractions, err := parserObj.Extract(tempFilePath)
	if err != nil {
		w.failJob(ctx, job, fmt.Sprintf("Lỗi trích xuất text: %v", err))
		return
	}

	if len(extractions) == 0 {
		w.failJob(ctx, job, "Tài liệu rỗng hoặc không có nội dung")
		return
	}

	// Chunking
	var allChunks []*chunk.Chunk
	chunkIndex := 0

	for _, extResult := range extractions {
		cleanContent := strings.ToValidUTF8(extResult.Content, "")
		cleanContent = strings.ReplaceAll(cleanContent, "\x00", " ") // Sanitize null bytes
		textChunks := w.chunker.ChunkText(cleanContent, extResult.PageLabel)
		
		for _, tc := range textChunks {
			metaMap := map[string]interface{}{
				"sourceFileName": job.FileName,
				"s3Key":          *job.StoragePath,
				"checksumSha256": checksum,
				"chunkOrder":     chunkIndex,
			}
			metaBytes, _ := json.Marshal(metaMap)

			chContent := strings.ToValidUTF8(tc.Content, "")
			chContent = strings.ReplaceAll(chContent, "\x00", " ")

			ch := &chunk.Chunk{
				ID:         uuid.New(),
				DocumentID: *job.DocumentID,
				ChunkOrder: chunkIndex,
				Content:    chContent,
				Metadata:   string(metaBytes),
				CreatedAt:  time.Now(),
			}
			allChunks = append(allChunks, ch)
			chunkIndex++
		}
	}

	if len(allChunks) == 0 {
		w.failJob(ctx, job, "Không tạo được các phân đoạn chunk")
		return
	}

	w.updateJobProgress(ctx, job, "processing", 20, "Đang sinh vector chỉ mục (embedding)")

	// Embedding & Saving Chunks (in Batches of 50)
	batchSize := 50
	totalChunks := len(allChunks)

	for i := 0; i < totalChunks; i += batchSize {
		end := i + batchSize
		if end > totalChunks {
			end = totalChunks
		}

		batch := allChunks[i:end]
		texts := make([]string, len(batch))
		for idx, c := range batch {
			texts[idx] = c.Content
		}

		// Gọi Gemini Embedding
		embeddings, err := w.embedder.EmbedBatch(ctx, texts)
		if err != nil {
			w.failJob(ctx, job, fmt.Sprintf("Lỗi sinh embedding: %v", err))
			return
		}

		for idx, emb := range embeddings {
			batch[idx].Embedding = emb
		}

		// Lưu Chunks vào DB
		if err := w.chunkRepo.CreateBatch(ctx, batch); err != nil {
			w.failJob(ctx, job, fmt.Sprintf("Lỗi lưu chunks vào DB: %v", err))
			return
		}

		// Cập nhật tiến độ
		progress := 20 + int(float64(end)/float64(totalChunks)*60)
		w.updateJobProgress(ctx, job, "processing", progress, fmt.Sprintf("Đang lưu Vector chỉ mục (%d%%)", progress))
		
		// Tránh Rate Limit Gemini Free
		if end < totalChunks {
			time.Sleep(2 * time.Second)
		}
	}

	// Lưu Document File thông tin
	s3Bucket := ""
	s3Key := *job.StoragePath
	urlStr := fmt.Sprintf("s3://%s", s3Key)
	
	docFile := &documentfile.DocumentFile{
		ID:               uuid.New(),
		DocumentID:       *job.DocumentID,
		OriginalFilename: job.FileName,
		StoragePath:      *job.StoragePath,
		FileUrl:          &urlStr,
		MimeType:         nil, // Có thể suy ra từ ext
		FileSizeBytes:    job.FileSizeBytes,
		ChecksumSha256:   &checksum,
		PageCount:        nil,
		ExtractedText:    nil, // Đã parse xong
		ExtractionStatus: "success",
		CreatedAt:        time.Now(),
		S3Bucket:         &s3Bucket,
		S3Key:            &s3Key,
	}
	if err := w.fileRepo.Create(ctx, docFile); err != nil {
		w.failJob(ctx, job, fmt.Sprintf("Lỗi lưu file metadata: %v", err))
		return
	}

	// Cập nhật Document fields
	doc.TotalChunks = totalChunks
	doc.Status = "completed"
	doc.ApprovedAt = &doc.CreatedAt // Tự động approved hoặc set approved_at
	nowTime := time.Now()
	doc.UpdatedAt = nowTime
	
	if err := w.docRepo.Update(ctx, doc); err != nil {
		w.failJob(ctx, job, fmt.Sprintf("Lỗi cập nhật tài liệu: %v", err))
		return
	}

	// Step 6: AI Chapter Segmentation
	w.updateJobProgress(ctx, job, "processing", 90, "Đang phân tích phân đoạn chương bằng AI")

	chapters, err := w.segmentator.GenerateChapters(ctx, doc, allChunks)
	if err == nil && len(chapters) > 0 {
		if err := w.chapterRepo.CreateBatch(ctx, chapters); err == nil {
			// Cập nhật ChapterID cho các chunks
			for _, chap := range chapters {
				start := 0
				if chap.StartChunkIndex != nil {
					start = *chap.StartChunkIndex
				}
				end := 0
				if chap.EndChunkIndex != nil {
					end = *chap.EndChunkIndex
				}

				if err := w.chunkRepo.UpdateChapterIDRange(ctx, doc.ID, start, end, chap.ID); err != nil {
					log.Printf("Failed to update chapter ID range for chapter %s: %v", chap.ID, err)
				}
			}
			doc.TotalChapters = len(chapters)
			_ = w.docRepo.Update(ctx, doc)
		} else {
			log.Printf("Failed to save AI chapters: %v", err)
		}
	} else {
		log.Printf("AI chapter generation returned empty or failed: %v", err)
	}

	// Step 7: Done
	w.updateJobProgress(ctx, job, "done", 100, "Hoàn tất")
	log.Printf("Successfully completed upload job %s", job.ID)
}

func (w *BackgroundWorker) updateJobProgress(ctx context.Context, job *uploadjob.UploadJob, status string, progress int, msg string) {
	job.Status = status
	job.ProgressPercent = progress
	job.Message = &msg
	job.UpdatedAt = time.Now()
	_ = w.jobRepo.Update(ctx, job)
}

func (w *BackgroundWorker) failJob(ctx context.Context, job *uploadjob.UploadJob, reason string) {
	job.Status = "failed"
	job.Message = &reason
	job.UpdatedAt = time.Now()
	_ = w.jobRepo.Update(ctx, job)

	if job.DocumentID != nil {
		if doc, err := w.docRepo.FindByID(ctx, *job.DocumentID); err == nil && doc != nil {
			doc.Status = "error"
			_ = w.docRepo.Update(ctx, doc)
		}
	}
}

func computeSHA256(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}
