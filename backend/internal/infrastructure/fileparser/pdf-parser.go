package fileparser

import (
	"fmt"
	"os"
	"strings"

	"github.com/unidoc/unipdf/v4/extractor"
	"github.com/unidoc/unipdf/v4/model"
)

// PDFParser extracts text content from PDF files using unipdf.
// It extracts text per page and returns page labels in the format "p. {number}".
type PDFParser struct{}

// NewPDFParser creates a new PDF parser.
func NewPDFParser() *PDFParser {
	return &PDFParser{}
}

// Extract reads the PDF file at the given path and extracts text from each page.
// Returns a slice of ExtractionResult, one per page, with page labels like "p. 1".
func (p *PDFParser) Extract(path string) ([]ExtractionResult, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open PDF file: %w", err)
	}
	defer file.Close()

	pdfReader, err := model.NewPdfReader(file)
	if err != nil {
		return nil, fmt.Errorf("failed to create PDF reader: %w", err)
	}

	numPages, err := pdfReader.GetNumPages()
	if err != nil {
		return nil, fmt.Errorf("failed to get page count: %w", err)
	}

	results := make([]ExtractionResult, 0, numPages)

	for pageNum := 1; pageNum <= numPages; pageNum++ {
		page, err := pdfReader.GetPage(pageNum)
		if err != nil {
			// Skip pages that fail to load, but continue processing
			continue
		}

		// Extract text content from the page
		content, err := extractTextFromPage(page)
		if err != nil {
			// Skip pages that fail to extract text
			continue
		}

		// Only add non-empty content
		if len(strings.TrimSpace(content)) > 0 {
			results = append(results, ExtractionResult{
				Content:   content,
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

// extractTextFromPage extracts text content from a single PDF page.
func extractTextFromPage(page *model.PdfPage) (string, error) {
	ex, err := extractor.New(page)
	if err != nil {
		return "", fmt.Errorf("failed to create extractor: %w", err)
	}

	text, err := ex.ExtractText()
	if err != nil {
		return "", fmt.Errorf("failed to extract text: %w", err)
	}

	return text, nil
}