# Phase 02: Document Parser Infrastructure

## Context Links

- `../plan.md` - Plan overview
- `../research/document-parsing-research.md` - Research findings

## Overview

- **Priority:** High
- **Current status:** Pending
- **Brief description:** Implement file parsers for PDF, DOCX, PPTX, TXT, MD with page/slide label tracking for citations.

## Architecture

```
[File Parser Factory] → NewParser(extension)
        │
        ├── PDFParser ──→ unipdf extraction
        ├── DOCXParser ──→ go-docx extraction
        ├── PPTXParser ──→ ZIP/XML extraction
        └── TextParser ──→ os.ReadFile
        │
        ▼
[]ExtractionResult{Content, PageLabel}
```

## Requirements

### Functional
- Extract text from PDF, DOCX, PPTX, TXT, MD
- Track page/slide numbers for citations (page_label field)
- Return structured ExtractionResult per page/section
- Handle extraction errors gracefully per file

### Non-Functional
- Parser interface enables dependency injection
- Factory pattern for parser selection
- Extensible for new formats

## Related Code Files

### New Files to Create
- `backend/internal/infrastructure/fileparser/parser.go` - Interface + factory
- `backend/internal/infrastructure/fileparser/pdf-parser.go` - PDF extraction
- `backend/internal/infrastructure/fileparser/docx-parser.go` - DOCX extraction
- `backend/internal/infrastructure/fileparser/pptx-parser.go` - PPTX extraction
- `backend/internal/infrastructure/fileparser/text-parser.go` - TXT/MD extraction

## Implementation Steps

### 1. Parser Interface
```go
// internal/infrastructure/fileparser/parser.go
package fileparser

type ExtractionResult struct {
    Content   string
    PageLabel string // e.g., "p. 78" or "Slide 12"
}

type Parser interface {
    Extract(path string) ([]ExtractionResult, error)
    SupportedExtensions() []string
}

type parserFactory struct {
    parsers map[string]Parser
}

func NewParserFactory() *parserFactory {
    return &parserFactory{
        parsers: map[string]Parser{
            ".pdf":  &PDFParser{},
            ".docx": &DOCXParser{},
            ".pptx": &PPTXParser{},
            ".txt":  &TextParser{},
            ".md":   &TextParser{},
        },
    }
}

func (f *parserFactory) Get(ext string) Parser {
    ext = strings.ToLower(ext)
    if p, ok := f.parsers[ext]; ok {
        return p
    }
    return nil
}
```

### 2. PDF Parser (using unidoc/unipdf)
```go
// internal/infrastructure/fileparser/pdf-parser.go
package fileparser

import (
    "fmt"
    "github.com/unidoc/unipdf/v4/extractor"
    "github.com/unidoc/unipdf/v4/model"
    "os"
    "strings"
)

type PDFParser struct{}

func (p *PDFParser) Extract(path string) ([]ExtractionResult, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, fmt.Errorf("open file: %w", err)
    }
    defer f.Close()

    reader, err := model.NewPdfReader(f)
    if err != nil {
        return nil, fmt.Errorf("create reader: %w", err)
    }
    defer reader.Decrypt(nil)

    numPages, err := reader.GetNumPages()
    if err != nil {
        return nil, fmt.Errorf("get pages: %w", err)
    }

    var results []ExtractionResult
    for i := 1; i <= numPages; i++ {
        page, err := reader.GetPage(i)
        if err != nil {
            continue
        }

        ex, err := extractor.New(page)
        if err != nil {
            continue
        }

        pageText, _, _, err := ex.ExtractPageText()
        if err != nil {
            continue
        }

        text := strings.TrimSpace(pageText.Text())
        if text != "" {
            results = append(results, ExtractionResult{
                Content:   text,
                PageLabel: fmt.Sprintf("p. %d", i),
            })
        }
    }
    return results, nil
}

func (p *PDFParser) SupportedExtensions() []string {
    return []string{".pdf"}
}
```

### 3. DOCX Parser (using fumiama/go-docx)
```go
// internal/infrastructure/fileparser/docx-parser.go
package fileparser

import (
    "fmt"
    "github.com/fumiama/go-docx"
    "os"
    "strings"
)

type DOCXParser struct{}

func (p *DOCXParser) Extract(path string) ([]ExtractionResult, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, fmt.Errorf("open file: %w", err)
    }
    defer f.Close()

    fi, err := f.Stat()
    if err != nil {
        return nil, fmt.Errorf("stat file: %w", err)
    }

    doc, err := docx.Parse(f, fi.Size())
    if err != nil {
        return nil, fmt.Errorf("parse docx: %w", err)
    }

    // DOCX doesn't have native pages, treat entire document as one chunk
    // For better granularity, could split by paragraphs
    var sb strings.Builder
    for _, item := range doc.Document.Body.Items {
        sb.WriteString(fmt.Sprintf("%v\n", item))
    }

    text := strings.TrimSpace(sb.String())
    if text == "" {
        return nil, nil
    }

    return []ExtractionResult{{
        Content:   text,
        PageLabel: "Document",
    }}, nil
}

func (p *DOCXParser) SupportedExtensions() []string {
    return []string{".docx"}
}
```

### 4. PPTX Parser (using archive/zip)
```go
// internal/infrastructure/fileparser/pptx-parser.go
package fileparser

import (
    "archive/zip"
    "encoding/xml"
    "fmt"
    "io"
    "os"
    "path/filepath"
    "regexp"
    "strings"
)

type PPTXParser struct{}

func (p *PPTXParser) Extract(path string) ([]ExtractionResult, error) {
    r, err := zip.OpenReader(path)
    if err != nil {
        return nil, fmt.Errorf("open zip: %w", err)
    }
    defer r.Close()

    var results []ExtractionResult
    slideNum := 1

    for _, f := range r.File {
        matched, _ := regexp.MatchString(`ppt/slides/slide\d+\.xml`, f.Name)
        if !matched {
            continue
        }

        rc, err := f.Open()
        if err != nil {
            continue
        }

        data, err := io.ReadAll(rc)
        rc.Close()
        if err != nil {
            continue
        }

        text := extractTextFromSlideXML(data)
        if text != "" {
            results = append(results, ExtractionResult{
                Content:   text,
                PageLabel: fmt.Sprintf("Slide %d", slideNum),
            })
        }
        slideNum++
    }

    return results, nil
}

func extractTextFromSlideXML(data []byte) string {
    // Parse slide XML and extract all text runs
    type slide struct {
        XMLName xml.Name `xml:"p:sld"`
        Text    []string `xml:"p:spTree>p:sp>p:txBody>a:p>a:r>a:t"`
    }

    var s slide
    if err := xml.Unmarshal(data, &s); err != nil {
        return ""
    }
    return strings.Join(s.Text, " ")
}

func (p *PPTXParser) SupportedExtensions() []string {
    return []string{".pptx"}
}
```

### 5. Text Parser (for TXT/MD)
```go
// internal/infrastructure/fileparser/text-parser.go
package fileparser

import (
    "fmt"
    "os"
    "strings"
)

type TextParser struct{}

func (p *TextParser) Extract(path string) ([]ExtractionResult, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("read file: %w", err)
    }

    text := strings.TrimSpace(string(data))
    if text == "" {
        return nil, nil
    }

    // For plain text, treat as single chunk
    // Could split by paragraphs for better granularity
    return []ExtractionResult{{
        Content:   text,
        PageLabel: filepath.Base(path),
    }}, nil
}

func (p *TextParser) SupportedExtensions() []string {
    return []string{".txt", ".md"}
}
```

## Success Criteria

- [ ] PDF text extracted with page labels
- [ ] DOCX text extracted (single chunk for now)
- [ ] PPTX text extracted per slide with slide numbers
- [ ] TXT/MD text extracted as single chunk
- [ ] Parser interface allows dependency injection
- [ ] Unsupported types return nil parser from factory

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Corrupt PDF | Catch error per page, continue with others |
| Large DOCX | Memory-buffered parsing via go-docx |
| Malformed XML in PPTX | Regex filter + error handling per slide |
| Encoding issues | unipdf handles various PDF encodings |

## Security Considerations

1. **File path passed to parsers** - already sanitized by upload handler
2. **XML parsing** - use标准库, no external entities
3. **File handle leaks** - defer Close() on all file operations
4. **Memory** - stream ZIP reading for PPTX, buffered for PDF/DOCX