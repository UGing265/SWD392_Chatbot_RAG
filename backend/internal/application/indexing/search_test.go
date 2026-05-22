package indexing

import (
	"context"
	"errors"
	"testing"
	"time"

	"swd392-chatbot-rag/internal/domain/chunk"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockChunkSearcher struct {
	results []*chunk.ChunkWithScore
	err     error
}

func (m *mockChunkSearcher) Search(ctx context.Context, courseID uuid.UUID, queryVector []float32, topK int) ([]*chunk.ChunkWithScore, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.results, nil
}

type mockDocFinder struct {
	docs     map[uuid.UUID]*docInfo
	findErr  error
}

func newMockDocFinder() *mockDocFinder {
	return &mockDocFinder{
		docs: make(map[uuid.UUID]*docInfo),
	}
}

func (m *mockDocFinder) FindByID(id uuid.UUID) (*docInfo, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	doc, ok := m.docs[id]
	if !ok {
		return nil, nil
	}
	return doc, nil
}

func TestSearchUseCase_Search_Success(t *testing.T) {
	courseID := uuid.New()
	docID := uuid.New()

	chunkRepo := &mockChunkSearcher{
		results: []*chunk.ChunkWithScore{
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					DocumentID: docID,
					Content:    "Test content about Go programming",
					PageLabel:  "p.1",
					ChunkIndex: 0,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.85,
			},
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					DocumentID: docID,
					Content:    "More content about Go",
					PageLabel:  "p.2",
					ChunkIndex: 1,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.72,
			},
		},
	}

	docRepo := newMockDocFinder()
	docRepo.docs[docID] = &docInfo{ID: docID, FileName: "test.pdf"}

	embedClient := &mockEmbeddingClientForSearch{
		embeddings: [][]float32{make([]float32, 768)},
	}

	deps := SearchUseCaseDeps{
		ChunkRepo: chunkRepo,
		DocRepo:   docRepo,
		Embedding: embedClient,
	}

	uc := NewSearchUseCase(deps)

	results, err := uc.Search(context.Background(), courseID, "Tell me about Go")
	require.NoError(t, err)
	assert.Len(t, results, 2)
	assert.Greater(t, results[0].RelevanceScore, MinRelevanceScore)
}

func TestSearchUseCase_Search_NoResults(t *testing.T) {
	courseID := uuid.New()

	chunkRepo := &mockChunkSearcher{
		results: []*chunk.ChunkWithScore{},
	}

	docRepo := newMockDocFinder()
	embedClient := &mockEmbeddingClientForSearch{}

	deps := SearchUseCaseDeps{
		ChunkRepo: chunkRepo,
		DocRepo:   docRepo,
		Embedding: embedClient,
	}

	uc := NewSearchUseCase(deps)

	results, err := uc.Search(context.Background(), courseID, "Tell me about Go")
	assert.ErrorIs(t, err, ErrNoRelevantChunks)
	assert.Nil(t, results)
}

func TestSearchUseCase_Search_BelowThreshold(t *testing.T) {
	courseID := uuid.New()

	chunkRepo := &mockChunkSearcher{
		results: []*chunk.ChunkWithScore{
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					Content:    "Irrelevant content",
					PageLabel:  "p.1",
					ChunkIndex: 0,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.2, // below MinRelevanceScore
			},
		},
	}

	docRepo := newMockDocFinder()
	embedClient := &mockEmbeddingClientForSearch{}

	deps := SearchUseCaseDeps{
		ChunkRepo: chunkRepo,
		DocRepo:   docRepo,
		Embedding: embedClient,
	}

	uc := NewSearchUseCase(deps)

	results, err := uc.Search(context.Background(), courseID, "Tell me about Go")
	assert.ErrorIs(t, err, ErrNoRelevantChunks)
	assert.Nil(t, results)
}

func TestSearchUseCase_Search_EmbeddingError(t *testing.T) {
	courseID := uuid.New()

	chunkRepo := &mockChunkSearcher{}

	docRepo := newMockDocFinder()
	embedClient := &mockEmbeddingClientForSearch{
		err: errors.New("embedding API error"),
	}

	deps := SearchUseCaseDeps{
		ChunkRepo: chunkRepo,
		DocRepo:   docRepo,
		Embedding: embedClient,
	}

	uc := NewSearchUseCase(deps)

	results, err := uc.Search(context.Background(), courseID, "Tell me about Go")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "embed query")
	assert.Nil(t, results)
}

func TestSearchUseCase_Search_VectorSearchError(t *testing.T) {
	courseID := uuid.New()

	chunkRepo := &mockChunkSearcher{
		err: errors.New("database error"),
	}

	docRepo := newMockDocFinder()
	embedClient := &mockEmbeddingClientForSearch{
		embeddings: [][]float32{make([]float32, 768)},
	}

	deps := SearchUseCaseDeps{
		ChunkRepo: chunkRepo,
		DocRepo:   docRepo,
		Embedding: embedClient,
	}

	uc := NewSearchUseCase(deps)

	results, err := uc.Search(context.Background(), courseID, "Tell me about Go")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "vector search")
	assert.Nil(t, results)
}

func TestSearchUseCase_SearchWithFileNames_Success(t *testing.T) {
	courseID := uuid.New()
	docID1 := uuid.New()
	docID2 := uuid.New()

	chunkRepo := &mockChunkSearcher{
		results: []*chunk.ChunkWithScore{
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					DocumentID: docID1,
					Content:    "Content from doc1",
					PageLabel:  "p.1",
					ChunkIndex: 0,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.85,
			},
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					DocumentID: docID2,
					Content:    "Content from doc2",
					PageLabel:  "p.1",
					ChunkIndex: 0,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.72,
			},
		},
	}

	docRepo := newMockDocFinder()
	docRepo.docs[docID1] = &docInfo{ID: docID1, FileName: "document1.pdf"}
	docRepo.docs[docID2] = &docInfo{ID: docID2, FileName: "document2.docx"}

	embedClient := &mockEmbeddingClientForSearch{
		embeddings: [][]float32{make([]float32, 768)},
	}

	deps := SearchUseCaseDeps{
		ChunkRepo: chunkRepo,
		DocRepo:   docRepo,
		Embedding: embedClient,
	}

	uc := NewSearchUseCase(deps)

	results, err := uc.SearchWithFileNames(context.Background(), courseID, "Tell me about Go")
	require.NoError(t, err)
	assert.Len(t, results, 2)
	assert.Equal(t, "document1.pdf", results[0].FileName)
	assert.Equal(t, "document2.docx", results[1].FileName)
}

func TestSearchUseCase_SearchWithFileNames_DocNotFound(t *testing.T) {
	courseID := uuid.New()
	docID := uuid.New()

	chunkRepo := &mockChunkSearcher{
		results: []*chunk.ChunkWithScore{
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					DocumentID: docID,
					Content:    "Content without doc",
					PageLabel:  "p.1",
					ChunkIndex: 0,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.85,
			},
		},
	}

	docRepo := newMockDocFinder() // doc not found

	embedClient := &mockEmbeddingClientForSearch{
		embeddings: [][]float32{make([]float32, 768)},
	}

	deps := SearchUseCaseDeps{
		ChunkRepo: chunkRepo,
		DocRepo:   docRepo,
		Embedding: embedClient,
	}

	uc := NewSearchUseCase(deps)

	results, err := uc.SearchWithFileNames(context.Background(), courseID, "Tell me about Go")
	require.NoError(t, err)
	assert.Len(t, results, 1)
	assert.Equal(t, "", results[0].FileName) // empty when doc not found
}

func TestSearchUseCase_Search_AfterMaxScoreThreshold(t *testing.T) {
	courseID := uuid.New()
	docID := uuid.New()

	chunkRepo := &mockChunkSearcher{
		results: []*chunk.ChunkWithScore{
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					DocumentID: docID,
					Content:    "High relevance content",
					PageLabel:  "p.1",
					ChunkIndex: 0,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.6, // above threshold
			},
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					DocumentID: docID,
					Content:    "Low relevance content",
					PageLabel:  "p.2",
					ChunkIndex: 1,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.25, // below threshold
			},
			{
				Chunk: &chunk.Chunk{
					ID:         uuid.New(),
					DocumentID: docID,
					Content:    "Another low relevance",
					PageLabel:  "p.3",
					ChunkIndex: 2,
					CreatedAt:  time.Now(),
				},
				RelevanceScore: 0.15, // below threshold
			},
		},
	}

	docRepo := newMockDocFinder()
	embedClient := &mockEmbeddingClientForSearch{
		embeddings: [][]float32{make([]float32, 768)},
	}

	deps := SearchUseCaseDeps{
		ChunkRepo: chunkRepo,
		DocRepo:   docRepo,
		Embedding: embedClient,
	}

	uc := NewSearchUseCase(deps)

	results, err := uc.Search(context.Background(), courseID, "Tell me about Go")
	require.NoError(t, err)
	assert.Len(t, results, 1) // only the one above threshold
	assert.Greater(t, results[0].RelevanceScore, MinRelevanceScore)
}

type mockEmbeddingClientForSearch struct {
	embeddings [][]float32
	err        error
}

func (c *mockEmbeddingClientForSearch) Embed(ctx context.Context, text string) ([]float32, error) {
	if c.err != nil {
		return nil, c.err
	}
	if len(c.embeddings) > 0 {
		return c.embeddings[0], nil
	}
	return make([]float32, 768), nil
}

func (c *mockEmbeddingClientForSearch) EmbedBatch(ctx context.Context, texts []string) ([][]float32, error) {
	if c.err != nil {
		return nil, c.err
	}
	results := make([][]float32, len(texts))
	for i := range texts {
		if len(c.embeddings) > i {
			results[i] = c.embeddings[i]
		} else {
			results[i] = make([]float32, 768)
		}
	}
	return results, nil
}