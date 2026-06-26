package segmentation

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync/atomic"
	"time"

	"swd392-chatbot-rag/internal/domain/chapter"
	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/domain/document"

	"github.com/google/uuid"
)

type GeminiChapterSegmentationService struct {
	apiKeys  []string
	keyIndex atomic.Uint32
	model    string
	client   *http.Client
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiContent struct {
	Role  string       `json:"role"`
	Parts []geminiPart `json:"parts"`
}

type geminiGenerationConfig struct {
	Temperature      float64 `json:"temperature"`
	TopP             float64 `json:"topP"`
	MaxOutputTokens  int     `json:"maxOutputTokens"`
	ResponseMimeType string  `json:"responseMimeType"`
}

type geminiGenerateRequest struct {
	Contents         []geminiContent        `json:"contents"`
	GenerationConfig geminiGenerationConfig `json:"generationConfig"`
}

type geminiGenerateResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

type apiChapterItem struct {
	Title           string  `json:"title"`
	Summary         *string `json:"summary"`
	StartChunkIndex int     `json:"startChunkIndex"`
	EndChunkIndex   int     `json:"endChunkIndex"`
	ConfidenceScore float64 `json:"confidenceScore"`
}

type apiChapterResponse struct {
	Chapters []apiChapterItem `json:"chapters"`
}

func NewGeminiChapterSegmentationService(apiKeysStr string, model string) *GeminiChapterSegmentationService {
	if model == "" {
		model = "gemini-2.5-flash"
	}

	var keys []string
	for _, key := range strings.Split(apiKeysStr, ",") {
		trimmed := strings.TrimSpace(key)
		if trimmed != "" {
			keys = append(keys, trimmed)
		}
	}

	return &GeminiChapterSegmentationService{
		apiKeys: keys,
		model:   model,
		client: &http.Client{
			Timeout: 90 * time.Second,
		},
	}
}

func (s *GeminiChapterSegmentationService) getNextKey() string {
	if len(s.apiKeys) == 0 {
		return ""
	}
	idx := s.keyIndex.Add(1)
	return s.apiKeys[int(idx)%len(s.apiKeys)]
}

func (s *GeminiChapterSegmentationService) GenerateChapters(ctx context.Context, doc *document.Document, chunks []*chunk.Chunk) ([]*chapter.Chapter, error) {
	if len(chunks) == 0 {
		return nil, nil
	}

	var allChapters []*chapter.Chapter
	batchSize := 40
	lastChapterTitle := ""
	order := 1

	for i := 0; i < len(chunks); i += batchSize {
		end := i + batchSize
		if end > len(chunks) {
			end = len(chunks)
		}

		chunkBatch := chunks[i:end]
		batchChapters, err := s.processBatch(ctx, doc, chunkBatch, lastChapterTitle)
		if err != nil {
			log.Printf("AI chapter segmentation failed for batch, using fallback: %v", err)
			fallback := s.buildFallbackChapters(doc, chunkBatch)
			batchChapters = fallback
		}

		for _, c := range batchChapters {
			c.ChapterOrder = order
			allChapters = append(allChapters, c)
			lastChapterTitle = c.Title
			order++
		}
	}

	return allChapters, nil
}

func (s *GeminiChapterSegmentationService) processBatch(ctx context.Context, doc *document.Document, chunks []*chunk.Chunk, lastChapterTitle string) ([]*chapter.Chapter, error) {
	var sb strings.Builder
	for _, ch := range chunks {
		cleanContent := strings.ReplaceAll(ch.Content, "\r", "")
		lines := strings.Split(cleanContent, "\n")

		preview := cleanContent
		if len(preview) > 500 {
			preview = preview[:500] + "..."
		}
		preview = strings.ReplaceAll(preview, "\n", " ")

		var potentialHeaders []string
		for _, l := range lines {
			lTrim := strings.TrimSpace(l)
			if len(lTrim) > 3 && len(lTrim) < 80 && !strings.HasSuffix(lTrim, ".") && !strings.HasSuffix(lTrim, ",") {
				potentialHeaders = append(potentialHeaders, lTrim)
			}
			if len(potentialHeaders) >= 10 {
				break
			}
		}
		headersStr := strings.Join(potentialHeaders, " | ")
		sb.WriteString(fmt.Sprintf("[CHUNK %d] Preview: %s === Headers tiềm năng: %s\n", ch.ChunkOrder, preview, headersStr))
	}

	previousContext := ""
	if lastChapterTitle != "" {
		previousContext = fmt.Sprintf("LƯU Ý QUAN TRỌNG: Các phần trước của tài liệu đã được xử lý. Chương cuối cùng của phần trước có tên là '%s'. Hãy phân tích tiếp nối nội dung từ đây, đánh số thứ tự chương tiếp theo cho phù hợp, TUYỆT ĐỐI KHÔNG bắt đầu đánh số lại từ Chương 1.", lastChapterTitle)
	}

	docSubject := ""
	if doc.SubjectName != nil {
		docSubject = *doc.SubjectName
	}
	docLanguage := ""
	if doc.LanguageName != nil {
		docLanguage = *doc.LanguageName
	}

	promptTemplate := `Bạn là hệ thống chia chương tài liệu học thuật chuyên nghiệp.
Nhiệm vụ của bạn là đọc cực kỳ cẩn thận và phân chia tài liệu thành các chương (chapters) hoàn chỉnh dựa trên các chunk bên dưới.

%s

Yêu cầu BẮT BUỘC:
1. NGÔN NGỮ ĐẦU RA: Toàn bộ ` + "`title`" + ` (Tên chương) và ` + "`summary`" + ` (Tóm tắt) BẮT BUỘC PHẢI VIẾT BẰNG TIẾNG VIỆT, cho dù nội dung tài liệu gốc là tiếng Anh hay ngôn ngữ khác.
2. ĐỌC CẨN THẬN VÀ ƯU TIÊN TÌM HEADER: Hãy quét thật kỹ từng dòng nội dung của tất cả các chunk để tìm các dấu hiệu chuyển chương/phần rõ ràng (VD: 'Chapter 1', 'Chương 1', 'PART I', 'Mục lục', 'Introduction', 'Conclusion').
   - Tuyệt đối KHÔNG bỏ sót bất kỳ chương nào có trong sách. Sách có bao nhiêu chương thì HÃY TRẢ VỀ ĐẦY ĐỦ bấy nhiêu chương, không giới hạn số lượng chương.
   - Nếu sách KHÔNG CÓ chia chương rõ ràng, thì hãy tự động phân tích và gộp các chunk lại thành các phần/chủ đề lớn logic nhất.
3. Chỉ trả về JSON hợp lệ, KHÔNG giải thích thêm.
4. Mỗi chương phải có title, summary, startChunkIndex, endChunkIndex, confidenceScore.
5. 'summary' RẤT NGẮN GỌN (1-2 câu) bằng TIẾNG VIỆT.
6. startChunkIndex và endChunkIndex là số nguyên. Các chương phải bao phủ ĐẦY ĐỦ toàn bộ tài liệu (từ chunk đầu tiên đến chunk cuối cùng) và tuyệt đối KHÔNG được chồng lấn nhau.
7. Chỉ dùng chunk có sẵn, không bịa nội dung.
8. Nếu tài liệu quá ngắn, trả về 1 chương duy nhất.

Thông tin tài liệu:
- Title: %s
- Subject: %s
- Language: %s

Chunks:
%s

Đầu ra JSON dạng:
{
  "chapters": [
    {
      "title": "...",
      "summary": "...",
      "startChunkIndex": 0,
      "endChunkIndex": 4,
      "confidenceScore": 0.87
    }
  ]
}`

	prompt := fmt.Sprintf(promptTemplate, previousContext, doc.Title, docSubject, docLanguage, sb.String())

	var lastErr error
	for attempt := 0; attempt < len(s.apiKeys); attempt++ {
		apiKey := s.getNextKey()
		if apiKey == "" {
			return nil, fmt.Errorf("no gemini API keys available")
		}

		url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", s.model, apiKey)

		reqPayload := geminiGenerateRequest{
			Contents: []geminiContent{
				{
					Role: "user",
					Parts: []geminiPart{
						{Text: prompt},
					},
				},
			},
			GenerationConfig: geminiGenerationConfig{
				Temperature:      0.2,
				TopP:             0.8,
				MaxOutputTokens:  8192,
				ResponseMimeType: "application/json",
			},
		}

		jsonBytes, err := json.Marshal(reqPayload)
		if err != nil {
			return nil, err
		}

		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBytes))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}

		bodyBytes, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = err
			continue
		}

		if resp.StatusCode != http.StatusOK {
			lastErr = fmt.Errorf("gemini API returned status %d: %s", resp.StatusCode, string(bodyBytes))
			continue
		}

		var geminiResp geminiGenerateResponse
		if err := json.Unmarshal(bodyBytes, &geminiResp); err != nil {
			lastErr = err
			continue
		}

		if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
			return nil, fmt.Errorf("gemini API returned empty candidates")
		}

		text := geminiResp.Candidates[0].Content.Parts[0].Text
		jsonStr := extractJson(text)

		var parsedResponse apiChapterResponse
		if err := json.Unmarshal([]byte(jsonStr), &parsedResponse); err != nil {
			lastErr = fmt.Errorf("failed to parse json content: %w. raw text: %s", err, text)
			continue
		}

		return s.buildChaptersFromResponse(doc, chunks, parsedResponse), nil
	}

	return nil, fmt.Errorf("all api keys failed for chapter segmentation. last error: %w", lastErr)
}

func (s *GeminiChapterSegmentationService) buildChaptersFromResponse(doc *document.Document, chunks []*chunk.Chunk, resp apiChapterResponse) []*chapter.Chapter {
	if len(resp.Chapters) == 0 {
		return s.buildFallbackChapters(doc, chunks)
	}

	// Find max index from chunks
	maxIndex := 0
	for _, ch := range chunks {
		if ch.ChunkOrder > maxIndex {
			maxIndex = ch.ChunkOrder
		}
	}

	var result []*chapter.Chapter
	for i, c := range resp.Chapters {
		start := clamp(c.StartChunkIndex, 0, maxIndex)
		end := clamp(c.EndChunkIndex, start, maxIndex)

		title := strings.TrimSpace(c.Title)
		if title == "" {
			title = fmt.Sprintf("Chương %d", i+1)
		}

		conf := c.ConfidenceScore
		result = append(result, &chapter.Chapter{
			ID:              uuid.New(),
			DocumentID:      doc.ID,
			Title:           title,
			Summary:         c.Summary,
			ChapterOrder:    i + 1,
			StartChunkIndex: &start,
			EndChunkIndex:   &end,
			IsAIGenerated:   true,
			ConfidenceScore: &conf,
			CreatedAt:       time.Now(),
		})
	}

	return result
}

func (s *GeminiChapterSegmentationService) buildFallbackChapters(doc *document.Document, chunks []*chunk.Chunk) []*chapter.Chapter {
	minOrder := 999999
	maxOrder := -1
	for _, ch := range chunks {
		if ch.ChunkOrder < minOrder {
			minOrder = ch.ChunkOrder
		}
		if ch.ChunkOrder > maxOrder {
			maxOrder = ch.ChunkOrder
		}
	}
	if minOrder == 999999 {
		minOrder = 0
	}
	if maxOrder == -1 {
		maxOrder = 0
	}

	conf := 0.5
	summary := "Tài liệu được gom thành một chương duy nhất do nội dung ngắn hoặc không tách rõ ràng."
	return []*chapter.Chapter{
		{
			ID:              uuid.New(),
			DocumentID:      doc.ID,
			Title:           "Chương 1",
			Summary:         &summary,
			ChapterOrder:    1,
			StartChunkIndex: &minOrder,
			EndChunkIndex:   &maxOrder,
			IsAIGenerated:   true,
			ConfidenceScore: &conf,
			CreatedAt:       time.Now(),
		},
	}
}

func clamp(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func extractJson(text string) string {
	start := strings.Index(text, "{")
	if start < 0 {
		return text
	}
	end := strings.LastIndex(text, "}")
	if end <= start {
		return text
	}

	json := text[start : end+1]

	// Auto close missing brackets
	openBraces := strings.Count(json, "{")
	closeBraces := strings.Count(json, "}")
	openBrackets := strings.Count(json, "[")
	closeBrackets := strings.Count(json, "]")

	if openBrackets > closeBrackets {
		json += strings.Repeat("]", openBrackets-closeBrackets)
	}
	if openBraces > closeBraces {
		json += strings.Repeat("}", openBraces-closeBraces)
	}

	return json
}
