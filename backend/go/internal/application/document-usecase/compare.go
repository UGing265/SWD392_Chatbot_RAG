package document_usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/col"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/props"

	"swd392-chatbot-rag/internal/application"
	"swd392-chatbot-rag/internal/domain/chunk"
	"swd392-chatbot-rag/internal/infrastructure/llm"
)

func (uc *DocumentUseCase) CompareDocuments(ctx context.Context, documentIDs []uuid.UUID, question string) (*application.ComparisonResultDto, error) {
	if len(documentIDs) < 2 {
		return nil, errors.New("at least 2 documents are required for comparison")
	}

	var allChunks []*chunk.Chunk
	for _, docID := range documentIDs {
		chunks, err := uc.chunkRepo.FindByDocumentID(ctx, docID)
		if err != nil {
			return nil, fmt.Errorf("failed to get chunks for document %s: %w", docID, err)
		}
		allChunks = append(allChunks, chunks...)
	}

	if len(allChunks) == 0 {
		return nil, errors.New("no content found in the provided documents")
	}

	// Limit to a reasonable number of chunks to avoid exceeding token limits
	maxChunks := 40
	if len(allChunks) > maxChunks {
		allChunks = allChunks[:maxChunks]
	}

	var contextBuilder strings.Builder
	for i, ch := range allChunks {
		contextBuilder.WriteString(fmt.Sprintf("--- Chunk %d ---\n", i+1))
		contextBuilder.WriteString(fmt.Sprintf("Document ID: %s\n", ch.DocumentID))
		contextBuilder.WriteString(fmt.Sprintf("Content:\n%s\n\n", ch.Content))
	}

	systemPrompt := `You are an expert academic document analyzer. Your task is to compare the provided documents and answer the user's question.
You MUST output your response in strict JSON format matching the following structure:
{
  "differences": [
    {
      "topic": "Topic Name",
      "document1": "How document 1 addresses this",
      "document2": "How document 2 addresses this",
      "explanation": "Brief analysis of the difference"
    }
  ],
  "commonThemes": ["Theme 1", "Theme 2"],
  "summary": "Overall summary of the comparison."
}
DO NOT wrap the JSON in Markdown formatting like ` + "`" + `` + "`" + `` + "`json" + `. Just return the raw JSON object.`

	userPrompt := fmt.Sprintf("Question: %s\n\nDocuments Context:\n%s", question, contextBuilder.String())

	history := []llm.ChatMessage{
		{Role: "user", Content: userPrompt},
	}

	responseStr, err := uc.llmClient.Generate(ctx, systemPrompt, history)
	if err != nil {
		return nil, fmt.Errorf("LLM comparison failed: %w", err)
	}

	// Clean up potential markdown formatting from LLM response
	responseStr = strings.TrimSpace(responseStr)
	if strings.HasPrefix(responseStr, "```json") {
		responseStr = strings.TrimPrefix(responseStr, "```json")
		responseStr = strings.TrimSuffix(responseStr, "```")
	} else if strings.HasPrefix(responseStr, "```") {
		responseStr = strings.TrimPrefix(responseStr, "```")
		responseStr = strings.TrimSuffix(responseStr, "```")
	}

	var result application.ComparisonResultDto
	if err := json.Unmarshal([]byte(responseStr), &result); err != nil {
		return nil, fmt.Errorf("failed to parse comparison result: %w\nResponse was: %s", err, responseStr)
	}

	return &result, nil
}

func (uc *DocumentUseCase) ExportCompareResultToPDF(ctx context.Context, result *application.ComparisonResultDto) ([]byte, error) {
	m := maroto.New()

	m.AddRow(10,
		col.New(12).Add(text.New("Comparison Result", props.Text{Style: fontstyle.Bold, Size: 16})),
	)

	m.AddRow(10,
		col.New(12).Add(text.New("Summary", props.Text{Style: fontstyle.Bold, Size: 14})),
	)
	m.AddRow(20,
		col.New(12).Add(text.New(result.Summary)),
	)

	m.AddRow(10,
		col.New(12).Add(text.New("Common Themes", props.Text{Style: fontstyle.Bold, Size: 14})),
	)
	for _, theme := range result.CommonThemes {
		m.AddRow(10,
			col.New(12).Add(text.New("- "+theme)),
		)
	}

	m.AddRow(10,
		col.New(12).Add(text.New("Differences", props.Text{Style: fontstyle.Bold, Size: 14})),
	)
	for _, diff := range result.Differences {
		m.AddRow(10,
			col.New(12).Add(text.New("Topic: "+diff.Topic, props.Text{Style: fontstyle.Bold})),
		)
		m.AddRow(15,
			col.New(12).Add(text.New("Doc 1: "+diff.Document1)),
		)
		m.AddRow(15,
			col.New(12).Add(text.New("Doc 2: "+diff.Document2)),
		)
		m.AddRow(15,
			col.New(12).Add(text.New("Explanation: "+diff.Explanation)),
		)
	}

	doc, err := m.Generate()
	if err != nil {
		return nil, err
	}
	return doc.GetBytes(), nil
}
