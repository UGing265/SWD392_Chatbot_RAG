# Research: pgvector Similarity Search

## 1. pgvector Setup and Configuration

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 2. Vector Similarity Metrics

pgvector supports three distance operators:

| Metric | Operator | Index Ops | Use Case |
|--------|----------|-----------|----------|
| **L2 (Euclidean)** | `<->` | `vector_l2_ops` | Geometric similarity |
| **Negative Inner Product** | `<#>` | `vector_ip_ops` | Maximize dot product |
| **Cosine Distance** | `<=>` | `vector_cosine_ops` | Angle-based (recommended) |

**Recommendation:** Use `cosine distance (<=>)` with `vector_cosine_ops` - most common for semantic search.

## 3. SQL Patterns for Semantic Search

### Basic Similarity Search with Relevance Score
```sql
SELECT
    id,
    content,
    page_label,
    1 - (embedding <=> $1) AS relevance_score
FROM chunks
WHERE chapter_id = $2
ORDER BY embedding <=> $1
LIMIT 10;
```

### Course-Scoped with Document Join
```sql
SELECT
    c.id, c.content, c.page_label, d.file_name,
    1 - (c.embedding <=> $1) AS relevance_score
FROM chunks c
INNER JOIN documents d ON c.document_id = d.id
WHERE d.course_id = $2
ORDER BY c.embedding <=> $1
LIMIT 10;
```

### With Threshold
```sql
SELECT
    c.id, c.content, c.page_label,
    1 - (c.embedding <=> $1) AS relevance_score
FROM chunks c
INNER JOIN documents d ON c.document_id = d.id
WHERE d.course_id = $2
    AND 1 - (c.embedding <=> $1) > 0.3
ORDER BY c.embedding <=> $1
LIMIT 10;
```

## 4. Index Types

### IVF Index (Recommended for RAG)
```sql
CREATE INDEX idx_chunks_embedding
ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### HNSW Index (Higher recall, more memory)
```sql
CREATE INDEX idx_chunks_embedding_hnsw
ON chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

## 5. Go Implementation

```go
import "github.com/pgvector/pgvector-go"

type Chunk struct {
    ID         uuid.UUID     `db:"id"`
    Content    string        `db:"content"`
    PageLabel  string        `db:"page_label"`
    Embedding  pgvector.Vector `db:"embedding"`
}

// Search repository method
func (r *chunkRepository) Search(ctx context.Context, courseID uuid.UUID, queryVector []float32, topK int) ([]*Chunk, error) {
    const sql = `
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
        return nil, fmt.Errorf("search failed: %w", err)
    }
    defer rows.Close()

    var chunks []*Chunk
    for rows.Next() {
        var c Chunk
        var distance float64
        if err := rows.Scan(&c.ID, &c.DocumentID, &c.ChapterID, &c.Content, &c.PageLabel, &c.ChunkIndex, &c.Embedding, &c.CreatedAt, &distance); err != nil {
            return nil, fmt.Errorf("scan failed: %w", err)
        }
        chunks = append(chunks, &c)
    }

    return chunks, rows.Err()
}
```

## Key Findings

1. **Distance Metric:** Use cosine distance (`<=>`) with `vector_cosine_ops`
2. **Index Type:** IVF index is sufficient for RAG workloads
3. **Filtering:** Always filter before ordering for performance
4. **Threshold:** Recommended minimum relevance score 0.3-0.5 for RAG context quality
5. **TopK:** Return 5-10 chunks for most RAG use cases