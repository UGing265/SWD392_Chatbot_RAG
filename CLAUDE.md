# SWD392 Chatbot RAG - Project Overview

## Project Type
- **Architecture**: Full-stack Monolith (Clean Architecture)
- **Backend**: Go (Golang)
- **Frontend**: Next.js
- **Database**: PostgreSQL + pgvector (embeddings)
- **LLM**: Google Gemini + Gemini Embedding 2
- **Auth**: Simple email/password authentication (login/register with JWT)

---

## What This Project SHOULD Do

### Core Features
1. **RAG (Retrieval-Augmented Generation) Pipeline**
   - Ingest documents/text into the system
   - Generate embeddings using Gemini Embedding 2
   - Store embeddings in pgvector (PostgreSQL)
   - Retrieve relevant context based on user query
   - Generate AI responses using Gemini LLM with retrieved context

2. **Document Management**
   - Upload documents (PDF, DOCX, PPTX, TXT, Markdown)
   - Chunk documents into manageable pieces
   - Index and store embeddings
   - Delete/manage document corpus

3. **Chat Interface**
   - User-friendly web interface (Next.js frontend)
   - Chat session management per user
   - Display conversation history with citations
   - Answers grounded in source documents

4. **Authentication**
   - Simple email/password registration
   - Login with JWT token
   - Protected routes require valid JWT

5. **API Endpoints (Go Backend)**
   - Auth: register, login
   - Document upload/management
   - Chat/query endpoints
   - Health check

### Architecture & Quality
6. **Clean Architecture** (Go backend)
   - Domain layer (entities, repository interfaces)
   - Application layer (use cases)
   - Infrastructure layer (repository implementations, external services)
   - Interface layer (HTTP handlers, DTOs, middleware)

7. **Code Quality**
   - No syntax errors, code must compile
   - Unit tests for core business logic
   - Error handling with meaningful messages
   - Configuration via environment variables

### Structure
8. **Project Structure**
   - Monorepo-style: `/backend` (Go) + `/frontend` (Next.js)
   - Go follows Clean Architecture conventions
   - Folder structure defined in `docs/Architecture.md`

---

## What This Project SHOULD NOT Do

### Features NOT Included
1. ~~**No Authentication**~~ → HAS simple email/password + JWT
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

## Documentation

| File | Description |
|------|-------------|
| `docs/ERD.txt` | Database schema with all tables |
| `docs/Architecture.md` | Models, architecture, flows |
| `docs/bao/` | Reference documents (C# project) |

---

## Project Stack Summary

| Component | Technology |
|-----------|------------|
| Backend | Go (Golang) |
| Frontend | Next.js (React) |
| Database | PostgreSQL + pgvector |
| Embedding | Gemini Embedding 2 (768 dimensions) |
| LLM | Google Gemini |
| Auth | JWT (simple email/password) |
| Architecture | Clean Architecture |

---

## Key Flows

1. **Auth**: Register → Login → JWT token → Protected API calls
2. **Upload**: Upload file → Background indexing → Extract text → Chunk → Embed → Store in pgvector
3. **Chat**: Send message → Embed query → Semantic search (pgvector) → Retrieve chunks → Build prompt → Gemini LLM → Return answer + citations

---

## Next Steps
- [ ] Create folder structure for backend + frontend
- [ ] Implement Go backend with Clean Architecture
- [ ] Implement Next.js frontend
- [ ] Write unit tests
- [ ] Integration testing