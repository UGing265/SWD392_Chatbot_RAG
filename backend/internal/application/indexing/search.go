package indexing

import (
	"context"
	"errors"
	"fmt"

	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/infrastructure/embedding"

	"github.com/google/uuid"
)

var (
	ErrNoRelevantChunks = errors.New("no relevant chunks found for query")
)

const (
	DefaultTopK       = 5
	MinRelevanceScore = 0.3
)

type SearchResult struct {
	Chunk          *chunk.Chunk
	RelevanceScore float64
	FileName       string
}

type SearchUseCase struct {
	chunkRepo chunkSearcher
	docRepo   docFinder
	embedding embedding.EmbeddingClient
}

type chunkSearcher interface {
	Search(ctx context.Context, courseID uuid.UUID, queryVector []float32, topK int) ([]*chunk.ChunkWithScore, error)
}

type docFinder interface {
	FindByID(id uuid.UUID) (*docInfo, error)
}

type docInfo struct {
	ID       uuid.UUID
	FileName string
}

type SearchUseCaseDeps struct {
	ChunkRepo chunkSearcher
	DocRepo   docFinder
	Embedding embedding.EmbeddingClient
}

func NewSearchUseCase(deps SearchUseCaseDeps) *SearchUseCase {
	return &SearchUseCase{
		chunkRepo: deps.ChunkRepo,
		docRepo:   deps.DocRepo,
		embedding: deps.Embedding,
	}
}

func (uc *SearchUseCase) Search(ctx context.Context, courseID uuid.UUID, query string) ([]*SearchResult, error) {
	queryVector, err := uc.embedding.Embed(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("embed query: %w", err)
	}

	chunksWithScore, err := uc.chunkRepo.Search(ctx, courseID, queryVector, DefaultTopK)
	if err != nil {
		return nil, fmt.Errorf("vector search: %w", err)
	}

	if len(chunksWithScore) == 0 {
		return nil, ErrNoRelevantChunks
	}

	maxScore := chunksWithScore[0].RelevanceScore
	if maxScore < MinRelevanceScore {
		return nil, ErrNoRelevantChunks
	}

	var results []*SearchResult
	for _, cs := range chunksWithScore {
		if cs.RelevanceScore < MinRelevanceScore {
			continue
		}
		results = append(results, &SearchResult{
			Chunk:          cs.Chunk,
			RelevanceScore: cs.RelevanceScore,
		})
	}

	return results, nil
}

func (uc *SearchUseCase) SearchWithFileNames(ctx context.Context, courseID uuid.UUID, query string) ([]*SearchResult, error) {
	results, err := uc.Search(ctx, courseID, query)
	if err != nil {
		return nil, err
	}

	docIDs := make(map[uuid.UUID]bool)
	for _, r := range results {
		docIDs[r.Chunk.DocumentID] = true
	}

	docFiles := make(map[uuid.UUID]string)
	for docID := range docIDs {
		doc, err := uc.docRepo.FindByID(docID)
		if err == nil && doc != nil {
			docFiles[docID] = doc.FileName
		}
	}

	for _, r := range results {
		if name, ok := docFiles[r.Chunk.DocumentID]; ok {
			r.FileName = name
		}
	}

	return results, nil
}