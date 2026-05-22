-- Initial database schema for SWD392 Chatbot RAG
-- Run this in PostgreSQL to create all tables

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    textbook VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    chapter_no INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    chapter_id UUID REFERENCES chapters(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    file_path TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'uploading',
    chunk_count INTEGER DEFAULT 0,
    embedding_count INTEGER DEFAULT 0,
    error_message TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    indexed_at TIMESTAMP
);

-- Chunks table with pgvector
CREATE TABLE IF NOT EXISTS chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id),
    chapter_id UUID REFERENCES chapters(id),
    content TEXT NOT NULL,
    page_label VARCHAR(50),
    chunk_index INTEGER NOT NULL,
    embedding vector(768),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    title VARCHAR(255),
    is_starred BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id),
    role VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    out_of_scope BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Message citations table
CREATE TABLE IF NOT EXISTS message_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id),
    chunk_id UUID REFERENCES chunks(id),
    relevance_score DECIMAL(5, 4),
    excerpt TEXT
);

-- Insert demo course
INSERT INTO courses (id, name, textbook) VALUES
    ('00000000-0000-0000-0000-000000000001', 'SWD392', 'Software Modeling and Design: UML, Use Cases, Patterns, and Software Architectures');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_course_id ON documents(course_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_course_id ON chunks(chapter_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_citations_message_id ON message_citations(message_id);

-- Vector index for semantic search (after data is loaded)
-- CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat(embedding vector_cosine_ops);