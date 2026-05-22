package indexing

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/infrastructure/chunker"
	"swd392-chatbot-rag/internal/infrastructure/embedding"
	"swd392-chatbot-rag/internal/infrastructure/fileparser"

	"github.com/google/uuid"
)

var (
	ErrDocumentNotFound  = errors.New("document not found")
	ErrNoParserFound     = errors.New("no parser found for document file type")
	ErrNoChunksGenerated = errors.New("no chunks generated from document")
)

const (
	batchSize        = 50
	embeddingDim     = 768
	defaultChunkSize = 500
	defaultOverlap   = 100
)

type IndexingUseCase struct {
	docRepo   document.DocumentRepository
	chunkRepo chunkRepository
	parser    *fileparser.ParserFactory
	chunker   *chunker.TextChunker
	embedding embedding.EmbeddingClient
}

type chunkRepository interface {
	Create(ctx context.Context, ch *chunk.Chunk) error
	CreateBatch(ctx context.Context, chunks []*chunk.Chunk) error
	FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*chunk.Chunk, error)
	DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error
}

func NewIndexingUseCase(
	docRepo document.DocumentRepository,
	chunkRepo chunkRepository,
	parser *fileparser.ParserFactory,
	embedClient embedding.EmbeddingClient,
) *IndexingUseCase {
	return &IndexingUseCase{
		docRepo:   docRepo,
		chunkRepo: chunkRepo,
		parser:    parser,
		chunker:   chunker.NewTextChunker(defaultChunkSize, defaultOverlap),
		embedding: embedClient,
	}
}

func (uc *IndexingUseCase) ProcessDocument(ctx context.Context, docID uuid.UUID) error {
	doc, err := uc.docRepo.FindByID(docID)
	if err != nil {
		return fmt.Errorf("failed to find document: %w", err)
	}
	if doc == nil {
		return ErrDocumentNotFound
	}

	doc.Status = document.StatusChunking
	if err := uc.docRepo.Update(doc); err != nil {
		return fmt.Errorf("failed to update document status to chunking: %w", err)
	}

	extractions, err := uc.parseDocument(doc.FilePath, doc.FileType)
	if err != nil {
		return uc.failDoc(doc, fmt.Errorf("failed to parse document: %w", err))
	}

	if len(extractions) == 0 {
		return uc.failDoc(doc, errors.New("no content extracted from document"))
	}

	chunks := uc.chunkExtractions(extractions, doc.ID)

	if len(chunks) == 0 {
		return uc.failDoc(doc, ErrNoChunksGenerated)
	}

	doc.ChunkCount = len(chunks)
	doc.Status = document.StatusEmbedding
	if err := uc.docRepo.Update(doc); err != nil {
		return fmt.Errorf("failed to update document status to embedding: %w", err)
	}

	embeddings, err := uc.generateEmbeddings(ctx, chunks, doc)
	if err != nil {
		return uc.failDoc(doc, fmt.Errorf("failed to generate embeddings: %w", err))
	}

	for i, ch := range chunks {
		ch.ID = uuid.New()
		ch.Embedding = embeddings[i]
	}

	if err := uc.saveChunks(ctx, chunks); err != nil {
		return uc.failDoc(doc, fmt.Errorf("failed to save chunks: %w", err))
	}

	now := time.Now()
	doc.Status = document.StatusIndexed
	doc.EmbeddingCount = len(chunks)
	doc.IndexedAt = &now
	if err := uc.docRepo.Update(doc); err != nil {
		return fmt.Errorf("failed to update document status to indexed: %w", err)
	}

	log.Printf("Successfully indexed document %s with %d chunks", docID, len(chunks))
	return nil
}

func (uc *IndexingUseCase) parseDocument(filePath, fileType string) ([]fileparser.ExtractionResult, error) {
	ext := "." + strings.ToLower(fileType)
	parser := uc.parser.Get(ext)
	if parser == nil {
		return nil, ErrNoParserFound
	}

	results, err := parser.Extract(filePath)
	if err != nil {
		return nil, fmt.Errorf("parser extraction failed: %w", err)
	}

	return results, nil
}

func (uc *IndexingUseCase) chunkExtractions(extractions []fileparser.ExtractionResult, docID uuid.UUID) []*chunk.Chunk {
	var allChunks []*chunk.Chunk

	for _, ext := range extractions {
		// Sanitize extracted text to valid UTF-8 and remove null bytes to prevent Postgres SQLSTATE 22021 errors
		cleanContent := strings.ToValidUTF8(ext.Content, "")
		cleanContent = strings.ReplaceAll(cleanContent, "\x00", "")
		textChunks := uc.chunker.ChunkText(cleanContent, ext.PageLabel)
		for _, tc := range textChunks {
			ch := &chunk.Chunk{
				DocumentID: docID,
				Content:    tc.Content,
				PageLabel:  tc.PageLabel,
				CreatedAt:  time.Now(),
			}
			allChunks = append(allChunks, ch)
		}
	}

	for i := range allChunks {
		allChunks[i].ChunkIndex = i
	}

	return allChunks
}

func (uc *IndexingUseCase) generateEmbeddings(ctx context.Context, chunks []*chunk.Chunk, doc *document.Document) ([][]float32, error) {
	texts := make([]string, len(chunks))
	for i, ch := range chunks {
		texts[i] = ch.Content
	}

	var allEmbeddings [][]float32

	for i := 0; i < len(texts); i += batchSize {
		end := i + batchSize
		if end > len(texts) {
			end = len(texts)
		}

		batchTexts := texts[i:end]
		batchEmbeddings, err := uc.embedding.EmbedBatch(ctx, batchTexts)
		if err != nil {
			return nil, fmt.Errorf("embedding batch %d-%d failed: %w", i, end, err)
		}

		for _, emb := range batchEmbeddings {
			if len(emb) != embeddingDim {
				return nil, fmt.Errorf("embedding has %d dimensions, expected %d", len(emb), embeddingDim)
			}
		}

		allEmbeddings = append(allEmbeddings, batchEmbeddings...)

		// Update progress in database so UI can see it jumping
		if doc != nil {
			doc.EmbeddingCount = len(allEmbeddings)
			_ = uc.docRepo.Update(doc) // ignore error to not break the flow
		}

		// Throttle: We reduced this to 10 seconds per user request
		if end < len(texts) {
			time.Sleep(3 * time.Second)
		}
	}

	return allEmbeddings, nil
}

func (uc *IndexingUseCase) saveChunks(ctx context.Context, chunks []*chunk.Chunk) error {
	for i := 0; i < len(chunks); i += batchSize {
		end := i + batchSize
		if end > len(chunks) {
			end = len(chunks)
		}

		batch := chunks[i:end]
		if err := uc.chunkRepo.CreateBatch(ctx, batch); err != nil {
			return fmt.Errorf("failed to save chunk batch %d-%d: %w", i, end, err)
		}
	}
	return nil
}

func (uc *IndexingUseCase) failDoc(doc *document.Document, err error) error {
	doc.Status = document.StatusError
	errMsg := err.Error()
	doc.ErrorMessage = &errMsg
	if updateErr := uc.docRepo.Update(doc); updateErr != nil {
		log.Printf("failed to update document status to error: %v", updateErr)
	}
	return err
}
