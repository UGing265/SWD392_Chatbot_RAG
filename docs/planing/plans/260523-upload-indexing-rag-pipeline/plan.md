# Plan: Upload & Indexing RAG Pipeline

**Date:** 2026-05-23
**Project:** SWD392 Chatbot RAG
**Focus:** Document upload, parsing, chunking, embedding, and indexing pipeline

## Overview

Implements the document upload and RAG indexing pipeline per Architecture.md. Documents flow: Upload → Parse → Chunk → Embed → Index in pgvector → Retrieve on query.

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 01 | File Upload Handler | ✅ Complete |
| 02 | Document Parser Infrastructure | ✅ Complete |
| 03 | Text Chunking Service | ✅ Complete |
| 04 | Gemini Embedding Client | ✅ Complete |
| 05 | Indexing Use Case (Orchestration) | ✅ Complete |
| 06 | RAG Retrieval (Search) | ✅ Complete |
| 07 | API Integration & Health Check | ✅ Complete |

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| File storage | Local disk `uploads/{course_id}/{uuid}.ext` | Simple, per spec |
| File type detection | Magic bytes via `mimetype` | More secure than extension-only |
| PDF parsing | `unidoc/unipdf` | Best text extraction quality |
| DOCX parsing | `fumiama/go-docx` | Simple API, MIT license |
| PPTX parsing | `archive/zip` + XML | DIY but no external dependency |
| Chunk size | 500 tokens, 100 overlap | Balance granularity/context |
| Chunking strategy | Recursive separator | Respects natural boundaries |
| Embedding | Gemini Embedding 2 via HTTP | 768-dim vectors for pgvector |
| Search index | IVF with `vector_cosine_ops` | Cosine distance for semantic search |

## Research Reports

- `research/file-upload-research.md` - Upload handling, path traversal prevention
- `research/document-parsing-research.md` - PDF/DOCX/PPTX extraction libraries
- `research/pgvector-research.md` - Similarity search SQL patterns, Go implementation
- `research/text-chunking-research.md` - Chunking strategies, token counting, deduplication
- `research/gemini-embedding-research.md` - API client, batching, error handling

## Dependencies

- Go stdlib (`net/http`, `mime/multipart`, `archive/zip`)
- `github.com/google/uuid` - UUID generation
- `github.com/gabriel-vasile/mimetype` - MIME detection
- `github.com/unidoc/unipdf/v4` - PDF extraction
- `github.com/fumiama/go-docx` - DOCX extraction
- `github.com/pgvector/pgvector-go` - pgvector types

## Next Steps

→ `phase-01-file-upload-handler.md`