package fileparser

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTextParser_Extract(t *testing.T) {
	parser := NewTextParser()

	t.Run("txt file", func(t *testing.T) {
		// Create temp file
		tmpDir := t.TempDir()
		tmpFile := filepath.Join(tmpDir, "test.txt")
		err := os.WriteFile(tmpFile, []byte("Hello, World!\nThis is a test file."), 0644)
		require.NoError(t, err)

		results, err := parser.Extract(tmpFile)
		require.NoError(t, err)
		require.Len(t, results, 1)

		assert.Equal(t, "Hello, World!\nThis is a test file.", results[0].Content)
		assert.Equal(t, "test.txt", results[0].PageLabel)
	})

	t.Run("md file", func(t *testing.T) {
		// Create temp file
		tmpDir := t.TempDir()
		tmpFile := filepath.Join(tmpDir, "readme.md")
		err := os.WriteFile(tmpFile, []byte("# Title\n\nThis is **markdown** content."), 0644)
		require.NoError(t, err)

		results, err := parser.Extract(tmpFile)
		require.NoError(t, err)
		require.Len(t, results, 1)

		assert.Equal(t, "# Title\n\nThis is **markdown** content.", results[0].Content)
		assert.Equal(t, "readme.md", results[0].PageLabel)
	})

	t.Run("file not found", func(t *testing.T) {
		_, err := parser.Extract("/nonexistent/file.txt")
		assert.Error(t, err)
	})

	t.Run("empty file", func(t *testing.T) {
		tmpDir := t.TempDir()
		tmpFile := filepath.Join(tmpDir, "empty.txt")
		err := os.WriteFile(tmpFile, []byte(""), 0644)
		require.NoError(t, err)

		_, err = parser.Extract(tmpFile)
		assert.Error(t, err)
	})
}

func TestTextParser_SupportedExtensions(t *testing.T) {
	parser := NewTextParser()
	exts := parser.SupportedExtensions()

	assert.Contains(t, exts, ".txt")
	assert.Contains(t, exts, ".md")
}

func TestParserFactory_Get(t *testing.T) {
	factory := NewParserFactory()

	t.Run("returns correct parsers", func(t *testing.T) {
		assert.IsType(t, &PDFParser{}, factory.Get(".pdf"))
		assert.IsType(t, &DOCXParser{}, factory.Get(".docx"))
		assert.IsType(t, &PPTXParser{}, factory.Get(".pptx"))
		assert.IsType(t, &TextParser{}, factory.Get(".txt"))
		assert.IsType(t, &TextParser{}, factory.Get(".md"))
	})

	t.Run("case insensitive", func(t *testing.T) {
		assert.IsType(t, &PDFParser{}, factory.Get(".PDF"))
		assert.IsType(t, &DOCXParser{}, factory.Get(".DOCX"))
		assert.IsType(t, &PPTXParser{}, factory.Get(".PPTX"))
	})

	t.Run("unsupported extension returns nil", func(t *testing.T) {
		assert.Nil(t, factory.Get(".xlsx"))
		assert.Nil(t, factory.Get(".html"))
		assert.Nil(t, factory.Get(""))
	})
}

func TestParserFactory_Register(t *testing.T) {
	t.Run("can create custom parser and register", func(t *testing.T) {
		factory := &ParserFactory{
			parsers: make(map[string]Parser),
		}

		customParser := &TextParser{}
		factory.parsers[".custom"] = customParser

		assert.Equal(t, customParser, factory.Get(".custom"))
	})
}

func TestExtractionResult_Structure(t *testing.T) {
	result := ExtractionResult{
		Content:   "Sample content",
		PageLabel: "p. 1",
	}

	assert.Equal(t, "Sample content", result.Content)
	assert.Equal(t, "p. 1", result.PageLabel)
}