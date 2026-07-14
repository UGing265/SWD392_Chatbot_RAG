# SWD392 Chatbot RAG

A Retrieval-Augmented Generation (RAG) Chatbot project featuring a decoupled architecture.

## Architecture

- **Frontend**: Next.js (React) on Port 3000
- **Backend RAG**: Go (Golang) on Port 8080 (Clean Architecture)
- **Backend Auth**: Node.js Hono (Better Auth) on Port 5000
- **Database**: PostgreSQL with pgvector for embeddings
- **AI Models**: Google Gemini & Gemini Embedding 2

## Getting Started

1. **Start Backends**: Run both backend servers concurrently using the provided script from the project root:

   ```bash
   backend\start-backends.bat
   ```

2. **Start Frontend**: Navigate to the `frontend` directory and start the Next.js development server:

   ```bash
   cd frontend
   npm run dev
   ```

## Documentation

- **Frontend Design System**: `docs/system/DESIGN_SYSTEM.md`
- **Backend Architecture Rules**: `docs/system/BACKEND_SYSTEM.md`
- **Database ERD**: `docs/ERD.txt`
