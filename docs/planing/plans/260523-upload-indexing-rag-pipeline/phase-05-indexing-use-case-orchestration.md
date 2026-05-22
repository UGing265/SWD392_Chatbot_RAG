# Phase 05: Indexing Use Case (Orchestration)

## Context Links

- `../plan.md` - Plan overview
- `Phase 01-04` - File upload, parsing, chunking, embedding

## Overview

- **Priority:** High
- **Current status:** Pending
- **Brief description:** Orchestrate the background indexing pipeline: parse document → chunk → embed → store in pgvector.

## Architecture

```
[Upload Use Case]
    │
    ├── Save file to disk
    ├── Create Document (status=uploading)
    └── Return document_id

[Background: IndexingUseCase.ProcessDocument]
    │
    ├── Update status = "chunking"
    ├── Get file path from Document
    │
    ├── [Parser Factory] ──→ Extract text per page
    │       │
    │       └── []ExtractionResult{Content, PageLabel}
    │
    ├── [Chunker.Split] ──→ []Chunk
    │       │
    │       └── Recursive split, 500 tokens, 100 overlap
    │
    ├── [EmbeddingClient.EmbedBatch] ──→ [][]float32
    │       │
    │       └── Batch to Gemini API, 50 per request
    │
    ├── [ChunkRepository.SaveBatch] ──→ Store chunks + embeddings
    │       │
    │       └── INSERT INTO chunks (document_id, content, embedding, ...)
    │
    ├── Update status = "indexed"
    ├── Set indexed_at
    └── On error: status = "error", save error_message
```

## Requirements

### Functional
- Parse uploaded file using appropriate parser
- Split text into chunks with metadata
- Generate embeddings via Gemini Embedding 2
- Store chunks with vectors in pgvector
- Track progress (chunk_count, embedding_count)
- Handle errors gracefully with status updates

### Non-Functional
- Background processing (not blocking HTTP request)
- Atomic progress tracking
- Idempotent (can retry on failure)

## Related Code Files

### New Files to Create
- `backend/internal/application/indexing-usecase/process.go` - Main orchestration
- `backend/internal/application/indexing-usecase/document-indexer.go` - File processing

### Existing Files to Modify
- `backend/internal/application/document-usecase/upload.go` - Wire dependencies
- `backend/internal/domain/document/repository.go` - Update interface if needed

## Implementation Steps

### 1. Indexing Use Case
```go
// internal/application/indexing-usecase/process.go
package indexing

type IndexingUseCase struct {
    docRepo     domain.DocumentRepository
    chunkRepo   domain.ChunkRepository
    parser      *fileparser.ParserFactory
    chunker     *chunker.Splitter
    embedding   embedding.EmbeddingClient
}

func NewIndexingUseCase(
    docRepo domain.DocumentRepository,
    chunkRepo domain.ChunkRepository,
    parser *fileparser.ParserFactory,
    chunker *chunker.Splitter,
    embedding embedding.EmbeddingClient,
) *IndexingUseCase {
    return &IndexingUseCase{
        docRepo:   docRepo,
        chunkRepo: chunkRepo,
        parser:    parser,
        chunker:   chunker,
        embedding: embedding,
    }
}

// ProcessDocument handles the full indexing pipeline for a document.
func (uc *IndexingUseCase) ProcessDocument(ctx context.Context, docID uuid.UUID) error {
    // 1. Load document
    doc, err := uc.docRepo.GetByID(ctx, docID)
    if err != nil {
        return fmt.Errorf("load document: %w", err)
    }

    // 2. Update status to chunking
    doc.Status = "chunking"
    if err := uc.docRepo.Update(ctx, doc); err != nil {
        return fmt.Errorf("update status: %w", err)
    }

    // 3. Parse document
    p := uc.parser.Get(doc.FileType)
    if p == nil {
        return uc.fail(ctx, doc, "unsupported file type: "+doc.FileType)
    }

    extractionResults, err := p.Extract(doc.FilePath)
    if err != nil {
        return uc.fail(ctx, doc, "parse failed: "+err.Error())
    }

    // 4. Chunk extraction results
    var allChunks []chunker.Chunk
    for _, result := range extractionResults {
        chunks := uc.chunker.Split(result.Content, result.PageLabel)
        allChunks = append(allChunks, chunks...)
    }

    if len(allChunks) == 0 {
        return uc.fail(ctx, doc, "no content extracted")
    }

    // Update chunk count
    doc.ChunkCount = len(allChunks)
    if err := uc.docRepo.Update(ctx, doc); err != nil {
        return fmt.Errorf("update chunk count: %w", err)
    }

    // 5. Generate embeddings in batches
    texts := make([]string, len(allChunks))
    for i, ch := range allChunks {
        texts[i] = ch.Content
    }

    embeddings, err := uc.embedding.EmbedBatch(ctx, texts)
    if err != nil {
        return uc.fail(ctx, doc, "embedding failed: "+err.Error())
    }

    // 6. Save chunks to database
    for i, ch := range allChunks {
        chunk := &domain.Chunk{
            ID:         uuid.New(),
            DocumentID: doc.ID,
            ChapterID:  doc.ChapterID,
            Content:    ch.Content,
            PageLabel:  ch.PageLabel,
            ChunkIndex: i,
            Embedding:  embeddings[i],
            CreatedAt:  time.Now(),
        }
        if err := uc.chunkRepo.Create(ctx, chunk); err != nil {
            return uc.fail(ctx, doc, "save chunk failed: "+err.Error())
        }
    }

    // 7. Update status to indexed
    doc.Status = "indexed"
    doc.EmbeddingCount = len(embeddings)
    now := time.Now()
    doc.IndexedAt = &now
    if err := uc.docRepo.Update(ctx, doc); err != nil {
        return fmt.Errorf("update indexed status: %w", err)
    }

    return nil
}

func (uc *IndexingUseCase) fail(ctx context.Context, doc *domain.Document, msg string) error {
    doc.Status = "error"
    doc.ErrorMessage = &msg
    uc.docRepo.Update(ctx, doc)
    return fmt.Errorf("indexing failed: %s", msg)
}
```

### 2. Upload Use Case (updated)
```go
// internal/application/document-usecase/upload.go
type UploadDocumentUseCase struct {
    docRepo    domain.DocumentRepository
    fileStorage FileStorage
    indexer    *IndexingUseCase // for background processing
}

func (uc *UploadDocumentUseCase) Execute(
    ctx context.Context,
    userID uuid.UUID,
    req *dto.UploadDocumentRequest,
    originalFilename string,
    fileReader io.Reader,
    fileExt string,
) (*dto.UploadResponse, error) {
    // 1. Validate course exists (optional - could be FK)

    // 2. Generate UUID for file
    fileUUID := uuid.New().String()

    // 3. Save file to disk
    storagePath, err := uc.fileStorage.Save(req.CourseID, fileUUID, fileExt, fileReader)
    if err != nil {
        return nil, fmt.Errorf("save file: %w", err)
    }

    // 4. Create document record
    doc := &domain.Document{
        ID:         uuid.New(),
        UserID:     userID,
        CourseID:   mustParseUUID(req.CourseID),
        ChapterID:  parseOptionalUUID(req.ChapterID),
        FileName:   originalFilename,
        FileType:   fileExt,
        FilePath:   storagePath,
        Status:     "uploading",
        ChunkCount: 0,
        UploadedAt: time.Now(),
    }
    if err := uc.docRepo.Create(ctx, doc); err != nil {
        return nil, fmt.Errorf("create document: %w", err)
    }

    // 5. Enqueue background indexing
    // (Implementation depends on job queue - could be channel, database queue, or external worker)
    go func() {
        bgCtx := context.Background()
        if err := uc.indexer.ProcessDocument(bgCtx, doc.ID); err != nil {
            // Log error - document status already set to "error" by indexer
            log.Printf("indexing error for doc %s: %v", doc.ID, err)
        }
    }()

    return &dto.UploadResponse{
        DocumentID: doc.ID,
        Status:     doc.Status,
        FileName:   originalFilename,
    }, nil
}
```

## Chunk Repository Interface
```go
// internal/domain/chunk/repository.go
type ChunkRepository interface {
    Create(ctx context.Context, chunk *Chunk) error
    CreateBatch(ctx context.Context, chunks []*Chunk) error
    GetByDocumentID(ctx context.Context, docID uuid.UUID) ([]*Chunk, error)
    Search(ctx context.Context, courseID uuid.UUID, queryVector []float32, topK int) ([]*Chunk, error)
}
```

## Success Criteria

- [ ] Document status transitions: uploading → chunking → indexed (or error)
- [ ] Text correctly extracted from PDF/DOCX/PPTX/TXT/MD
- [ ] Chunks sized ~500 tokens with overlap
- [ ] Embeddings stored as 768-dim vectors in pgvector
- [ ] Progress tracked via chunk_count and embedding_count
- [ ] Background processing doesn't block HTTP response
- [ ] Failed indexing sets status to "error" with message

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Large document OOM | Batch processing, chunk-by-chunk save |
| Embedding API failure | Retry with backoff, status = error on final failure |
| Partial save | Each chunk save is independent - resume capability |
| Background goroutine lifetime | Use context with timeout |

## Next Steps

→ Phase 06: RAG Retrieval (Search)