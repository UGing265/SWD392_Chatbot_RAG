package document_usecase

import (
	"context"

	"swd392-chatbot-rag/internal/domain/chunk"

	"github.com/google/uuid"
)

type GetChunksUseCase struct {
	chunkRepo chunk.ChunkRepository
}

func NewGetChunksUseCase(chunkRepo chunk.ChunkRepository) *GetChunksUseCase {
	return &GetChunksUseCase{chunkRepo: chunkRepo}
}

func (uc *GetChunksUseCase) Execute(ctx context.Context, docID uuid.UUID) ([]*chunk.Chunk, error) {
	return uc.chunkRepo.FindByDocumentID(ctx, docID)
}