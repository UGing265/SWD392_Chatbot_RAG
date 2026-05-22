# SWD392 Chatbot RAG - Models, Architecture & Flows

## Overview

This document describes:
1. All data models (entities)
2. Clean Architecture structure for Go backend
3. All system flows (upload, indexing, chat, auth)

---

## Part 1: Data Models

### 1.1 Core Entities

```
┌─────────────┐
│    User     │ ← accounts for login/register
└─────────────┘
     │
     ├────── owns ─────→ documents
     └────── owns ─────→ chat_sessions

┌─────────────┐
│   Course    │ ← demo 1 course (SWD392)
└─────────────┘
     │
     ├────── has ─────→ chapters
     ├────── has ─────→ documents
     └────── has ─────→ chat_sessions

┌─────────────┐
│   Chapter   │ ← chapters in course
└─────────────┘
     │
     └────── groups ─────→ documents (optional)
     └────── groups ─────→ chunks (optional)

┌─────────────┐
│  Document   │ ← uploaded file with status
└─────────────┘
     │
     └────── splits into ─────→ chunks

┌─────────────┐
│    Chunk    │ ← text piece + embedding vector
└─────────────┘
     │
     └────── cited by ─────→ message_citations

┌─────────────┐
│ ChatSession │ ← conversation thread
└─────────────┘
     │
     └────── contains ─────→ messages

┌─────────────┐
│   Message   │ ← user question or bot answer
└─────────────┘
     │
     └────── cites ─────→ message_citations
```

---

### 1.2 Model Definitions

#### User
```go
type User struct {
    ID           uuid.UUID `json:"id" db:"id"`
    Email        string    `json:"email" db:"email"`
    PasswordHash string    `json:"-" db:"password_hash"` // never expose
    Name         string    `json:"name" db:"name"`
    CreatedAt    time.Time `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}
```

#### Course
```go
type Course struct {
    ID        uuid.UUID `json:"id" db:"id"`
    Name      string    `json:"name" db:"name"`
    Textbook  string    `json:"textbook" db:"textbook"` // e.g., "Software Modeling and Design"
    CreatedAt time.Time `json:"created_at" db:"created_at"`
}
```

#### Chapter
```go
type Chapter struct {
    ID         uuid.UUID  `json:"id" db:"id"`
    CourseID   uuid.UUID  `json:"course_id" db:"course_id"`
    Title      string     `json:"title" db:"title"` // e.g., "Chương 4 - Mô hình hoá"
    ChapterNo  *int       `json:"chapter_no" db:"chapter_no"` // nullable for "Tổng hợp"
    CreatedAt  time.Time  `json:"created_at" db:"created_at"`
}
```

#### Document
```go
type Document struct {
    ID             uuid.UUID  `json:"id" db:"id"`
    UserID         uuid.UUID  `json:"user_id" db:"user_id"` // who uploaded
    CourseID       uuid.UUID  `json:"course_id" db:"course_id"`
    ChapterID      *uuid.UUID `json:"chapter_id" db:"chapter_id"`
    FileName       string     `json:"file_name" db:"file_name"` // original name
    FileType       string     `json:"file_type" db:"file_type"` // PDF/DOCX/PPTX/TXT/MD
    FilePath       string     `json:"-" db:"file_path"` // server path
    Status         string     `json:"status" db:"status"` // uploading/chunking/embedding/indexed/error
    ChunkCount     int        `json:"chunk_count" db:"chunk_count"`
    EmbeddingCount int        `json:"embedding_count" db:"embedding_count"`
    ErrorMessage   *string    `json:"error_message,omitempty" db:"error_message"`
    UploadedAt     time.Time  `json:"uploaded_at" db:"uploaded_at"`
    IndexedAt      *time.Time `json:"indexed_at,omitempty" db:"indexed_at"`
}
```

#### Chunk
```go
type Chunk struct {
    ID          uuid.UUID  `json:"id" db:"id"`
    DocumentID  uuid.UUID  `json:"document_id" db:"document_id"`
    ChapterID   *uuid.UUID `json:"chapter_id" db:"chapter_id"`
    Content     string     `json:"content" db:"content"` // text content
    PageLabel   string     `json:"page_label" db:"page_label"` // e.g., "tr. 78" or "Slide 12"
    ChunkIndex  int        `json:"chunk_index" db:"chunk_index"` // order in document
    Embedding   []float32  `json:"-" db:"embedding"` // vector(768), never expose raw
    CreatedAt   time.Time  `json:"created_at" db:"created_at"`
}
```

#### ChatSession
```go
type ChatSession struct {
    ID        uuid.UUID `json:"id" db:"id"`
    UserID    uuid.UUID `json:"user_id" db:"user_id"`
    CourseID  uuid.UUID `json:"course_id" db:"course_id"`
    Title     string    `json:"title" db:"title"` // display name in UI
    IsStarred bool      `json:"is_starred" db:"is_starred"`
    Status    string    `json:"status" db:"status"` // active/done
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
```

#### Message
```go
type Message struct {
    ID           uuid.UUID `json:"id" db:"id"`
    SessionID    uuid.UUID `json:"session_id" db:"session_id"`
    Role         string    `json:"role" db:"role"` // user/bot
    Content      string    `json:"content" db:"content"` // question or answer
    TokenCount   *int      `json:"token_count,omitempty" db:"token_count"`
    OutOfScope   bool      `json:"out_of_scope" db:"out_of_scope"` // true if no context found
    CreatedAt    time.Time `json:"created_at" db:"created_at"`
}
```

#### MessageCitation
```go
type MessageCitation struct {
    ID              uuid.UUID `json:"id" db:"id"`
    MessageID       uuid.UUID `json:"message_id" db:"message_id"`
    ChunkID         uuid.UUID `json:"chunk_id" db:"chunk_id"`
    RelevanceScore  float64   `json:"relevance_score" db:"relevance_score"` // e.g., 0.9200
    Excerpt         string    `json:"excerpt" db:"excerpt"` // text shown to user
}
```

---

## Part 2: Clean Architecture (Go Backend)

### 2.1 Layer Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Entry point, wire dependencies
│
├── internal/
│   ├── domain/                  # Entities, repository interfaces
│   │   ├── user/
│   │   │   ├── entity.go
│   │   │   └── repository.go    # interface only
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
│   │
│   ├── application/             # Use cases, business logic
│   │   ├── auth-usecase/
│   │   │   ├── register.go
│   │   │   └── login.go
│   │   ├── document-usecase/
│   │   │   ├── upload.go
│   │   │   ├── get-list.go
│   │   │   ├── get-detail.go
│   │   │   └── delete.go
│   │   ├── chat-usecase/
│   │   │   ├── create-session.go
│   │   │   ├── send-message.go
│   │   │   └── get-history.go
│   │   └── indexing-usecase/
│   │       ├── process.go       # background job
│   │       └── search.go
│   │
│   ├── infrastructure/          # Implementations of domain interfaces
│   │   ├── repository/
│   │   │   ├── postgres/
│   │   │   │   ├── user-repo.go
│   │   │   │   ├── document-repo.go
│   │   │   │   ├── chunk-repo.go
│   │   │   │   ├── chat-repo.go
│   │   │   │   └── message-repo.go
│   │   │   └── interfaces.go    # implements domain repository interfaces
│   │   ├── embedding/
│   │   │   └── gemini-embedding.go  # calls Gemini Embedding 2 API
│   │   ├── llm/
│   │   │   └── gemini-llm.go        # calls Gemini LLM API
│   │   └── fileparser/
│   │       ├── pdf.go
│   │       ├── docx.go
│   │       └── pptx.go
│   │
│   └── interface/               # Adapters (HTTP handlers, DTOs)
│       ├── handler/
│       │   ├── auth-handler.go
│       │   ├── document-handler.go
│       │   ├── chat-handler.go
│       │   └── health-handler.go
│       ├── middleware/
│       │   └── auth.go          # JWT validation
│       ├── dto/
│       │   ├── request/
│       │   │   ├── register.go
│       │   │   ├── login.go
│       │   │   ├── upload.go
│       │   │   └── message.go
│       │   └── response/
│       │       ├── auth.go
│       │       ├── document.go
│       │       └── chat.go
│       └── router.go            # route definitions
│
├── pkg/
│   ├── config/
│   │   └── env.go               # load env vars
│   ├── database/
│   │   └── postgres.go          # pgx connection
│   ├── vector/
│   │   └── pgvector.go         # pgvector helpers
│   └── jwt/
│       └── jwt.go               # JWT encode/decode
│
└── migrations/
    └── 001_initial.sql
```

### 2.2 Dependency Rule

```
┌─────────────────────────────────────────────────────┐
│                  Interface Layer                     │
│         (handlers) depends on ───────────────────────┼──→ application/use_cases
└─────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────┐
│                 Application Layer                    │
│     (use cases) depends on ─────────────────────────┼──→ domain/repositories (interfaces)
└─────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────┐
│                 Domain Layer                         │
│    (entities + interfaces) ──────────────────────────│
└─────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────┐
│              Infrastructure Layer                     │
│  (repo implementations) implements ────────────────┼──→ domain/repositories
└─────────────────────────────────────────────────────┘
```

**Key principle:** Inner layers define interfaces, outer layers implement them. Dependencies point inward only.

---

## Part 3: System Flows

### 3.1 Auth Flow (Login/Register)

```
┌─────────────────────────────────────────────────────────────────┐
│                         REGISTER                                 │
├─────────────────────────────────────────────────────────────────┤
│  User ──POST /api/auth/register {email, password, name}         │
│         │                                                        │
│         ▼                                                        │
│  [AuthHandler]                                                   │
│         │                                                        │
│         ▼                                                        │
│  [RegisterUseCase]                                               │
│         │                                                        │
│         ├── Validate input (email format, password length)        │
│         ├── Check email not exists ──→ error if exists           │
│         ├── Hash password (bcrypt)                               │
│         ├── Create User entity                                  │
│         └── Save to DB via UserRepository                        │
│         │                                                        │
│         ▼                                                        │
│  Return: {user_id, email, name, token}                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          LOGIN                                   │
├─────────────────────────────────────────────────────────────────┤
│  User ──POST /api/auth/login {email, password}                   │
│         │                                                        │
│         ▼                                                        │
│  [AuthHandler]                                                   │
│         │                                                        │
│         ▼                                                        │
│  [LoginUseCase]                                                  │
│         │                                                        │
│         ├── Find user by email ──→ error if not found           │
│         ├── Verify password (bcrypt compare)                     │
│         ├── Generate JWT token                                   │
│         └── Return: {user_id, email, name, token}                │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Document Upload & Indexing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     UPLOAD & INDEXING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User ──POST /api/documents/upload (multipart/form-data)          │
│          Header: Authorization: Bearer <jwt>                     │
│          Body: file, course_id, chapter_id?                      │
│          │                                                       │
│          ▼                                                       │
│  [DocumentHandler]                                               │
│          │                                                       │
│          ▼                                                       │
│  [UploadDocumentUseCase]                                         │
│          │                                                       │
│          ├── Validate JWT → get user_id                          │
│          ├── Validate file type (PDF/DOCX/PPTX/TXT/MD)          │
│          ├── Validate file size (max 50MB)                      │
│          ├── Save file to disk: uploads/{course_id}/{uuid}.ext   │
│          ├── Create Document entity (status="uploading")         │
│          ├── Save Document to DB                                │
│          └── Enqueue background job                             │
│          │                                                       │
│          ▼                                                       │
│  Return: {document_id, status: "uploading"}                     │
│                                                                  │
│  ────────── BACKGROUND WORKER ────────────────────────────────   │
│                                                                  │
│  [IndexingUseCase.ProcessDocument]                              │
│          │                                                       │
│          ├── Update status to "chunking"                         │
│          ├── Extract text from file:                             │
│          │    PDF  → pdf parser                                  │
│          │    DOCX → docx parser                                 │
│          │    PPTX → pptx parser                                │
│          │    TXT/MD → raw text read                            │
│          │                                                       │
│          ├── Split text into chunks (fixed-size 500 tokens)      │
│          │                                                       │
│          ├── For each chunk:                                     │
│          │    ├── Create Chunk entity                            │
│          │    ├── Call Gemini Embedding 2 API → vector[768]      │
│          │    ├── Save chunk + embedding to DB                  │
│          │    └── Update progress (chunk_count, embedding_count) │
│          │                                                       │
│          ├── Update status to "indexed"                         │
│          ├── Set indexed_at timestamp                            │
│          └── On error: status="error", save error_message       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Chat Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          CHAT                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User ──POST /api/chat/sessions                                  │
│          {course_id, title?}                                     │
│          │                                                       │
│          ▼                                                       │
│  [CreateSessionUseCase]                                         │
│          │                                                       │
│          ├── Create ChatSession entity                           │
│          ├── Link to user_id from JWT                           │
│          └── Save to DB                                         │
│          │                                                       │
│          ▼                                                       │
│  Return: {session_id, title, created_at}                         │
│                                                                  │
│  ────────────────────────────────────────────────────────────   │
│                                                                  │
│  User ──POST /api/chat/sessions/{id}/messages                    │
│          {content: "What is software modeling?"}                 │
│          │                                                       │
│          ▼                                                       │
│  [SendMessageUseCase]                                            │
│          │                                                       │
│          ├── Validate JWT → get user_id                          │
│          ├── Verify session belongs to user                     │
│          ├── Save Message (role="user", content)                │
│          │                                                       │
│          ├── ── RAG PIPELINE ────────────────────────────────    │
│          │                                                       │
│          │  ① EMBEDDING QUERY                                    │
│          │     Call Gemini Embedding 2 API                       │
│          │     text → vector[768]                                │
│          │                                                       │
│          │  ② SEMANTIC SEARCH                                    │
│          │     Query pgvector:                                    │
│          │     SELECT * FROM chunks                              │
│          │     WHERE course_id = $1                               │
│          │     ORDER BY embedding <=> query_vector               │
│          │     LIMIT 5;                                          │
│          │     → returns top-5 chunks with similarity scores     │
│          │                                                       │
│          │  ③ CHECK THRESHOLD                                     │
│          │     If max similarity < 0.6:                          │
│          │       → save Message (role="bot", out_of_scope=true)   │
│          │       → return: "Không tìm thấy thông tin..."        │
│          │                                                       │
│          │  ④ BUILD PROMPT                                       │
│          │     System: "Chỉ trả lời dựa trên tài liệu.           │
│          │            Nếu không có thông tin, nói 'Không tìm     │
│          │            thấy thông tin trong tài liệu.'"          │
│          │     Context: [top chunks content]                     │
│          │     History: [last 10 messages]                       │
│          │     Question: {user question}                          │
│          │                                                       │
│          │  ⑤ CALL GEMINI LLM                                    │
│          │     Send prompt → get answer                          │
│          │                                                       │
│          │  ⑥ SAVE CITATIONS                                     │
│          │     For each chunk used:                              │
│          │       → create MessageCitation record                 │
│          │                                                       │
│          ├── Save Message (role="bot", content=answer)          │
│          └── Update session.updated_at                           │
│          │                                                       │
│          ▼                                                       │
│  Return: {                                                       │
│    message_id,                                                   │
│    content: "Software modeling is...",                           │
│    citations: [                                                  │
│      {chunk_id, file_name, page_label, excerpt, score}           │
│    ],                                                            │
│    out_of_scope: false                                          │
│  }                                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Get Chat History Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      GET CHAT HISTORY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User ──GET /api/chat/sessions/{id}/messages                    │
│          Header: Authorization: Bearer <jwt>                    │
│          │                                                       │
│          ▼                                                       │
│  [GetChatHistoryUseCase]                                         │
│          │                                                       │
│          ├── Validate JWT                                        │
│          ├── Verify session belongs to user                     │
│          ├── Query messages by session_id                       │
│          ├── For each bot message, load citations                │
│          └── Return ordered list of messages + citations       │
│          │                                                       │
│          ▼                                                       │
│  Return: {                                                       │
│    session_id,                                                   │
│    messages: [                                                   │
│      {id, role: "user", content, created_at},                     │
│      {id, role: "bot", content, citations: [...], created_at}    │
│    ]                                                            │
│  }                                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 4: API Endpoints Summary

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | public | Create account |
| POST | `/api/auth/login` | public | Get JWT token |

### Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/documents` | protected | List user's documents |
| GET | `/api/documents/:id` | protected | Get document detail |
| POST | `/api/documents/upload` | protected | Upload new document |
| DELETE | `/api/documents/:id` | protected | Delete document |

### Chat
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/chat/sessions` | protected | List user's sessions |
| POST | `/api/chat/sessions` | protected | Create new session |
| GET | `/api/chat/sessions/:id` | protected | Get session details |
| GET | `/api/chat/sessions/:id/messages` | protected | Get chat history |
| POST | `/api/chat/sessions/:id/messages` | protected | Send message (RAG) |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | public | System health check |

---

## Part 5: Key Differences from Reference (C#)

| Aspect | Reference (C# 3-Layer) | This Project (Go Clean Architecture) |
|--------|------------------------|-------------------------------------|
| **Layer pattern** | DAL → BLL → Presentation | Domain → Application → Infrastructure → Interface |
| **DI** | Built-in .NET DI | Manual wiring in main.go |
| **Repo pattern** | Data layer implements | Infrastructure implements Domain interfaces |
| **Use cases** | Services in BLL | Use cases in Application layer |
| **Vector DB** | Qdrant/Chroma (separate) | pgvector (same DB) |
| **Embedding** | Local ONNX / OpenAI | Gemini Embedding 2 API only |
| **LLM** | OpenAI GPT / Claude | Gemini only |
| **No benchmark** | Has experiment_runs | Removed (no RBL module) |

---

## Part 6: Simplified vs Reference

Since you don't need benchmark/research module, these tables are **removed**:
- `experiment_runs`
- `test_sets`
- `test_questions`
- `experiment_question_results`
- `experiment_retrieved_chunks`
- `document_index_runs` (simplified - index status is in `documents`)

Simplified flow:
- `documents.status` directly tracks indexing state
- No multiple embedding models to compare
- No RAGAS metrics

This is appropriate for a **demo chatbot**, not a research tool.

---

## Part 7: Next Steps

1. ✅ Create `docs/ERD.txt` - entity definitions
2. ✅ Create `docs/Architecture.md` - this file
3. ⬜ Create `docs/Flows.md` - detailed flow diagrams (optional)
4. ⬜ Create folder structure
5. ⬜ Implement backend
6. ⬜ Implement frontend