package fileparser

import (
	"fmt"
	"os"
	"strings"

	"github.com/fumiama/go-docx"
)

// DOCXParser extracts text content from DOCX files using go-docx.
// It extracts the entire document as a single chunk with page label "Document".
type DOCXParser struct{}

// NewDOCXParser creates a new DOCX parser.
func NewDOCXParser() *DOCXParser {
	return &DOCXParser{}
}

// Extract reads the DOCX file at the given path and extracts all text content.
// Returns a single ExtractionResult with the entire document content.
func (p *DOCXParser) Extract(path string) ([]ExtractionResult, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open DOCX file: %w", err)
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	doc, err := docx.Parse(file, fileInfo.Size())
	if err != nil {
		return nil, fmt.Errorf("failed to parse DOCX file: %w", err)
	}

	var textBuilder strings.Builder

	// Extract text from all paragraphs and tables in the document body
	for _, item := range doc.Document.Body.Items {
		switch it := item.(type) {
		case *docx.Paragraph:
			extractParagraphText(it, &textBuilder)
			textBuilder.WriteString("\n")
		case *docx.Table:
			extractTableText(it, &textBuilder)
			textBuilder.WriteString("\n")
		}
	}

	content := textBuilder.String()
	if len(content) == 0 {
		return nil, fmt.Errorf("no text content extracted from DOCX")
	}

	return []ExtractionResult{
		{
			Content:   content,
			PageLabel: "Document",
		},
	}, nil
}

// SupportedExtensions returns the supported file extensions for DOCX.
func (p *DOCXParser) SupportedExtensions() []string {
	return []string{".docx"}
}

// extractParagraphText extracts text from a paragraph and appends to the builder.
func extractParagraphText(para *docx.Paragraph, sb *strings.Builder) {
	for _, child := range para.Children {
		if run, ok := child.(*docx.Run); ok {
			extractRunText(run, sb)
		}
	}
}

// extractRunText extracts text from a run and its children.
func extractRunText(run *docx.Run, sb *strings.Builder) {
	for _, child := range run.Children {
		switch c := child.(type) {
		case string:
			sb.WriteString(c)
		case *docx.Run:
			extractRunText(c, sb)
		}
	}
}

// extractTableText extracts text from a table and appends to the builder.
func extractTableText(table *docx.Table, sb *strings.Builder) {
	for _, row := range table.TableRows {
		for _, cell := range row.TableCells {
			for _, para := range cell.Paragraphs {
				extractParagraphText(para, sb)
				sb.WriteString(" ")
			}
		}
		sb.WriteString("\n")
	}
}