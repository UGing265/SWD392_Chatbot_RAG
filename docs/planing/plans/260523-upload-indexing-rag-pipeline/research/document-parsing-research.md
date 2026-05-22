# Research: Document Parsing Libraries for Go

## 1. PDF Text Extraction

### Recommended: `unidoc/unipdf` (v4)

**Strengths:**
- Best text extraction quality with position information
- Table extraction built-in
- Returns structured `PageText` with paragraph and font metadata
- Handles various PDF encodings

**Usage Pattern:**
```go
import (
    "github.com/unidoc/unipdf/v4/extractor"
    "github.com/unidoc/unipdf/v4/model"
)

func extractPDF(path string) (string, error) {
    f, err := os.Open(path)
    if err != nil {
        return "", err
    }
    defer f.Close()

    reader, err := model.NewPdfReader(f)
    if err != nil {
        return "", err
    }

    var sb strings.Builder
    numPages, _ := reader.GetNumPages()

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

        sb.WriteString(fmt.Sprintf("--- Page %d ---\n%s\n", i, pageText.Text()))
    }
    return sb.String(), nil
}
```

**Note:** unipdf is AGPL licensed. For commercial use, consider `pdfcpu` (Apache 2.0).

### Alternative: `pdfcpu/pdfcpu`

- Apache 2.0 license (permissive)
- Good for basic text extraction
- Supports page selection

## 2. DOCX Parsing

### Recommended: `fumiama/go-docx`

**Strengths:**
- Simple API for text extraction
- Handles paragraphs and tables
- MIT license

**Usage Pattern:**
```go
import "github.com/fumiama/go-docx"

func extractDOCX(path string) (string, error) {
    readFile, err := os.Open(path)
    if err != nil {
        return "", err
    }
    defer readFile.Close()

    fileinfo, err := readFile.Stat()
    if err != nil {
        return "", err
    }

    doc, err := docx.Parse(readFile, fileinfo.Size())
    if err != nil {
        return "", err
    }

    var sb strings.Builder
    for _, it := range doc.Document.Body.Items {
        switch it.(type) {
        case *docx.Paragraph, *docx.Table:
            sb.WriteString(fmt.Sprintf("%v\n", it))
        }
    }
    return sb.String(), nil
}
```

## 3. PPTX Parsing

**No dedicated pure-Go PPTX parser found.** Workarounds:

1. **Use `archive/zip` to read PPTX as XML directly:**

```go
import (
    "archive/zip"
    "encoding/xml"
    "io"
    "strings"
)

func extractPPTX(path string) (string, error) {
    r, err := zip.OpenReader(path)
    if err != nil {
        return "", err
    }
    defer r.Close()

    var sb strings.Builder

    for _, f := range r.File {
        if f.Name == "ppt/slides/slide*.xml" {
            rc, err := f.Open()
            if err != nil {
                continue
            }
            data, _ := io.ReadAll(rc)
            rc.Close()

            // Parse slide XML and extract text
            var slide struct {
                XMLName xml.Name `xml:"p:sld"`
                Text    string   `xml:"a:t"`
            }
            xml.Unmarshal(data, &slide)
            sb.WriteString(slide.Text + "\n")
        }
    }
    return sb.String(), nil
}
```

## 4. Plain Text and Markdown

**Simple file read:**
```go
func extractTXT(path string) (string, error) {
    data, err := os.ReadFile(path)
    return string(data), err
}

func extractMD(path string) (string, error) {
    data, err := os.ReadFile(path)
    return string(data), err
}
```

## 5. Library Recommendations Summary

| Format | Library | License | Notes |
|--------|---------|---------|-------|
| PDF | `unidoc/unipdf` | AGPL | Best extraction quality |
| PDF (alt) | `pdfcpu/pdfcpu` | Apache 2.0 | Permissive license |
| DOCX | `fumiama/go-docx` | MIT | Simple extraction |
| PPTX | `archive/zip` + XML | Stdlib | DIY extraction |
| TXT | `os.ReadFile` | Stdlib | Native |
| Markdown | `os.ReadFile` | Stdlib | Raw text for RAG |

## 6. Parser Interface Design

```go
// internal/infrastructure/fileparser/parser.go
type Parser interface {
    Extract(path string) ([]ExtractionResult, error)
    SupportedExtensions() []string
}

type ExtractionResult struct {
    Content   string
    PageLabel string  // e.g., "p. 78" or "Slide 12"
}

func NewParser(ext string) Parser {
    switch strings.ToLower(ext) {
    case ".pdf": return &PDFParser{}
    case ".docx": return &DOCXParser{}
    case ".pptx": return &PPTXParser{}
    case ".txt", ".md": return &TextParser{}
    default: return nil
    }
}
```