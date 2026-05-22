package chunker

import (
	"crypto/sha256"
	"fmt"
	"strings"
)

func contentHash(text string) string {
	normalized := strings.ToLower(strings.TrimSpace(text))
	h := sha256.Sum256([]byte(normalized))
	return fmt.Sprintf("%x", h)
}

func (s *Splitter) makeChunk(content string, startIdx int, pageLabel string) Chunk {
	content = strings.TrimSpace(content)
	endIdx := startIdx + len(content)
	return Chunk{
		Content:   content,
		PageLabel: pageLabel,
		StartIdx:  startIdx,
		EndIdx:    endIdx,
		Hash:      contentHash(content),
	}
}