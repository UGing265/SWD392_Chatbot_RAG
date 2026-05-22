# Phase 07: API Integration & Health Check

## Context Links

- `../plan.md` - Plan overview

## Overview

- **Priority:** Medium
- **Current status:** Pending
- **Brief description:** Integrate all phases into working API endpoints with health check and end-to-end testing.

## Requirements

### Functional
- POST `/api/documents/upload` - Upload and index document
- GET `/api/documents` - List user's documents
- GET `/api/documents/:id` - Get document status
- DELETE `/api/documents/:id` - Delete document and chunks
- GET `/api/documents/:id/chunks` - Get document chunks (for debugging)
- GET `/api/health` - Health check with dependency status

### Non-Functional
- All endpoints protected by JWT (except /health)
- Proper error responses with status codes
- Document status tracking for UI progress

## Related Code Files

### Existing Files to Modify
- `backend/internal/interface/router.go` - Wire all document routes
- `backend/internal/interface/handler/health-handler.go` - Add health check
- `backend/cmd/server/main.go` - Wire dependencies

## Implementation Steps

### 1. Document Routes (router.go)
```go
// internal/interface/router.go
func SetupRouter(
    authHandler *handler.AuthHandler,
    docHandler *handler.DocumentHandler,
    chatHandler *handler.ChatHandler,
    healthHandler *handler.HealthHandler,
    jwtMiddleware *middleware.JWTMiddleware,
) *Router {
    r := &Router{mux.New()}

    // Public routes
    r.HandleFunc("/api/health", healthHandler.Health)
    r.HandleFunc("/api/auth/register", authHandler.Register).Methods("POST")
    r.HandleFunc("/api/auth/login", authHandler.Login).Methods("POST")

    // Protected routes
    api := r.PathPrefix("/api").Subrouter()
    api.Use(jwtMiddleware.Handler())

    // Document routes
    docs := api.PathPrefix("/documents").Subrouter()
    docs.GET("", docHandler.List)
    docs.GET("/{id}", docHandler.Get)
    docs.POST("/upload", docHandler.Upload)
    docs.DELETE("/{id}", docHandler.Delete)
    docs.GET("/{id}/chunks", docHandler.GetChunks)

    // Chat routes
    sessions := api.PathPrefix("/chat/sessions").Subrouter()
    sessions.GET("", chatHandler.List)
    sessions.POST("", chatHandler.Create)
    sessions.GET("/{id}", chatHandler.Get)
    sessions.GET("/{id}/messages", chatHandler.GetHistory)
    sessions.POST("/{id}/messages", chatHandler.SendMessage)

    return r
}
```

### 2. Health Handler
```go
// internal/interface/handler/health-handler.go
type HealthHandler struct {
    db     *database.PostgresDB
}

type HealthResponse struct {
    Status    string            `json:"status"`
    Version   string            `json:"version"`
    Uptime    string            `json:"uptime"`
    Services  map[string]string `json:"services"`
}

func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
    resp := HealthResponse{
        Status:  "ok",
        Version: "1.0.0",
        Uptime:  getUptime(),
        Services: map[string]string{
            "database": "unknown",
        },
    }

    // Check database
    if err := h.db.Ping(r.Context()); err != nil {
        resp.Status = "degraded"
        resp.Services["database"] = fmt.Sprintf("error: %v", err)
    } else {
        resp.Services["database"] = "ok"
    }

    w.Header().Set("Content-Type", "application/json")
    if resp.Status == "ok" {
        json.NewEncoder(w).Encode(resp)
    } else {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(resp)
    }
}
```

### 3. Document Handler Methods (complete implementation)
```go
// internal/interface/handler/document-handler.go

// List returns all documents for the authenticated user.
func (h *DocumentHandler) List(w http.ResponseWriter, r *http.Request) {
    userID, _ := middleware.GetUserID(r.Context())

    docs, err := h.listUC.Execute(r.Context(), userID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(docs)
}

// Get returns a single document by ID.
func (h *DocumentHandler) Get(w http.ResponseWriter, r *http.Request) {
    _, _ = middleware.GetUserID(r.Context())

    id := mux.Vars(r)["id"]
    docID, err := uuid.Parse(id)
    if err != nil {
        http.Error(w, "invalid document ID", http.StatusBadRequest)
        return
    }

    doc, err := h.getUC.Execute(r.Context(), docID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(doc)
}

// Delete removes a document and its chunks.
func (h *DocumentHandler) Delete(w http.ResponseWriter, r *http.Request) {
    userID, _ := middleware.GetUserID(r.Context())

    id := mux.Vars(r)["id"]
    docID, err := uuid.Parse(id)
    if err != nil {
        http.Error(w, "invalid document ID", http.StatusBadRequest)
        return
    }

    if err := h.deleteUC.Execute(r.Context(), userID, docID); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

// GetChunks returns chunks for a document (for debugging/UI).
func (h *DocumentHandler) GetChunks(w http.ResponseWriter, r *http.Request) {
    id := mux.Vars(r)["id"]
    docID, err := uuid.Parse(id)
    if err != nil {
        http.Error(w, "invalid document ID", http.StatusBadRequest)
        return
    }

    chunks, err := h.getChunksUC.Execute(r.Context(), docID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(chunks)
}
```

### 4. Main.go Wiring
```go
// cmd/server/main.go
func main() {
    // Load config
    cfg := config.Load()

    // Initialize database
    db, err := database.NewPostgresDB(cfg.DatabaseURL)
    if err != nil {
        log.Fatalf("failed to connect database: %v", err)
    }

    // Initialize infrastructure
    fileStorage := infrastructure.NewLocalFileStorage(cfg.UploadDir)
    embeddingClient := embedding.NewGeminiEmbeddingClient(cfg.GeminiAPIKey)
    parserFactory := fileparser.NewParserFactory()
    chunker := chunker.NewSplitter(500, 100)

    // Initialize repositories
    userRepo := postgres.NewUserRepository(db)
    docRepo := postgres.NewDocumentRepository(db)
    chunkRepo := postgres.NewChunkRepository(db)
    sessionRepo := postgres.NewChatSessionRepository(db)
    messageRepo := postgres.NewMessageRepository(db)
    citationRepo := postgres.NewMessageCitationRepository(db)

    // Initialize use cases
    authUC := application.NewAuthUseCase(userRepo, cfg.JWTSecret)
    uploadUC := application.NewUploadDocumentUseCase(docRepo, fileStorage, indexingUC)
    listUC := application.NewListDocumentsUseCase(docRepo)
    getUC := application.NewGetDocumentUseCase(docRepo)
    deleteUC := application.NewDeleteDocumentUseCase(docRepo, chunkRepo, fileStorage)
    indexingUC := application.NewIndexingUseCase(docRepo, chunkRepo, parserFactory, chunker, embeddingClient)
    searchUC := application.NewSearchUseCase(chunkRepo, embeddingClient)
    chatUC := application.NewChatUseCase(sessionRepo, messageRepo, citationRepo, searchUC, llmClient)

    // Initialize handlers
    authHandler := handler.NewAuthHandler(authUC)
    docHandler := handler.NewDocumentHandler(uploadUC, listUC, getUC, deleteUC, getChunksUC, fileStorage)
    chatHandler := handler.NewChatHandler(chatUC)
    healthHandler := handler.NewHealthHandler(db)

    // Initialize middleware
    jwtMiddleware := middleware.NewJWTMiddleware(cfg.JWTSecret)

    // Setup router
    router := interface.SetupRouter(authHandler, docHandler, chatHandler, healthHandler, jwtMiddleware)

    // Start server
    log.Printf("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

## Success Criteria

- [ ] All document CRUD endpoints functional
- [ ] JWT authentication enforced on protected routes
- [ ] Health check returns database status
- [ ] Document status correctly reflects indexing progress
- [ ] Chunks retrievable for debugging/UI

## Migration SQL (Run on Deployment)
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables (from ERD.txt)
CREATE TABLE IF NOT EXISTS users (...);
CREATE TABLE IF NOT EXISTS courses (...);
CREATE TABLE IF NOT EXISTS chapters (...);
CREATE TABLE IF NOT EXISTS documents (...);
CREATE TABLE IF NOT EXISTS chunks (...);
CREATE TABLE IF NOT EXISTS chat_sessions (...);
CREATE TABLE IF NOT EXISTS messages (...);
CREATE TABLE IF NOT EXISTS message_citations (...);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_course_id ON documents(course_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
```

## Summary

| Phase | Status | Key Files |
|-------|--------|------------|
| 01 | ✅ Complete | `document-handler.go`, DTOs |
| 02 | ✅ Complete | `fileparser/*.go` |
| 03 | ✅ Complete | `chunker/*.go` |
| 04 | ✅ Complete | `embedding/gemini-embedding.go` |
| 05 | ✅ Complete | `indexing-usecase/process.go` |
| 06 | ✅ Complete | `indexing-usecase/search.go`, `send-message.go` |
| 07 | ✅ Complete | `router.go`, `main.go`, `health-handler.go` |