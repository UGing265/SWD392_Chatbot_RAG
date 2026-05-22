# Phase 06: RAG Retrieval (Search)

## Context Links

- `../plan.md` - Plan overview
- `../research/pgvector-research.md` - pgvector patterns
- `Phase 04` - Gemini Embedding client

## Overview

- **Priority:** High
- **Current status:** Pending
- **Brief description:** Semantic search implementation: embed query → pgvector similarity search → return top chunks with scores.

## Architecture

```
[SendMessageUseCase]
    │
    ├── Save user message (role=user)
    │
    ├── [RAG Retrieval]
    │   │
    │   ├── Embed query text → query_vector (768-dim)
    │   │
    │   ├── Semantic search in pgvector:
    │   │   SELECT id, content, page_label, 1-(embedding<=>$1) as score
    │   │   FROM chunks
    │   │   WHERE course_id = $2
    │   │   ORDER BY embedding <=> $1
    │   │   LIMIT 5
    │   │
    │   ├── Check relevance threshold (0.3-0.5)
    │   │   └── If max_score < threshold → return "out of scope"
    │   │
    │   └── Return top chunks with relevance scores
    │
    ├── Build prompt with context chunks
    ├── Call Gemini LLM → get answer
    ├── Save bot message with citations
    └── Return response
```

## Requirements

### Functional
- Embed user query → 768-dim vector
- Search pgvector with cosine distance
- Filter by course_id (and optionally chapter_id)
- Return top 5-10 chunks with relevance scores
- Threshold-based out-of-scope detection

### Non-Functional
- Index scan optimized via IVF index
- Sub-100ms retrieval target

## Related Code Files

### New Files to Create
- `backend/internal/application/indexing-usecase/search.go` - RAG retrieval logic

### Existing Files to Modify
- `backend/internal/application/chat-usecase/send-message.go` - Integrate RAG

## Implementation Steps

### 1. Search Use Case
```go
// internal/application/indexing-usecase/search.go
package indexing

import (
    "context"
    "fmt"

    "github.com/google/uuid"
    "github.com/pgvector/pgvector-go"
)

const (
    DefaultTopK       = 5
    MinRelevanceScore = 0.3
)

type SearchResult struct {
    Chunk         *domain.Chunk
    RelevanceScore float64
    FileName      string
}

type SearchUseCase struct {
    chunkRepo   domain.ChunkRepository
    embedding   embedding.EmbeddingClient
}

func NewSearchUseCase(
    chunkRepo domain.ChunkRepository,
    embedding embedding.EmbeddingClient,
) *SearchUseCase {
    return &SearchUseCase{
        chunkRepo: chunkRepo,
        embedding: embedding,
    }
}

// Search retrieves relevant chunks for a query.
func (uc *SearchUseCase) Search(ctx context.Context, courseID uuid.UUID, query string) ([]*SearchResult, error) {
    // 1. Embed query
    queryVector, err := uc.embedding.Embed(ctx, query)
    if err != nil {
        return nil, fmt.Errorf("embed query: %w", err)
    }

    // 2. Search pgvector
    chunks, err := uc.chunkRepo.Search(ctx, courseID, queryVector, DefaultTopK)
    if err != nil {
        return nil, fmt.Errorf("vector search: %w", err)
    }

    // 3. Calculate relevance scores and filter
    var results []*SearchResult
    for _, chunk := range chunks {
        // Cosine similarity = 1 - cosine_distance
        // pgvector returns distance, so similarity = 1 - distance
        // We stored distance in the query, need to recalculate or adjust
        score := 1.0 // placeholder - actual score from query

        if score < MinRelevanceScore {
            continue
        }

        results = append(results, &SearchResult{
            Chunk:         chunk,
            RelevanceScore: score,
            FileName:      "", // loaded from document join
        })
    }

    return results, nil
}
```

### 2. Chunk Repository Search
```go
// internal/infrastructure/repository/postgres/chunk-repo.go
package postgres

func (r *ChunkRepository) Search(ctx context.Context, courseID uuid.UUID, queryVector []float32, topK int) ([]*domain.Chunk, error) {
    sql := `
        SELECT
            c.id, c.document_id, c.chapter_id, c.content,
            c.page_label, c.chunk_index, c.embedding, c.created_at,
            c.embedding <=> $1 AS distance
        FROM chunks c
        INNER JOIN documents d ON c.document_id = d.id
        WHERE d.course_id = $2
        ORDER BY c.embedding <=> $1
        LIMIT $3
    `

    rows, err := r.db.Pool.Query(ctx, sql, pgvector.NewVector(queryVector), courseID, topK)
    if err != nil {
        return nil, fmt.Errorf("search query: %w", err)
    }
    defer rows.Close()

    var chunks []*domain.Chunk
    for rows.Next() {
        var c domain.Chunk
        var distance float64
        if err := rows.Scan(
            &c.ID, &c.DocumentID, &c.ChapterID, &c.Content,
            &c.PageLabel, &c.ChunkIndex, &c.Embedding, &c.CreatedAt,
            &distance,
        ); err != nil {
            return nil, fmt.Errorf("scan row: %w", err)
        }
        chunks = append(chunks, &c)
    }

    return chunks, rows.Err()
}
```

### 3. Send Message Use Case (RAG integration)
```go
// internal/application/chat-usecase/send-message.go
package chat

type SendMessageUseCase struct {
    sessionRepo   domain.ChatSessionRepository
    messageRepo   domain.MessageRepository
    citationRepo  domain.MessageCitationRepository
    searchUC      *indexing.SearchUseCase
    llmClient     llm.LLMClient
}

func (uc *SendMessageUseCase) Execute(ctx context.Context, sessionID, userID uuid.UUID, content string) (*dto.SendMessageResponse, error) {
    // 1. Validate session belongs to user

    // 2. Save user message
    userMsg := &domain.Message{
        ID:        uuid.New(),
        SessionID: sessionID,
        Role:      "user",
        Content:   content,
        CreatedAt: time.Now(),
    }
    if err := uc.messageRepo.Create(ctx, userMsg); err != nil {
        return nil, err
    }

    // 3. RAG: Search for relevant chunks
    session, _ := uc.sessionRepo.GetByID(ctx, sessionID)
    searchResults, err := uc.searchUC.Search(ctx, session.CourseID, content)
    if err != nil {
        return nil, fmt.Errorf("search: %w", err)
    }

    // 4. Check if out of scope
    if len(searchResults) == 0 {
        botMsg := &domain.Message{
            ID:         uuid.New(),
            SessionID:  sessionID,
            Role:       "bot",
            Content:    "Không tìm thấy thông tin trong tài liệu.",
            OutOfScope: true,
            CreatedAt:  time.Now(),
        }
        uc.messageRepo.Create(ctx, botMsg)
        return &dto.SendMessageResponse{MessageID: botMsg.ID, OutOfScope: true}, nil
    }

    // 5. Build context from chunks
    context := buildContext(searchResults)

    // 6. Call LLM with context
    answer, err := uc.llmClient.Generate(ctx, content, context)
    if err != nil {
        return nil, fmt.Errorf("llm: %w", err)
    }

    // 7. Save bot message
    botMsg := &domain.Message{
        ID:         uuid.New(),
        SessionID:  sessionID,
        Role:       "bot",
        Content:    answer,
        CreatedAt:  time.Now(),
    }
    if err := uc.messageRepo.Create(ctx, botMsg); err != nil {
        return nil, err
    }

    // 8. Save citations
    for _, result := range searchResults {
        citation := &domain.MessageCitation{
            ID:              uuid.New(),
            MessageID:       botMsg.ID,
            ChunkID:         result.Chunk.ID,
            RelevanceScore:  result.RelevanceScore,
            Excerpt:         truncate(result.Chunk.Content, 200),
        }
        uc.citationRepo.Create(ctx, citation)
    }

    return &dto.SendMessageResponse{
        MessageID:  botMsg.ID,
        Content:   answer,
        Citations: buildCitations(searchResults),
    }, nil
}

func buildContext(results []*indexing.SearchResult) string {
    var sb strings.Builder
    sb.WriteString("Context from documents:\n\n")
    for i, r := range results {
        sb.WriteString(fmt.Sprintf("[%d] (%s): %s\n\n",
            i+1, r.Chunk.PageLabel, r.Chunk.Content))
    }
    return sb.String()
}
```

## SQL for pgvector Search (Complete)
```sql
-- Create index first time
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Query for semantic search
SELECT
    c.id,
    c.content,
    c.page_label,
    d.file_name,
    1 - (c.embedding <=> $1) AS relevance_score
FROM chunks c
INNER JOIN documents d ON c.document_id = d.id
WHERE d.course_id = $2
    AND 1 - (c.embedding <=> $1) > 0.3
ORDER BY c.embedding <=> $1
LIMIT 5;
```

## Success Criteria

- [ ] Query embedding generated via Gemini Embedding 2
- [ ] Semantic search returns top 5 chunks by cosine similarity
- [ ] Relevance score calculated correctly
- [ ] Out-of-scope detected when no chunks above threshold
- [ ] Citations saved with chunk references
- [ ] Response includes citations for UI display

## Next Steps

→ Phase 07: API Integration & Health Check