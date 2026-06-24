DROP TABLE IF EXISTS message_attachments CASCADE;

CREATE TABLE chat_session_documents (
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, document_id)
);

CREATE INDEX idx_chat_session_documents_session_id ON chat_session_documents(session_id);
