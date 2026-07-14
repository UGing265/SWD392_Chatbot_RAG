package document_usecase

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/google/uuid"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/col"
	"github.com/johnfercher/maroto/v2/pkg/components/line"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/consts/orientation"
	"github.com/johnfercher/maroto/v2/pkg/core"
	"github.com/johnfercher/maroto/v2/pkg/props"
	"github.com/johnfercher/maroto/v2/pkg/repository"

	"swd392-chatbot-rag/internal/infrastructure/llm"
)

func (uc *DocumentUseCase) CompareDocuments(ctx context.Context, documentIDs []uuid.UUID, question string) (string, error) {
	if len(documentIDs) < 2 {
		return "", errors.New("at least 2 documents are required for comparison")
	}

	numDocs := len(documentIDs)
	var contextBuilder strings.Builder
	for i, docID := range documentIDs {
		chunks, err := uc.chunkRepo.FindByDocumentID(ctx, docID)
		if err != nil {
			return "", fmt.Errorf("failed to get chunks for document %s: %w", docID, err)
		}

		var docContent strings.Builder
		for _, ch := range chunks {
			docContent.WriteString(ch.Content + "\n")
		}

		contentStr := docContent.String()
		// Limit per-document length to ~8000 chars to keep total context reasonable
		if len(contentStr) > 8000 {
			contentStr = contentStr[:8000] + "\n... (đã cắt bớt)"
		}

		contextBuilder.WriteString(fmt.Sprintf("[TÀI LIỆU %d]\n%s\n\n", i+1, contentStr))
	}

	// Build column header names for the example
	var colHeaders []string
	var colSeparators []string
	colHeaders = append(colHeaders, "Tiêu chí so sánh")
	colSeparators = append(colSeparators, "---")
	for i := 0; i < numDocs; i++ {
		colHeaders = append(colHeaders, fmt.Sprintf("Tài liệu %d", i+1))
		colSeparators = append(colSeparators, "---")
	}
	exampleHeader := "| " + strings.Join(colHeaders, " | ") + " |"
	exampleSeparator := "| " + strings.Join(colSeparators, " | ") + " |"

	systemPrompt := fmt.Sprintf(`Bạn là chuyên gia phân tích tài liệu. Nhiệm vụ: so sánh %d tài liệu được cung cấp.

QUY TẮC BẮT BUỘC:
1. CHỈ trả về DUY NHẤT một bảng Markdown, KHÔNG có văn bản nào trước hoặc sau bảng.
2. Bảng phải có đúng %d cột: cột 1 là "Tiêu chí so sánh", các cột còn lại là tên từng tài liệu.
3. Bảng phải có 5-10 hàng tiêu chí (ví dụ: Chủ đề chính, Nội dung, Phạm vi, Độ chi tiết, Điểm giống, Điểm khác biệt, Kết luận).
4. Mỗi ô phải chứa nội dung tóm tắt ngắn gọn (1-3 câu), KHÔNG để ô trống.
5. Sử dụng tiếng Việt.

VÍ DỤ ĐÚNG FORMAT:
%s
%s
| Chủ đề chính | Nội dung tài liệu 1 | Nội dung tài liệu 2 |
| Phạm vi | ... | ... |`, numDocs, numDocs+1, exampleHeader, exampleSeparator)

	userPrompt := contextBuilder.String()
	if question != "" {
		userPrompt = "Yêu cầu bổ sung: " + question + "\n\n" + userPrompt
	}

	history := []llm.ChatMessage{
		{Role: "user", Content: userPrompt},
	}

	responseStr, err := uc.llmClient.Generate(ctx, systemPrompt, history)
	if err != nil {
		return "", fmt.Errorf("LLM comparison failed: %w", err)
	}

	responseStr = cleanMarkdownTable(responseStr)
	return responseStr, nil
}

// cleanMarkdownTable strips code fences, extra whitespace, and ensures
// the response is a valid-looking Markdown table.
func cleanMarkdownTable(raw string) string {
	s := strings.TrimSpace(raw)

	// Remove code fences
	for _, fence := range []string{"```markdown", "```md", "```"} {
		if strings.HasPrefix(s, fence) {
			s = strings.TrimPrefix(s, fence)
			// Remove trailing fence
			if idx := strings.LastIndex(s, "```"); idx != -1 {
				s = s[:idx]
			}
			s = strings.TrimSpace(s)
			break
		}
	}

	// Split into lines and filter out completely empty lines between table rows,
	// but keep one newline between each row
	lines := strings.Split(s, "\n")
	var cleaned []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		// Only keep lines that look like table rows (start with |)
		// or separator lines
		if strings.HasPrefix(trimmed, "|") {
			cleaned = append(cleaned, trimmed)
		}
	}

	if len(cleaned) == 0 {
		// Fallback: return the original cleaned string if no table rows found
		return s
	}

	return strings.Join(cleaned, "\n")
}

func (uc *DocumentUseCase) ExportCompareResultToPDF(ctx context.Context, markdownResult string) ([]byte, error) {
	// Parse markdown table into rows of cells
	lines := strings.Split(markdownResult, "\n")
	var tableRows [][]string
	for _, lineStr := range lines {
		trimmed := strings.TrimSpace(lineStr)
		if trimmed == "" || !strings.HasPrefix(trimmed, "|") {
			continue
		}
		// Skip separator lines like |---|---|
		if isSeparatorLine(trimmed) {
			continue
		}
		cells := parseTableRow(trimmed)
		if len(cells) > 0 {
			// Clean cells
			for i, cell := range cells {
				cells[i] = cleanCellContent(cell)
			}
			tableRows = append(tableRows, cells)
		}
	}

	if len(tableRows) == 0 {
		return nil, errors.New("no table data found in comparison result")
	}

	numCols := len(tableRows[0])
	// Calculate column width (maroto uses 12-column grid)
	colSize := 12 / numCols
	if colSize < 1 {
		colSize = 1
	}
	// Give remaining space to first column
	firstColSize := 12 - (colSize * (numCols - 1))
	if firstColSize < 1 {
		firstColSize = colSize
	}

	// Load Arial font from Windows standard font path to support Vietnamese accents
	fontRepo := repository.New()
	arialPath := "C:\\Windows\\Fonts\\arial.ttf"
	arialBoldPath := "C:\\Windows\\Fonts\\arialbd.ttf"
	
	hasCustomFont := false
	if _, err := os.Stat(arialPath); err == nil {
		if _, err := os.Stat(arialBoldPath); err == nil {
			fontRepo.AddUTF8Font("Arial", fontstyle.Normal, arialPath)
			fontRepo.AddUTF8Font("Arial", fontstyle.Bold, arialBoldPath)
			hasCustomFont = true
		}
	}

	// Define configuration with landscape orientation to accommodate comparison columns nicely
	cfgBuilder := config.NewBuilder().
		WithOrientation(orientation.Horizontal)

	if hasCustomFont {
		customFonts, err := fontRepo.Load()
		if err == nil {
			cfgBuilder = cfgBuilder.
				WithCustomFonts(customFonts).
				WithDefaultFont(&props.Font{
					Family: "Arial",
					Style:  fontstyle.Normal,
				})
		}
	}
	cfg := cfgBuilder.Build()

	m := maroto.New(cfg)

	// Title row
	m.AddRow(14,
		col.New(12).Add(text.New("KẾT QUẢ PHÂN TÍCH SO SÁNH TÀI LIỆU", props.Text{
			Style: fontstyle.Bold,
			Size:  14,
			Top:   3,
		})),
	)

	// Gray divider line under title
	m.AddRow(2, line.NewCol(12, props.Line{
		Color:     &props.Color{Red: 150, Green: 150, Blue: 150},
		Thickness: 1.0,
	}))

	// Spacer
	m.AddRow(4)

	// Header row (first row of table)
	headerCells := tableRows[0]
	headerCols := make([]core.Col, 0, numCols)
	headerBg := &props.Color{Red: 240, Green: 240, Blue: 240}
	for i, cell := range headerCells {
		size := colSize
		if i == 0 {
			size = firstColSize
		}
		headerCols = append(headerCols, col.New(size).
			WithStyle(&props.Cell{
				BackgroundColor: headerBg,
			}).
			Add(
				text.New(cell, props.Text{
					Style: fontstyle.Bold,
					Size:  9,
					Top:   3,
					Left:  2,
				}),
			),
		)
	}
	m.AddRow(12, headerCols...)

	// Under-header strong separator line
	m.AddRow(2, line.NewCol(12, props.Line{
		Color:     &props.Color{Red: 100, Green: 100, Blue: 100},
		Thickness: 1.0,
	}))

	// Data rows
	for _, row := range tableRows[1:] {
		dataCols := make([]core.Col, 0, numCols)
		
		// Determine row height dynamically based on longest cell content and column size
		maxLines := 1
		for i, cell := range row {
			colWidth := colSize
			if i == 0 {
				colWidth = firstColSize
			}
			
			// Landscape standard printable width is ~277mm.
			// Each unit of grid size is ~23mm.
			// At size 8 font, a character is roughly 1.4mm wide.
			// Chars per line inside column is roughly colWidth * 16.
			charsPerLine := colWidth * 16
			if charsPerLine < 12 {
				charsPerLine = 12
			}
			
			linesCount := (len(cell) + charsPerLine - 1) / charsPerLine
			if linesCount < 1 {
				linesCount = 1
			}
			if linesCount > maxLines {
				maxLines = linesCount
			}
		}
		// Each line needs about 4.2 units of height, plus padding
		rowHeight := float64(maxLines)*4.2 + 4.0
		if rowHeight < 10.0 {
			rowHeight = 10.0
		}

		for i, cell := range row {
			size := colSize
			if i == 0 {
				size = firstColSize
			}
			dataCols = append(dataCols, col.New(size).Add(
				text.New(cell, props.Text{
					Size: 8,
					Top:  2,
					Left: 2,
				}),
			))
		}
		// Pad with empty columns if row has fewer cells
		for i := len(row); i < numCols; i++ {
			size := colSize
			if i == 0 {
				size = firstColSize
			}
			dataCols = append(dataCols, col.New(size))
		}
		
		m.AddRow(rowHeight, dataCols...)
		
		// Thin gray line separating rows
		m.AddRow(1.5, line.NewCol(12, props.Line{
			Color:     &props.Color{Red: 220, Green: 220, Blue: 220},
			Thickness: 0.5,
		}))
	}

	doc, err := m.Generate()
	if err != nil {
		return nil, err
	}
	return doc.GetBytes(), nil
}

// cleanCellContent strips markdown characters from content
func cleanCellContent(textStr string) string {
	cleaned := strings.ReplaceAll(textStr, "**", "")
	cleaned = strings.ReplaceAll(cleaned, "*", "")
	cleaned = strings.ReplaceAll(cleaned, "`", "")
	cleaned = strings.TrimSpace(cleaned)
	return cleaned
}

// isSeparatorLine checks if a markdown table line is a separator (e.g., |---|---|)
func isSeparatorLine(line string) bool {
	stripped := strings.ReplaceAll(line, "|", "")
	stripped = strings.ReplaceAll(stripped, "-", "")
	stripped = strings.ReplaceAll(stripped, ":", "")
	stripped = strings.TrimSpace(stripped)
	return stripped == ""
}

// parseTableRow extracts cell content from a markdown table row
func parseTableRow(line string) []string {
	// Remove leading/trailing pipe
	line = strings.TrimSpace(line)
	if strings.HasPrefix(line, "|") {
		line = line[1:]
	}
	if strings.HasSuffix(line, "|") {
		line = line[:len(line)-1]
	}

	parts := strings.Split(line, "|")
	var cells []string
	for _, p := range parts {
		cells = append(cells, strings.TrimSpace(p))
	}
	return cells
}
