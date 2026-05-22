package indexing

import (
	"context"
	"errors"
	"os"
	"strings"
	"testing"
	"time"

	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"
	"swd392-chatbot-rag/internal/infrastructure/fileparser"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockDocumentRepository struct {
	docs       map[uuid.UUID]*document.Document
	updateErr  error
	findErr    error
}

func newMockDocRepo() *mockDocumentRepository {
	return &mockDocumentRepository{
		docs: make(map[uuid.UUID]*document.Document),
	}
}

func (r *mockDocumentRepository) Create(doc *document.Document) error {
	r.docs[doc.ID] = doc
	return nil
}

func (r *mockDocumentRepository) FindByID(id uuid.UUID) (*document.Document, error) {
	if r.findErr != nil {
		return nil, r.findErr
	}
	doc, ok := r.docs[id]
	if !ok {
		return nil, nil
	}
	return doc, nil
}

func (r *mockDocumentRepository) FindByUserID(userID uuid.UUID) ([]*document.Document, error) {
	return nil, nil
}

func (r *mockDocumentRepository) FindByCourseID(courseID uuid.UUID) ([]*document.Document, error) {
	return nil, nil
}

func (r *mockDocumentRepository) Update(doc *document.Document) error {
	if r.updateErr != nil {
		return r.updateErr
	}
	r.docs[doc.ID] = doc
	return nil
}

func (r *mockDocumentRepository) Delete(id uuid.UUID) error {
	delete(r.docs, id)
	return nil
}

type mockChunkRepository struct {
	chunks     []*chunk.Chunk
	createErr  error
	deleteErr  error
}

func (r *mockChunkRepository) Create(ctx context.Context, ch *chunk.Chunk) error {
	if r.createErr != nil {
		return r.createErr
	}
	r.chunks = append(r.chunks, ch)
	return nil
}

func (r *mockChunkRepository) CreateBatch(ctx context.Context, chunks []*chunk.Chunk) error {
	if r.createErr != nil {
		return r.createErr
	}
	r.chunks = append(r.chunks, chunks...)
	return nil
}

func (r *mockChunkRepository) FindByDocumentID(ctx context.Context, docID uuid.UUID) ([]*chunk.Chunk, error) {
	var result []*chunk.Chunk
	for _, ch := range r.chunks {
		if ch.DocumentID == docID {
			result = append(result, ch)
		}
	}
	return result, nil
}

func (r *mockChunkRepository) DeleteByDocumentID(ctx context.Context, docID uuid.UUID) error {
	if r.deleteErr != nil {
		return r.deleteErr
	}
	var filtered []*chunk.Chunk
	for _, ch := range r.chunks {
		if ch.DocumentID != docID {
			filtered = append(filtered, ch)
		}
	}
	r.chunks = filtered
	return nil
}

type mockParser struct {
	extractions []string
	pageLabels  []string
	err        error
}

func (p *mockParser) Extract(path string) ([]fileparser.ExtractionResult, error) {
	if p.err != nil {
		return nil, p.err
	}
	results := make([]fileparser.ExtractionResult, len(p.extractions))
	for i := range p.extractions {
		label := ""
		if i < len(p.pageLabels) {
			label = p.pageLabels[i]
		}
		results[i] = fileparser.ExtractionResult{
			Content:   p.extractions[i],
			PageLabel: label,
		}
	}
	return results, nil
}

func (p *mockParser) SupportedExtensions() []string {
	return []string{".pdf", ".docx"}
}

type mockEmbeddingClient struct {
	embeddings [][]float32
	err       error
}

func (c *mockEmbeddingClient) Embed(ctx context.Context, text string) ([]float32, error) {
	if c.err != nil {
		return nil, c.err
	}
	if len(c.embeddings) > 0 {
		return c.embeddings[0], nil
	}
	return make([]float32, 768), nil
}

func (c *mockEmbeddingClient) EmbedBatch(ctx context.Context, texts []string) ([][]float32, error) {
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

func TestIndexingUseCase_ProcessDocument_Success(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{}
	parser := fileparser.NewParserFactory()

	embedClient := &mockEmbeddingClient{
		embeddings: make([][]float32, 100),
	}
	for i := range embedClient.embeddings {
		embedClient.embeddings[i] = make([]float32, 768)
		for j := range embedClient.embeddings[i] {
			embedClient.embeddings[i][j] = float32(i) * 0.01
		}
	}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	// Use actual temp file with sufficient content for chunking
	tmpDir := t.TempDir()
	tmpFile := tmpDir + "/test.txt"
	// Generate content that exceeds 500 tokens (MinChunkSize requirement)
	longContent := strings.Repeat("This is a test sentence that provides some content for chunking. ", 50)
	err := os.WriteFile(tmpFile, []byte(longContent), 0644)
	require.NoError(t, err)

	doc := &document.Document{
		ID:       uuid.New(),
		UserID:   uuid.New(),
		CourseID: uuid.New(),
		FilePath: tmpFile,
		FileType: "txt",
		Status:   document.StatusUploading,
	}
	docRepo.docs[doc.ID] = doc

	err = uc.ProcessDocument(context.Background(), doc.ID)
	require.NoError(t, err)

	updatedDoc := docRepo.docs[doc.ID]
	assert.Equal(t, document.StatusIndexed, updatedDoc.Status)
	assert.NotNil(t, updatedDoc.IndexedAt)
}

func TestIndexingUseCase_ProcessDocument_DocumentNotFound(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{}
	parser := fileparser.NewParserFactory()
	embedClient := &mockEmbeddingClient{}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	err := uc.ProcessDocument(context.Background(), uuid.New())
	assert.ErrorIs(t, err, ErrDocumentNotFound)
}

func TestIndexingUseCase_ProcessDocument_UpdateError(t *testing.T) {
	docRepo := newMockDocRepo()
	docRepo.updateErr = errors.New("db update error")

	chunkRepo := &mockChunkRepository{}
	parser := fileparser.NewParserFactory()
	embedClient := &mockEmbeddingClient{}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	doc := &document.Document{
		ID:       uuid.New(),
		UserID:   uuid.New(),
		CourseID: uuid.New(),
		FilePath: "/test/path.pdf",
		FileType: "pdf",
		Status:   document.StatusUploading,
	}
	docRepo.docs[doc.ID] = doc

	err := uc.ProcessDocument(context.Background(), doc.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "db update error")
}

func TestIndexingUseCase_ProcessDocument_ParserError(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{}
	parser := fileparser.NewParserFactory()
	embedClient := &mockEmbeddingClient{}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	doc := &document.Document{
		ID:       uuid.New(),
		UserID:   uuid.New(),
		CourseID: uuid.New(),
		FilePath: "/test/path.nonexistent",
		FileType: "nonexistent",
		Status:   document.StatusUploading,
	}
	docRepo.docs[doc.ID] = doc

	err := uc.ProcessDocument(context.Background(), doc.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "no parser found")
}

func TestIndexingUseCase_ProcessDocument_EmbeddingError(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{}
	embedClient := &mockEmbeddingClient{
		err: errors.New("embedding API error"),
	}

	parser := fileparser.NewParserFactory()

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	// Use actual temp file with sufficient content for chunking
	tmpDir := t.TempDir()
	tmpFile := tmpDir + "/test.txt"
	// Generate content that exceeds 500 tokens (MinChunkSize requirement)
	longContent := strings.Repeat("This is a test sentence that provides some content for chunking. ", 50)
	err := os.WriteFile(tmpFile, []byte(longContent), 0644)
	require.NoError(t, err)

	doc := &document.Document{
		ID:       uuid.New(),
		UserID:   uuid.New(),
		CourseID: uuid.New(),
		FilePath: tmpFile,
		FileType: "txt",
		Status:   document.StatusUploading,
	}
	docRepo.docs[doc.ID] = doc

	err = uc.ProcessDocument(context.Background(), doc.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "embedding")
}

func TestIndexingUseCase_ChunkExtractions(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{}
	parser := fileparser.NewParserFactory()
	embedClient := &mockEmbeddingClient{
		embeddings: make([][]float32, 100),
	}
	for i := range embedClient.embeddings {
		embedClient.embeddings[i] = make([]float32, 768)
	}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	// Generate content that exceeds 500 tokens (MinChunkSize requirement)
	longContent := strings.Repeat("This is a test sentence that provides some content for chunking. ", 50)
	extractions := []fileparser.ExtractionResult{
		{Content: longContent, PageLabel: "p.1"},
		{Content: longContent, PageLabel: "p.2"},
	}

	chunks := uc.chunkExtractions(extractions, uuid.New())
	assert.NotEmpty(t, chunks)
	for _, ch := range chunks {
		assert.NotEmpty(t, ch.Content)
	}
}

func TestIndexingUseCase_generateEmbeddings(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{}
	parser := fileparser.NewParserFactory()
	embedClient := &mockEmbeddingClient{
		embeddings: make([][]float32, 10),
	}
	for i := range embedClient.embeddings {
		embedClient.embeddings[i] = make([]float32, 768)
		for j := range embedClient.embeddings[i] {
			embedClient.embeddings[i][j] = float32(j) * 0.01
		}
	}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	chunks := []*chunk.Chunk{
		{ID: uuid.New(), Content: "Test content 1", ChunkIndex: 0},
		{ID: uuid.New(), Content: "Test content 2", ChunkIndex: 1},
	}

	embeddings, err := uc.generateEmbeddings(context.Background(), chunks)
	require.NoError(t, err)
	assert.Len(t, embeddings, 2)
	assert.Len(t, embeddings[0], 768)
}

func TestIndexingUseCase_failDoc(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{}
	parser := fileparser.NewParserFactory()
	embedClient := &mockEmbeddingClient{}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	doc := &document.Document{
		ID:       uuid.New(),
		UserID:   uuid.New(),
		CourseID: uuid.New(),
		Status:   document.StatusChunking,
	}
	docRepo.docs[doc.ID] = doc

	testErr := errors.New("test error")
	err := uc.failDoc(doc, testErr)
	assert.Error(t, err)

	assert.Equal(t, document.StatusError, doc.Status)
	assert.NotNil(t, doc.ErrorMessage)
	assert.Equal(t, testErr.Error(), *doc.ErrorMessage)
}

func TestIndexingUseCase_saveChunks(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{}
	parser := fileparser.NewParserFactory()
	embedClient := &mockEmbeddingClient{}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	chunks := make([]*chunk.Chunk, 5)
	for i := range chunks {
		chunks[i] = &chunk.Chunk{
			ID:         uuid.New(),
			DocumentID: uuid.New(),
			Content:    "Test content",
			ChunkIndex: i,
			CreatedAt:  time.Now(),
		}
	}

	err := uc.saveChunks(context.Background(), chunks)
	require.NoError(t, err)
	assert.Len(t, chunkRepo.chunks, 5)
}

func TestIndexingUseCase_saveChunks_Error(t *testing.T) {
	docRepo := newMockDocRepo()
	chunkRepo := &mockChunkRepository{
		createErr: errors.New("save failed"),
	}
	parser := fileparser.NewParserFactory()
	embedClient := &mockEmbeddingClient{}

	uc := NewIndexingUseCase(docRepo, chunkRepo, parser, embedClient)

	chunks := []*chunk.Chunk{
		{ID: uuid.New(), Content: "Test content"},
	}

	err := uc.saveChunks(context.Background(), chunks)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "save failed")
}