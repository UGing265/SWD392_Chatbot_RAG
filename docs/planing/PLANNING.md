# Planning Guide for SWD392 Chatbot RAG

When using `/plan` command, read this file for complete project context.

---

## Project Overview

**Name:** SWD392 Chatbot RAG
**Type:** Full-stack Monolith Chatbot for Question Answering based on course materials
**Stack:** Go (backend) + Next.js (frontend) + PostgreSQL/pgvector + Gemini LLM
**Auth:** Simple email/password authentication (login/register with JWT)

---

## What This Project SHOULD Do

### Core Features
1. **RAG Pipeline** - Ingest documents → Gemini Embedding 2 → pgvector → Gemini LLM → answers with citations
2. **Document Management** - Upload PDF/DOCX/PPTX/TXT/MD, chunk, index, delete
3. **Chat Interface** - Sessions, conversation history, source citations
4. **Authentication** - Simple email/password registration, login with JWT
5. **API Endpoints** - Auth, document, chat, health

### Architecture & Quality
6. **Clean Architecture** (Go backend)
   - Domain layer (entities, repository interfaces)
   - Application layer (use cases)
   - Infrastructure layer (repository implementations, external services)
   - Interface layer (HTTP handlers, DTOs, middleware)
7. **Code Quality** - No syntax errors, compile, unit tests, env vars config

### Structure
8. **Monorepo-style:** `/backend` (Go) + `/frontend` (Next.js)

---

## What This Project SHOULD NOT Do

### Features NOT Included
1. ~~No Authentication~~ → HAS simple email/password + JWT
2. **No Benchmark/Research Module** → Removed (no experiment runs, RAGAS metrics)
3. **No Multi-tenancy** → Single user database
4. **No Complex User Management** → User only, no admin panel
5. **No Heavy File Processing** → PDF text extraction only, no OCR
6. **No Real-time/WebSocket** → Standard request/response only
7. **No Microservices** → Single monolith deployment

### Architecture Mistakes to Avoid
8. **Not Layered MVC** → Must use Clean Architecture dependency rules
9. **No God Files** → Files under 200 lines, focused purpose
10. **No Direct DB Access in Handlers** → Always through use cases
11. **No Hardcoded Config** → Use environment variables

---

## Key Entities

| Entity | Fields | Purpose |
|--------|--------|---------|
| **User** | id, email, password_hash, name, created_at, updated_at | Auth accounts |
| **Course** | id, name, textbook, created_at | Demo 1 course (SWD392) |
| **Chapter** | id, course_id, title, chapter_no | Chapters within course |
| **Document** | id, user_id, course_id, chapter_id, file_name, file_type, file_path, status, chunk_count, embedding_count, uploaded_at, indexed_at | Uploaded file tracking |
| **Chunk** | id, document_id, chapter_id, content, page_label, chunk_index, embedding (vector 768), created_at | Text pieces with embeddings |
| **ChatSession** | id, user_id, course_id, title, is_starred, status, created_at, updated_at | Conversation threads |
| **Message** | id, session_id, role (user/bot), content, token_count, out_of_scope, created_at | Questions and answers |
| **MessageCitation** | id, message_id, chunk_id, relevance_score, excerpt | Source citations |

---

## RAG Pipeline Flow

```
1. Upload Document
   User → POST /api/documents/upload → save file → create Document (status=uploading)

2. Background Indexing
   Worker → extract text (PDF/DOCX/PPTX) → chunk (500 tokens) → Gemini Embedding 2 → store pgvector → update status=indexed

3. Chat (RAG)
   User → POST /api/chat/sessions/:id/messages → embed query → semantic search pgvector → top-K chunks → build prompt → Gemini LLM → answer + citations → save message
```

---

## Features Checklist

### MUST HAVE
- [ ] Auth: register, login, JWT protection
- [ ] Document: upload, list user's documents, delete
- [ ] Chat: create session, send message (RAG), get history
- [ ] Citations: show source (file, page, excerpt) for each bot answer

### MUST NOT HAVE
- [ ] Benchmark/research module (experiment_runs, RAGAS)
- [ ] Multi-tenant isolation
- [ ] WebSocket/real-time features
- [ ] Admin panels for user management

---

## Constraints

1. **Clean Architecture** - dependencies point inward only (interface → application → domain ← infrastructure)
2. **No God Files** - files under 200 lines
3. **No Direct DB in Handlers** - always through use cases → repositories
4. **No Hardcoded Config** - use environment variables
5. **No Layered MVC** - must follow Clean Architecture rules

---

## Go Backend Structure

```
backend/
├── cmd/server/
│   └── main.go                 # Entry point, wire dependencies
├── internal/
│   ├── domain/                 # Entities + repository interfaces
│   │   ├── user/
│   │   │   ├── entity.go
│   │   │   └── repository.go
│   │   ├── course/
│   │   ├── chapter/
│   │   ├── document/
│   │   ├── chunk/
│   │   ├── chat-session/
│   │   │   ├── entity.go
│   │   │   └── repository.go
│   │   └── message/
│   │       ├── entity.go
│   │       └── repository.go
│   ├── application/           # Use cases
│   │   ├── auth-usecase/
│   │   │   ├── register.go
│   │   │   └── login.go
│   │   ├── document-usecase/
│   │   │   ├── upload.go
│   │   │   ├── get-list.go
│   │   │   └── delete.go
│   │   ├── chat-usecase/
│   │   │   ├── create-session.go
│   │   │   ├── send-message.go   # RAG pipeline
│   │   │   └── get-history.go
│   │   └── indexing-usecase/
│   │       └── process.go
│   ├── infrastructure/         # Implementations
│   │   ├── repository/
│   │   │   └── postgres/
│   │   │       ├── user-repo.go
│   │   │       ├── document-repo.go
│   │   │       ├── chunk-repo.go
│   │   │       └── chat-repo.go
│   │   ├── embedding/
│   │   │   └── gemini-embedding.go
│   │   ├── llm/
│   │   │   └── gemini-llm.go
│   │   └── fileparser/
│   │       ├── pdf.go
│   │       ├── docx.go
│   │       └── pptx.go
│   └── interface/             # Adapters
│       ├── handler/
│       │   ├── auth-handler.go
│       │   ├── document-handler.go
│       │   ├── chat-handler.go
│       │   └── health-handler.go
│       ├── middleware/
│       │   └── auth.go        # JWT validation
│       ├── dto/
│       │   ├── request/
│       │   └── response/
│       └── router.go
├── pkg/
│   ├── config/
│   │   └── env.go
│   ├── database/
│   │   └── postgres.go
│   ├── vector/
│   │   └── pgvector.go
│   └── jwt/
│       └── jwt.go
└── migrations/
    └── 001_initial.sql
```

---

## Next.js Frontend Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   └── chat/
│   │       ├── page.tsx
│   │       └── [sessionId]/
│   └── api/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── chat/
│   │   ├── chat-window.tsx
│   │   ├── message.tsx
│   │   └── citation.tsx
│   └── document/
│       ├── upload-form.tsx
│       └── document-list.tsx
├── lib/
│   ├── api.ts                 # API client
│   └── auth.ts                # Auth utilities
└── types/
    └── api.ts                  # TypeScript types
```

---

## API Endpoints

### Auth (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |

### Documents (protected - JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List user's documents |
| GET | `/api/documents/:id` | Get document detail |
| POST | `/api/documents/upload` | Upload file (multipart/form-data) |
| DELETE | `/api/documents/:id` | Delete document |

### Chat (protected - JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/sessions` | List user's sessions |
| POST | `/api/chat/sessions` | Create new session |
| GET | `/api/chat/sessions/:id` | Get session details |
| GET | `/api/chat/sessions/:id/messages` | Get chat history |
| POST | `/api/chat/sessions/:id/messages` | Send message (RAG pipeline) |

### Health (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health check |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgres://user:pass@localhost:5432/swd392

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=24h

# Gemini
GEMINI_API_KEY=your-api-key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800  # 50MB
```

---

## Success Criteria

1. User can register and login with email/password
2. User receives JWT token on login
3. Protected routes reject requests without valid JWT
4. User can upload PDF/DOCX/PPTX file
5. Background worker indexes document (chunk + embed)
6. Document status shows "indexed" after processing
7. User can create chat session for a course
8. User can send message and receive RAG answer
9. Bot answers include citations with file name, page, excerpt
10. User can view full chat history with citations
11. Code compiles without syntax errors
12. Unit tests pass for core use cases (auth, document, chat)

---

## Reference Documents

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file - project overview |
| `docs/ERD.txt` | Database schema with SQL |
| `docs/Architecture.md` | Full architecture, models, flows |
| `docs/bao/` | Reference from C# project (similar requirements) |