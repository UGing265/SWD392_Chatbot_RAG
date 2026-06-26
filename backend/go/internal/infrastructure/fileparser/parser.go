package fileparser

import "strings"

// ExtractionResult represents the result of extracting text from a file.
// Each result corresponds to a page, slide, or section of the document.
type ExtractionResult struct {
	Content   string // The extracted text content
	PageLabel string // Page/slide identifier for citations (e.g., "p. 78" or "Slide 12")
}

// Parser defines the interface for file content extraction.
// Implementations must be safe for concurrent use.
type Parser interface {
	// Extract reads the file at the given path and extracts text content.
	// Returns a slice of ExtractionResult, one per page/slide/section.
	// Returns an error if extraction fails.
	Extract(path string) ([]ExtractionResult, error)

	// SupportedExtensions returns the file extensions this parser supports.
	// Extensions should include the leading dot (e.g., ".pdf", ".docx").
	SupportedExtensions() []string
}

// ParserFactory manages parser instances for different file types.
type ParserFactory struct {
	parsers map[string]Parser
}

// NewParserFactory creates a new parser factory with all built-in parsers registered.
func NewParserFactory() *ParserFactory {
	return &ParserFactory{
		parsers: map[string]Parser{
			".pdf":  &PDFParser{},
			".docx": &DOCXParser{},
			".pptx": &PPTXParser{},
			".txt":  &TextParser{},
			".md":   &TextParser{},
		},
	}
}

// Get returns the parser for the given extension.
// Returns nil if no parser is registered for the extension.
// The extension should include the leading dot (e.g., ".pdf").
// Comparison is case-insensitive.
func (f *ParserFactory) Get(ext string) Parser {
	ext = strings.ToLower(ext)
	if p, ok := f.parsers[ext]; ok {
		return p
	}
	return nil
}
