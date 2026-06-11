-- Database schema for SWD392 RAG Document Management
-- Integrates Better Auth tables with C# .NET business logic tables

-- Enable Extensions
CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed Roles
INSERT INTO roles (id, name) VALUES 
(1, 'Admin'),
(2, 'Lecturer'),
(3, 'Student')
ON CONFLICT (id) DO NOTHING;

-- 2. Users Table (Better Auth + Role fields)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "image" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "username" TEXT UNIQUE,
    "displayUsername" TEXT,
    role_id SMALLINT NOT NULL DEFAULT 3 REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_blocked BOOLEAN DEFAULT false NOT NULL
);

-- 3. Better Auth: Session Table
CREATE TABLE IF NOT EXISTS session (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "expiresAt" TIMESTAMP NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Better Auth: Account Table
CREATE TABLE IF NOT EXISTS account (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Better Auth: Verification Table
CREATE TABLE IF NOT EXISTS verification (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 6. Academic Terms Table
CREATE TABLE IF NOT EXISTS academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) UNIQUE NOT NULL,
    term_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    academic_term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Document Types Table
CREATE TABLE IF NOT EXISTS document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. Languages Table
CREATE TABLE IF NOT EXISTS languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. Document Sources Table
CREATE TABLE IF NOT EXISTS document_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'pending'::character varying NOT NULL,
    visibility VARCHAR(30) DEFAULT 'school_wide'::character varying NOT NULL,
    page_count INTEGER,
    total_chunks INTEGER DEFAULT 0 NOT NULL,
    total_chapters INTEGER DEFAULT 0 NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    download_count INTEGER DEFAULT 0 NOT NULL,
    search_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    slug VARCHAR(255) UNIQUE,
    document_type_id UUID REFERENCES document_types(id) ON DELETE SET NULL,
    language_id UUID REFERENCES languages(id) ON DELETE SET NULL,
    md5_hash VARCHAR(32),
    academic_term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
    document_source_id UUID REFERENCES document_sources(id) ON DELETE SET NULL
);

-- 12. Document Files Table
CREATE TABLE IF NOT EXISTS document_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    file_url TEXT,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64),
    page_count INTEGER,
    extracted_text TEXT,
    extraction_status VARCHAR(30) DEFAULT 'pending'::character varying NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    s3_bucket VARCHAR(128),
    s3_key VARCHAR(512)
);

-- 13. Document Chapters Table
CREATE TABLE IF NOT EXISTS document_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    parent_chapter_id UUID REFERENCES document_chapters(id) ON DELETE CASCADE,
    title VARCHAR(400) NOT NULL,
    summary TEXT,
    chapter_order INTEGER NOT NULL,
    start_page INTEGER,
    end_page INTEGER,
    start_chunk_index INTEGER,
    end_chunk_index INTEGER,
    is_ai_generated BOOLEAN DEFAULT false NOT NULL,
    confidence_score NUMERIC(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. Document Chunks Table (vector dimension 3072)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES document_chapters(id) ON DELETE SET NULL,
    chunk_order INTEGER NOT NULL,
    page_number INTEGER,
    content TEXT NOT NULL,
    content_tokens INTEGER,
    chunk_hash VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    embedding vector(3072)
);

-- 15. Upload Jobs Table
CREATE TABLE IF NOT EXISTS upload_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'::character varying NOT NULL,
    progress_percent INTEGER DEFAULT 0 NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    storage_path TEXT,
    is_notified BOOLEAN DEFAULT false NOT NULL
);

-- 16. Document Reports Table
CREATE TABLE IF NOT EXISTS document_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 17. User Bookmarks Table
CREATE TABLE IF NOT EXISTS user_bookmarks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, document_id)
);

-- 18. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    ip_address VARCHAR(45),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chapters_document_id ON document_chapters(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chapters_order ON document_chapters(document_id, chapter_order);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chapter_id ON document_chunks(chapter_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_metadata_gin ON document_chunks USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_document_files_document_id ON document_files(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner_user_id ON documents(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_subject_id ON documents(subject_id);
CREATE INDEX IF NOT EXISTS idx_documents_md5_hash ON documents(md5_hash);
CREATE UNIQUE INDEX IF NOT EXISTS ix_documents_slug ON documents(slug);

-- Full-text Search Index for Documents
CREATE INDEX IF NOT EXISTS idx_documents_search_fts ON documents USING gin (
    to_tsvector('simple'::regconfig, COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(search_text, ''))
);