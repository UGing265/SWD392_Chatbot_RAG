package fileparser

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// TextParser extracts text content from plain text and markdown files.
// It reads the entire file and returns it as a single chunk with the filename as page label.
type TextParser struct{}

// NewTextParser creates a new Text parser.
func NewTextParser() *TextParser {
	return &TextParser{}
}

// Extract reads the text file at the given path and returns its content as a single chunk.
// The page label is set to the filename (without path) for reference.
func (p *TextParser) Extract(path string) ([]ExtractionResult, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read text file: %w", err)
	}

	text := string(content)
	if len(strings.TrimSpace(text)) == 0 {
		return nil, fmt.Errorf("no text content found in file")
	}

	// Use filename as page label for traceability
	filename := filepath.Base(path)

	return []ExtractionResult{
		{
			Content:   text,
			PageLabel: filename,
		},
	}, nil
}

// SupportedExtensions returns the supported file extensions for text files.
func (p *TextParser) SupportedExtensions() []string {
	return []string{".txt", ".md"}
}
