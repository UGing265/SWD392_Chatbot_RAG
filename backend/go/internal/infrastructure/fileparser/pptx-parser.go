package fileparser

import (
	"archive/zip"
	"encoding/xml"
	"fmt"
	"io"
	"regexp"
	"sort"
	"strings"
)

// PPTXParser extracts text content from PPTX files.
// It opens the PPTX as a ZIP archive, reads slide XML files,
// and extracts text per slide with labels like "Slide 1".
type PPTXParser struct{}

// NewPPTXParser creates a new PPTX parser.
func NewPPTXParser() *PPTXParser {
	return &PPTXParser{}
}

// Extract reads the PPTX file at the given path and extracts text from each slide.
// Returns a slice of ExtractionResult, one per slide.
func (p *PPTXParser) Extract(path string) ([]ExtractionResult, error) {
	reader, err := zip.OpenReader(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open PPTX file: %w", err)
	}
	defer reader.Close()

	// Collect all slide files
	var slideFiles []string
	for _, file := range reader.File {
		if strings.HasPrefix(file.Name, "ppt/slides/slide") && strings.HasSuffix(file.Name, ".xml") {
			slideFiles = append(slideFiles, file.Name)
		}
	}

	if len(slideFiles) == 0 {
		return nil, fmt.Errorf("no slides found in PPTX file")
	}

	// Sort slides by their number (slide1.xml, slide2.xml, etc.)
	sort.Slice(slideFiles, func(i, j int) bool {
		return extractSlideNumber(slideFiles[i]) < extractSlideNumber(slideFiles[j])
	})

	results := make([]ExtractionResult, 0, len(slideFiles))
	slideNum := 1

	for _, slideName := range slideFiles {
		content, err := extractSlideText(&reader, slideName)
		if err != nil {
			// Skip slides that fail to extract
			continue
		}

		// Only add non-empty content
		if len(strings.TrimSpace(content)) > 0 {
			results = append(results, ExtractionResult{
				Content:   content,
				PageLabel: fmt.Sprintf("Slide %d", slideNum),
			})
		}
		slideNum++
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("no text content extracted from PPTX")
	}

	return results, nil
}

// SupportedExtensions returns the supported file extensions for PPTX.
func (p *PPTXParser) SupportedExtensions() []string {
	return []string{".pptx"}
}

// extractSlideNumber extracts the numeric part from a slide filename (e.g., "slide1.xml" -> 1).
func extractSlideNumber(name string) int {
	re := regexp.MustCompile(`slide(\d+)`)
	matches := re.FindStringSubmatch(name)
	if len(matches) > 1 {
		var num int
		fmt.Sscanf(matches[1], "%d", &num)
		return num
	}
	return 0
}

// extractSlideText extracts text content from a specific slide in the ZIP archive.
func extractSlideText(reader **zip.ReadCloser, slideName string) (string, error) {
	// Find the slide file in the reader
	var slideFile *zip.File
	for _, f := range (*reader).File {
		if f.Name == slideName {
			slideFile = f
			break
		}
	}

	if slideFile == nil {
		return "", fmt.Errorf("slide file not found: %s", slideName)
	}

	rc, err := slideFile.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open slide file: %w", err)
	}
	defer rc.Close()

	// Parse using token loop to collect all text inside <a:t> elements recursively
	var sb strings.Builder
	decoder := xml.NewDecoder(rc)
	for {
		token, err := decoder.Token()
		if err != nil {
			if err == io.EOF {
				break
			}
			return "", fmt.Errorf("failed to read XML token: %w", err)
		}

		switch se := token.(type) {
		case xml.StartElement:
			if se.Name.Local == "t" {
				var t string
				if err := decoder.DecodeElement(&t, &se); err == nil {
					t = strings.TrimSpace(t)
					if t != "" {
						sb.WriteString(t)
						sb.WriteString("\n")
					}
				}
			}
		}
	}

	return strings.TrimSpace(sb.String()), nil
}
