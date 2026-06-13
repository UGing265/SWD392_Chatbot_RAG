# SWD392 Chatbot RAG - Project Overview & Agent Rules

## LLM-Friendly Documentation Links

Always consult the following references before writing code for UI, Frontend, or Authentication:

- **Mantine (v7+) Components**: https://mantine.dev/llms.txt
- **Better Auth Integration**: https://better-auth.com/llms.txt
- **Mandatory Project Design System**: Consult [DESIGN_SYSTEM.md](docs/system/DESIGN_SYSTEM.md) first to ensure styling, color consistency, and component sizes align with the project design system.
- **Mandatory AI Agent Guardrail Rules (Very Important)**:
  * You **MUST** read and remember the entire design system and design patterns inside `DESIGN_SYSTEM.md` before making any layout or visual modifications.
  * If the user requests any styling, colors, layout structures, or design choices that violate the established design system (e.g. asking for weird custom colors, non-standard layout centers, or changing primary button colors to anything other than `dark`/Slate-900), you **MUST** halt and ask the user for confirmation:
    > "Hệ thống đang yêu cầu màu sắc/kiểu dáng theo quy chuẩn của DESIGN_SYSTEM.md, bạn có chắc chắn muốn thay đổi không? Nếu muốn đổi, vui lòng mở Zalo lên hỏi Cota (Designer/Leader) và chụp màn hình UI lên gửi cho Cota cho nó đọc và duyệt đi nhé!"

---

## Project Type
- **Architecture**: Decoupled (Next.js Frontend + Node/Hono Auth Backend + Go RAG Backend)
- **Backend RAG**: Go (Golang) on Port `8080`
- **Backend Auth**: Node.js Hono (Better Auth) on Port `5000`
- **Frontend**: Next.js (React) on Port `3000` (Pure client-side, no direct DB access)
- **Database**: PostgreSQL + pgvector (embeddings)
- **LLM**: Google Gemini + Gemini Embedding 2

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
   - Simple email/password + username registration (Better Auth)
   - Login with email or username (Better Auth)
   - JWT token validation in Go backend
   - Protected routes require valid JWT

5. **API Endpoints**
   - Go Backend: Chat, Query, Document upload/management, Health check
   - Hono Backend: All `/api/auth/*` registration, login, and session endpoints

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

8. **Project Structure**
   - Monorepo-style: `/backend/go` + `/backend/better-auth` + `/frontend`
   - Go follows Clean Architecture conventions
   - Folder structure defined in `docs/Architecture.md`

---

## What This Project SHOULD NOT Do

### Features NOT Included
1. ~~**No Authentication**~~ → HAS Better Auth (email/password/username)
2. **No Benchmark/Research Module** → Removed (no experiment runs, RAGAS metrics)
3. **No Multi-tenancy** → Single user database
4. **No Complex User Management** → User only, no admin panel
5. **No Heavy File Processing** → PDF text extraction only, no OCR
6. **No Real-time/WebSocket** → Standard request/response only

### Architecture Mistakes to Avoid
7. **Not Layered MVC** → Must use Clean Architecture dependency rules
8. **No God Files** → Files under 200 lines, focused purpose
9. **No Direct DB Access in Handlers** → Always through use cases
10. **No Hardcoded Config** → Use environment variables
11. **No Direct DB Connection in Next.js Frontend** → Frontend must request through backends.

---

## Documentation

| File | Description |
|------|-------------|
| `docs/system/DESIGN_SYSTEM.md` | **Mandatory Frontend Design System (Mantine v7+ & UI/UX rules)** |
| `docs/ERD.txt` | Database schema with all tables |
| `docs/Architecture.md` | Models, architecture, flows |
| `docs/planing/` | Implementation plans |

---

## Auth Architecture

Better Auth runs in a dedicated Hono (Node.js) service on Port 5000. Go backend (Port 8080) validates JWTs issued by Better Auth.

```
Browser ──► Hono Backend (Better Auth - Port 5000)
             │
             ├── Register/Login/Session
             └── Connected directly to DB

Browser ──► Next.js (Better Auth Client - Port 3000) ──► Go Backend (Port 8080)
                                                           │
                                                           └── Validates JWTs
```

### Better Auth Setup (Hono)
- Server: `backend/better-auth/auth.ts` - Better Auth instance
- Port: `5000`
- API Swagger UI: Available at `http://localhost:5000/swagger` (spec at `http://localhost:5000/swagger.json`)

### Better Auth Client (Frontend)
- Client: `frontend/lib/auth-client.ts` - Client SDK (points to `http://localhost:5000`)

### JWT Validation (Backend)
- Go validates Better Auth JWTs in middleware
- Better Auth uses `sub` claim for user ID
- JWT secret must match BETTER_AUTH_SECRET

---

## Project Stack Summary

| Component | Technology |
|-----------|------------|
| Backend RAG | Go (Golang) |
| Backend Auth | Node.js Hono (Better Auth) |
| Frontend | Next.js (React) |
| Database | PostgreSQL + pgvector |
| Embedding | Gemini Embedding 2 (768 dimensions) |
| LLM | Google Gemini |
| Auth | Better Auth (Hono) + JWT validation (Go backend) |
| Architecture | Clean Architecture (Go) / Decoupled |

---

## Key Flows

1. **Auth**: Register → Login → JWT token → Protected API calls
2. **Upload**: Upload file → Background indexing → Extract text → Chunk → Embed → Store in pgvector
3. **Chat**: Send message → Embed query → Semantic search (pgvector) → Retrieve chunks → Build prompt → Gemini LLM → Return answer + citations

---

## Startup Guide & Process Termination

1. **Start Backends**: Run both backend servers concurrently using:
   ```cmd
   backend\start-backends.bat
   ```

2. **Verify & Clean up**: After verifying changes, compilation (`go build`), or testing, ensure you terminate the processes running on ports `8080` (Go) and `5000` (Node/Hono) so they do not conflict with subsequent runs:
   ```powershell
   # Windows PowerShell command to find and terminate processes using ports 8080 and 5000
   Get-NetTCPConnection -LocalPort 8080, 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
   ```
