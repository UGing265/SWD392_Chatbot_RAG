package fileparser

import (
	"fmt"
	"strings"

	"github.com/ledongthuc/pdf"
)

// PDFParser extracts text content from PDF files using ledongthuc/pdf (free, no license).
type PDFParser struct{}

// NewPDFParser creates a new PDF parser.
func NewPDFParser() *PDFParser {
	return &PDFParser{}
}

// Extract reads the PDF file at the given path and extracts text from each page.
// Returns a slice of ExtractionResult, one per page, with page labels like "p. 1".
func (p *PDFParser) Extract(path string) ([]ExtractionResult, error) {
	f, reader, err := pdf.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open PDF: %w", err)
	}
	defer f.Close()

	numPages := reader.NumPage()
	if numPages == 0 {
		return nil, fmt.Errorf("PDF has no pages")
	}

	results := make([]ExtractionResult, 0, numPages)

	for pageNum := 1; pageNum <= numPages; pageNum++ {
		page := reader.Page(pageNum)
		if page.V.IsNull() {
			continue
		}

		content, err := page.GetPlainText(nil)
		if err != nil {
			// Skip pages that fail, continue processing
			continue
		}

		trimmed := strings.TrimSpace(content)
		if len(trimmed) > 0 {
			results = append(results, ExtractionResult{
				Content:   trimmed,
				PageLabel: fmt.Sprintf("p. %d", pageNum),
			})
		}
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("no text content extracted from PDF")
	}

	return results, nil
}

// SupportedExtensions returns the supported file extensions for PDF.
func (p *PDFParser) SupportedExtensions() []string {
	return []string{".pdf"}
}