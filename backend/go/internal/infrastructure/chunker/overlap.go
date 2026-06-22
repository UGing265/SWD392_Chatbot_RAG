package chunker

import "strings"

// applyOverlap inserts overlap chunks between consecutive chunks.
// Each overlap chunk contains the end portion of the previous chunk.
func (s *Splitter) applyOverlap(chunks []Chunk) []Chunk {
	if len(chunks) <= 1 || s.chunkOverlap <= 0 {
		return chunks
	}

	var result []Chunk
	for i, chunk := range chunks {
		result = append(result, chunk)

		if i < len(chunks)-1 {
			overlapChars := s.chunkOverlap * 4

			// Get last portion of current chunk as overlap
			contentLen := len(chunk.Content)
			overlapStart := 0
			if contentLen > overlapChars {
				overlapStart = contentLen - overlapChars
			}
			overlapText := chunk.Content[overlapStart:]

			// Create overlap chunk if non-empty
			trimmedOverlap := strings.TrimSpace(overlapText)
			if trimmedOverlap != "" {
				overlapChunk := Chunk{
					Content:   trimmedOverlap,
					PageLabel: chunk.PageLabel,
					StartIdx:  chunk.StartIdx + overlapStart,
					EndIdx:    chunk.EndIdx,
					Hash:      contentHash(overlapText),
				}
				result = append(result, overlapChunk)
			}
		}
	}

	return result
}

// getOverlapText extracts the overlap portion from text.
// Tries to find a good break point at a separator first, then word boundary.
func (s *Splitter) getOverlapText(text string) string {
	overlapChars := s.chunkOverlap * 4
	textLen := len(text)

	if textLen <= overlapChars {
		return text
	}

	// Find a good break point (separator)
	searchText := text[textLen-overlapChars:]
	for _, sep := range s.separators[:len(s.separators)-1] {
		idx := strings.LastIndex(searchText, sep)
		if idx >= 0 {
			return text[textLen-overlapChars+idx+len(sep):]
		}
	}

	// Fall back to word boundary
	spaceIdx := strings.LastIndex(searchText, " ")
	if spaceIdx >= 0 {
		return text[textLen-overlapChars+spaceIdx+1:]
	}

	return text[textLen-overlapChars:]
}