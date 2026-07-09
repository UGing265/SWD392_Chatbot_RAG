package fileparser

import (
	"fmt"
	"log"
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
	log.Printf("[PDFParser] Bắt đầu trích xuất text từ file PDF: %s", path)

	f, reader, err := pdf.Open(path)
	if err != nil {
		log.Printf("[PDFParser] LỖI: Không thể mở file PDF: %v", err)
		return nil, fmt.Errorf("failed to open PDF: %w", err)
	}
	defer f.Close()

	numPages := reader.NumPage()
	log.Printf("[PDFParser] Đã mở PDF thành công. Số lượng trang: %d", numPages)

	if numPages == 0 {
		log.Printf("[PDFParser] LỖI: File PDF không có trang nào (0 pages)")
		return nil, fmt.Errorf("PDF has no pages")
	}

	results := make([]ExtractionResult, 0, numPages)

	for pageNum := 1; pageNum <= numPages; pageNum++ {
		page := reader.Page(pageNum)
		if page.V.IsNull() {
			log.Printf("[PDFParser] Trang %d: Đối tượng Page bị Null (bỏ qua)", pageNum)
			continue
		}

		content, err := page.GetPlainText(nil)
		if err != nil {
			log.Printf("[PDFParser] Trang %d: Không thể lấy plain text. Lỗi: %v", pageNum, err)
			continue
		}

		trimmed := strings.TrimSpace(content)
		log.Printf("[PDFParser] Trang %d: Đã trích xuất thành công %d ký tự", pageNum, len(trimmed))

		if len(trimmed) > 0 {
			results = append(results, ExtractionResult{
				Content:   trimmed,
				PageLabel: fmt.Sprintf("p. %d", pageNum),
			})
		} else {
			log.Printf("[PDFParser] Trang %d: Nội dung rỗng sau khi cắt khoảng trắng", pageNum)
		}
	}

	log.Printf("[PDFParser] Hoàn tất trích xuất. Trích xuất thành công %d / %d trang.", len(results), numPages)

	if len(results) == 0 {
		log.Printf("[PDFParser] LỖI: Không bóc tách được bất kỳ ký tự nào từ file PDF này.")
		return nil, fmt.Errorf("no text content extracted from PDF")
	}

	return results, nil
}

// SupportedExtensions returns the supported file extensions for PDF.
func (p *PDFParser) SupportedExtensions() []string {
	return []string{".pdf"}
}
