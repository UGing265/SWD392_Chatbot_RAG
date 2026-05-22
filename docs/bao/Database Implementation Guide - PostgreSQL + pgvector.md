# Database Implementation Guide - PostgreSQL + pgvector

## 1. Mục tiêu tài liệu

Tài liệu này hướng dẫn triển khai database cho dự án **chatbot hỏi đáp dựa trên tài liệu môn học** với stack:

- **PostgreSQL** làm cơ sở dữ liệu chính
- **pgvector** để lưu embedding và thực hiện semantic search ngay trong PostgreSQL
- Phù hợp với kiến trúc **3-layer** trong dự án C# / .NET 8+
- Hỗ trợ cả:
  - quản lý tài liệu
  - chat history
  - citations
  - benchmark / experiment
  - truy vết indexing và re-index

Tài liệu này được viết lại dựa trên toàn bộ các file mô tả dự án hiện có, đặc biệt là `Database.md`, nhưng điều chỉnh từ hướng **SQL Server + vector store tách riêng** sang mô hình **PostgreSQL + pgvector**.

---

## 2. Vì sao chọn PostgreSQL + pgvector cho dự án này?

## 2.1. Lý do chọn PostgreSQL

PostgreSQL phù hợp vì:

- mạnh về relational data
- hỗ trợ JSONB tốt
- có hệ sinh thái ổn định
- dễ chạy local bằng Docker
- tích hợp tốt với .NET qua `Npgsql`
- hỗ trợ extension mạnh, trong đó có `pgvector`

## 2.2. Lý do chọn pgvector

`pgvector` cho phép:

- lưu vector embedding trực tiếp trong bảng PostgreSQL
- tìm kiếm semantic search bằng cosine / L2 / inner product
- không cần thêm một vector DB riêng cho đồ án
- dễ đồng bộ dữ liệu vì metadata và vector nằm cùng một database
- phù hợp cho demo, nghiên cứu và benchmark quy mô nhỏ đến vừa

## 2.3. Khi nào pgvector phù hợp?

Phù hợp nếu:

- dữ liệu chưa quá lớn
- muốn đơn giản hóa kiến trúc
- cần dễ demo với giảng viên
- muốn benchmark nhiều cấu hình trong một nơi
- muốn giảm độ phức tạp khi đồng bộ giữa SQL DB và vector store riêng

## 2.4. Khi nào nên tách vector DB riêng?

Về sau có thể tách sang Qdrant / Weaviate / Milvus nếu:

- số chunk rất lớn
- cần throughput search rất cao
- cần scale retrieval độc lập với transactional DB
- cần nhiều tính năng ANN nâng cao ở production

Với đồ án hiện tại, **PostgreSQL + pgvector là một lựa chọn rất hợp lý**.

---

## 3. Kiến trúc dữ liệu đề xuất

## 3.1. Kiến trúc tổng quát

```text
[ASP.NET Core Web App]
        |
        v
[Business Services]
        |
        v
[PostgreSQL]
   |- transactional tables
   |- chat history
   |- experiment logs
   |- chunk metadata
   |- embedding vectors via pgvector
```

## 3.2. Dữ liệu nào lưu trong PostgreSQL?

Toàn bộ dữ liệu sẽ nằm trong PostgreSQL, gồm:

- Users
- Courses
- Chapters
- Documents
- DocumentIndexRuns
- Chunks
- ChatSessions
- ChatMessages
- MessageCitations
- TestSets
- TestQuestions
- ExperimentRuns
- ExperimentQuestionResults
- ExperimentRetrievedChunks
- BackgroundJobs
- AppEvents

Khác với thiết kế cũ, ở đây:

- **metadata chunk** và **vector embedding** đều có thể nằm trong bảng `chunks`
- hoặc tách thành bảng `chunk_embeddings` nếu muốn mềm dẻo hơn

### Khuyến nghị cho đồ án

Nên dùng:
- bảng `chunks` lưu text + metadata
- bảng `chunk_embeddings` lưu vector

Cách này tốt hơn lưu vector trực tiếp trong `chunks` vì:

- hỗ trợ nhiều model embedding cho cùng một chunk
- dễ re-index
- dễ benchmark nhiều cấu hình
- giảm rủi ro ghi đè vector cũ

---

## 4. Thiết kế schema tổng thể

## 4.1. Schema gợi ý

Có thể dùng một schema `public` cho đơn giản.

Nếu muốn rõ ràng hơn:

- `public`: dữ liệu chính
- `exp`: benchmark / experiment
- `ops`: jobs / events / logs

### Khuyến nghị cho đồ án

Bắt đầu với **schema `public`** để dễ triển khai và dễ dùng với EF Core.

---

## 5. Nguyên tắc thiết kế database

1. **Ưu tiên UUID** cho khóa chính.
2. **Dùng `timestamptz`** cho toàn bộ thời gian.
3. **Dùng `text`** thay vì `varchar(n)` khi không cần giới hạn cứng.
4. **Dùng `jsonb`** cho dữ liệu mở rộng như metadata/config.
5. **Dùng enum string hoặc check constraint** cho trạng thái.
6. **Tách index run riêng** để hỗ trợ re-index và benchmark.
7. **Không overwrite dữ liệu benchmark cũ**.
8. **Không xóa cứng chunk/vector cũ quá sớm** nếu còn cần audit.
9. **Phân biệt rõ document, chunk, embedding, citation**.
10. **Tối ưu cho traceability**, không chỉ cho CRUD.

---

## 6. Extension cần bật trong PostgreSQL

## 6.1. Bật pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 6.2. Extension hữu ích khác

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Ghi chú

Chỉ cần một trong hai cách sinh UUID:

- `gen_random_uuid()` từ `pgcrypto`
- `uuid_generate_v4()` từ `uuid-ossp`

Khuyến nghị dùng `pgcrypto` và `gen_random_uuid()`.

---

## 7. Mô hình bảng đề xuất

## 7.1. Bảng users

```sql
CREATE TABLE users (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name text NOT NULL UNIQUE,
    full_name text,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role_name text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

## 7.2. Bảng courses

```sql
CREATE TABLE courses (
    course_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code text NOT NULL UNIQUE,
    course_name text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

## 7.3. Bảng chapters

```sql
CREATE TABLE chapters (
    chapter_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES courses(course_id),
    chapter_title text NOT NULL,
    chapter_number integer,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (course_id, chapter_number)
);
```

## 7.4. Bảng documents

```sql
CREATE TABLE documents (
    document_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES courses(course_id),
    chapter_id uuid REFERENCES chapters(chapter_id),
    original_file_name text NOT NULL,
    stored_file_name text NOT NULL,
    stored_file_path text NOT NULL,
    file_extension text NOT NULL,
    mime_type text,
    file_size_bytes bigint NOT NULL,
    file_checksum text,
    page_count integer,
    language_code text,
    uploaded_by_user_id uuid NOT NULL REFERENCES users(user_id),
    uploaded_at timestamptz NOT NULL DEFAULT now(),
    index_status text NOT NULL,
    last_index_run_id uuid,
    index_error_message text,
    metadata_json jsonb,
    is_deleted boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_documents_index_status CHECK (
        index_status IN ('Pending', 'Processing', 'Indexed', 'Failed', 'Deleted')
    )
);
```

## 7.5. Bảng document_index_runs

```sql
CREATE TABLE document_index_runs (
    index_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid NOT NULL REFERENCES documents(document_id),
    triggered_by_user_id uuid REFERENCES users(user_id),
    trigger_source text NOT NULL,
    embedding_model text NOT NULL,
    embedding_dimension integer NOT NULL,
    chunking_strategy text NOT NULL,
    chunk_size integer,
    chunk_overlap_ratio numeric(5,4),
    status text NOT NULL,
    started_at timestamptz,
    completed_at timestamptz,
    extracted_text_length integer,
    total_chunks integer,
    error_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    config_json jsonb,
    CONSTRAINT ck_document_index_runs_status CHECK (
        status IN ('Pending', 'Running', 'Completed', 'Failed', 'Cancelled')
    )
);
```

## 7.6. Bảng chunks

```sql
CREATE TABLE chunks (
    chunk_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid NOT NULL REFERENCES documents(document_id),
    index_run_id uuid NOT NULL REFERENCES document_index_runs(index_run_id),
    chunk_index integer NOT NULL,
    page_number integer,
    slide_number integer,
    section_title text,
    text_content text NOT NULL,
    token_count integer,
    start_offset integer,
    end_offset integer,
    is_active boolean NOT NULL DEFAULT true,
    metadata_json jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (index_run_id, chunk_index)
);
```

## 7.7. Bảng chunk_embeddings

> Đây là bảng quan trọng nhất cho pgvector.

```sql
CREATE TABLE chunk_embeddings (
    chunk_embedding_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id uuid NOT NULL REFERENCES chunks(chunk_id) ON DELETE CASCADE,
    index_run_id uuid NOT NULL REFERENCES document_index_runs(index_run_id) ON DELETE CASCADE,
    embedding_model text NOT NULL,
    embedding_dimension integer NOT NULL,
    embedding vector(768) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (chunk_id, embedding_model, index_run_id)
);
```

### Lưu ý rất quan trọng

`vector(768)` chỉ đúng nếu model embedding có dimension 768.

Ví dụ:
- `multilingual-e5-base` thường là 768
- `bge-m3` có thể khác tùy cách lấy embedding
- `text-embedding-3-small` thường 1536

Nếu benchmark nhiều model có dimension khác nhau, có 2 hướng:

### Hướng 1: Một bảng cho một dimension
- `chunk_embeddings_768`
- `chunk_embeddings_1024`
- `chunk_embeddings_1536`

### Hướng 2: Dùng bảng riêng theo từng index run/model
- dễ linh hoạt hơn nhưng phức tạp vận hành

### Khuyến nghị thực tế cho đồ án

Nếu nhóm chỉ benchmark các model cùng dimension thì dùng 1 bảng.

Nếu benchmark dimension khác nhau, nên đổi thiết kế thành:
- chỉ chọn **1 nhóm model cùng dimension** cho MVP
- hoặc tách bảng embedding theo dimension

Ví dụ với đồ án, bạn có thể ưu tiên:
- `multilingual-e5-base`
- `PhoBERT-based embedding pipeline`
- `bge-m3`

và chuẩn hóa chiến lược dimension ngay từ đầu.

Nếu muốn linh hoạt hơn, có thể thiết kế như sau:

```sql
CREATE TABLE embedding_collections (
    embedding_collection_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    index_run_id uuid NOT NULL REFERENCES document_index_runs(index_run_id),
    collection_name text NOT NULL UNIQUE,
    embedding_model text NOT NULL,
    embedding_dimension integer NOT NULL,
    distance_metric text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

Sau đó tạo bảng embedding chuyên biệt cho từng dimension bằng migration riêng.

## 7.8. Bảng chat_sessions

```sql
CREATE TABLE chat_sessions (
    session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id),
    course_id uuid NOT NULL REFERENCES courses(course_id),
    title text,
    session_status text NOT NULL DEFAULT 'Active',
    last_activity_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_chat_sessions_status CHECK (
        session_status IN ('Active', 'Archived', 'Deleted')
    )
);
```

## 7.9. Bảng chat_messages

```sql
CREATE TABLE chat_messages (
    message_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    parent_message_id uuid REFERENCES chat_messages(message_id),
    role_name text NOT NULL,
    content text NOT NULL,
    normalized_question text,
    retrieval_top_k integer,
    similarity_threshold numeric(5,4),
    prompt_template_id text,
    llm_provider text,
    llm_model text,
    prompt_tokens integer,
    completion_tokens integer,
    total_tokens integer,
    retrieval_latency_ms integer,
    generation_latency_ms integer,
    total_latency_ms integer,
    estimated_cost numeric(18,6),
    response_status text,
    error_message text,
    metadata_json jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_chat_messages_role CHECK (
        role_name IN ('User', 'Assistant', 'System')
    ),
    CONSTRAINT ck_chat_messages_response_status CHECK (
        response_status IS NULL OR response_status IN ('Success', 'NoContext', 'Failed')
    )
);
```

## 7.10. Bảng message_citations

```sql
CREATE TABLE message_citations (
    message_citation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES chat_messages(message_id) ON DELETE CASCADE,
    chunk_id uuid REFERENCES chunks(chunk_id),
    document_id uuid REFERENCES documents(document_id),
    citation_order integer NOT NULL,
    page_number integer,
    slide_number integer,
    snippet text,
    similarity_score numeric(9,6),
    is_used_in_answer boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

## 7.11. Bảng test_sets

```sql
CREATE TABLE test_sets (
    test_set_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_set_name text NOT NULL,
    description text,
    course_id uuid NOT NULL REFERENCES courses(course_id),
    version_no integer NOT NULL DEFAULT 1,
    source_file_path text,
    created_by_user_id uuid NOT NULL REFERENCES users(user_id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_active boolean NOT NULL DEFAULT true
);
```

## 7.12. Bảng test_questions

```sql
CREATE TABLE test_questions (
    question_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_set_id uuid NOT NULL REFERENCES test_sets(test_set_id) ON DELETE CASCADE,
    chapter_id uuid REFERENCES chapters(chapter_id),
    question_text text NOT NULL,
    ground_truth_answer text NOT NULL,
    difficulty_level text NOT NULL,
    expected_keywords_json jsonb,
    display_order integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_test_questions_difficulty CHECK (
        difficulty_level IN ('Easy', 'Medium', 'Hard')
    ),
    UNIQUE (test_set_id, display_order)
);
```

## 7.13. Bảng experiment_runs

```sql
CREATE TABLE experiment_runs (
    experiment_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_name text NOT NULL,
    description text,
    test_set_id uuid NOT NULL REFERENCES test_sets(test_set_id),
    embedding_model text NOT NULL,
    embedding_dimension integer NOT NULL,
    chunking_strategy text NOT NULL,
    chunk_size integer,
    chunk_overlap_ratio numeric(5,4),
    top_k integer NOT NULL,
    rerank_enabled boolean NOT NULL DEFAULT false,
    rerank_model text,
    prompt_template_id text,
    llm_provider text NOT NULL,
    llm_model text NOT NULL,
    similarity_threshold numeric(5,4),
    status text NOT NULL,
    total_questions integer,
    completed_questions integer,
    avg_faithfulness numeric(9,6),
    avg_answer_relevance numeric(9,6),
    avg_context_recall numeric(9,6),
    avg_context_precision numeric(9,6),
    avg_retrieval_latency_ms numeric(18,2),
    avg_generation_latency_ms numeric(18,2),
    avg_total_latency_ms numeric(18,2),
    total_estimated_cost numeric(18,6),
    failure_count integer NOT NULL DEFAULT 0,
    git_commit_hash text,
    code_version text,
    started_by_user_id uuid NOT NULL REFERENCES users(user_id),
    started_at timestamptz,
    completed_at timestamptz,
    error_message text,
    config_json jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_experiment_runs_status CHECK (
        status IN ('Pending', 'Running', 'Completed', 'Failed', 'Cancelled')
    )
);
```

## 7.14. Bảng experiment_question_results

```sql
CREATE TABLE experiment_question_results (
    experiment_question_result_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_run_id uuid NOT NULL REFERENCES experiment_runs(experiment_run_id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES test_questions(question_id),
    question_text_snapshot text NOT NULL,
    ground_truth_snapshot text,
    generated_answer text,
    retrieval_top_k integer,
    retrieved_chunk_count integer,
    prompt_tokens integer,
    completion_tokens integer,
    retrieval_latency_ms integer,
    generation_latency_ms integer,
    total_latency_ms integer,
    estimated_cost numeric(18,6),
    faithfulness_score numeric(9,6),
    answer_relevance_score numeric(9,6),
    context_recall_score numeric(9,6),
    context_precision_score numeric(9,6),
    result_status text NOT NULL,
    error_message text,
    metadata_json jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_experiment_question_results_status CHECK (
        result_status IN ('Success', 'NoContext', 'Failed')
    )
);
```

## 7.15. Bảng experiment_retrieved_chunks

```sql
CREATE TABLE experiment_retrieved_chunks (
    experiment_retrieved_chunk_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_question_result_id uuid NOT NULL REFERENCES experiment_question_results(experiment_question_result_id) ON DELETE CASCADE,
    chunk_id uuid REFERENCES chunks(chunk_id),
    rank_order integer NOT NULL,
    similarity_score numeric(9,6) NOT NULL,
    rerank_score numeric(9,6),
    is_used_in_final_context boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

## 7.16. Bảng background_jobs

```sql
CREATE TABLE background_jobs (
    background_job_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type text NOT NULL,
    related_entity_type text,
    related_entity_id uuid,
    queue_name text,
    status text NOT NULL,
    retry_count integer NOT NULL DEFAULT 0,
    max_retry_count integer NOT NULL DEFAULT 3,
    started_at timestamptz,
    completed_at timestamptz,
    error_message text,
    payload_json jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_background_jobs_status CHECK (
        status IN ('Pending', 'Running', 'Completed', 'Failed', 'Retrying')
    )
);
```

## 7.17. Bảng app_events

```sql
CREATE TABLE app_events (
    app_event_id bigserial PRIMARY KEY,
    event_type text NOT NULL,
    severity text NOT NULL,
    source text,
    correlation_id text,
    related_entity_type text,
    related_entity_id uuid,
    message text NOT NULL,
    data_json jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 8. Quan hệ giữa các bảng

## 8.1. Nhóm học liệu

- `courses 1 - n chapters`
- `courses 1 - n documents`
- `chapters 1 - n documents`
- `documents 1 - n document_index_runs`
- `document_index_runs 1 - n chunks`
- `chunks 1 - n chunk_embeddings`

## 8.2. Nhóm chat

- `users 1 - n chat_sessions`
- `chat_sessions 1 - n chat_messages`
- `chat_messages 1 - n message_citations`
- `chunks 1 - n message_citations`

## 8.3. Nhóm benchmark

- `test_sets 1 - n test_questions`
- `test_sets 1 - n experiment_runs`
- `experiment_runs 1 - n experiment_question_results`
- `experiment_question_results 1 - n experiment_retrieved_chunks`

---

## 9. Chỉ mục quan trọng cần tạo

## 9.1. Index thường

```sql
CREATE INDEX idx_documents_course_status
    ON documents(course_id, index_status);

CREATE INDEX idx_documents_uploaded_by
    ON documents(uploaded_by_user_id);

CREATE INDEX idx_documents_uploaded_at
    ON documents(uploaded_at DESC);

CREATE INDEX idx_chunks_document_id
    ON chunks(document_id);

CREATE INDEX idx_chunks_index_run_id
    ON chunks(index_run_id);

CREATE INDEX idx_chat_sessions_user_last_activity
    ON chat_sessions(user_id, last_activity_at DESC);

CREATE INDEX idx_chat_messages_session_created_at
    ON chat_messages(session_id, created_at);

CREATE INDEX idx_experiment_runs_filter
    ON experiment_runs(test_set_id, embedding_model, chunking_strategy, top_k);

CREATE INDEX idx_experiment_question_results_run
    ON experiment_question_results(experiment_run_id);
```

## 9.2. Unique/index chống trùng tài liệu

```sql
CREATE UNIQUE INDEX uq_documents_course_checksum
    ON documents(course_id, file_checksum)
    WHERE file_checksum IS NOT NULL AND is_deleted = false;
```

---

## 10. Thiết kế vector với pgvector

## 10.1. Các kiểu distance phổ biến

pgvector hỗ trợ nhiều kiểu so sánh:

- **L2 distance**: khoảng cách Euclidean
- **inner product**
- **cosine distance**

### Với RAG cho text

Thông thường nên dùng:
- **cosine similarity / cosine distance**

Nếu embedding đã normalize L2 trước khi lưu, cosine thường ổn định và dễ hiểu.

---

## 10.2. Truy vấn semantic search cơ bản

Ví dụ tìm top 5 chunk gần nhất với một query embedding:

```sql
SELECT
    c.chunk_id,
    c.document_id,
    c.page_number,
    c.section_title,
    c.text_content,
    1 - (ce.embedding <=> $1) AS similarity
FROM chunk_embeddings ce
JOIN chunks c ON c.chunk_id = ce.chunk_id
JOIN documents d ON d.document_id = c.document_id
WHERE ce.is_active = true
  AND c.is_active = true
  AND d.is_deleted = false
  AND d.index_status = 'Indexed'
  AND ce.index_run_id = $2
ORDER BY ce.embedding <=> $1
LIMIT 5;
```

Trong đó:
- `$1` là vector query
- `$2` là `index_run_id` đang active hoặc cấu hình benchmark muốn dùng

---

## 10.3. Filter theo course/document trước khi search

```sql
SELECT
    c.chunk_id,
    c.text_content,
    d.document_id,
    d.original_file_name,
    c.page_number,
    1 - (ce.embedding <=> $1) AS similarity
FROM chunk_embeddings ce
JOIN chunks c ON c.chunk_id = ce.chunk_id
JOIN documents d ON d.document_id = c.document_id
WHERE ce.is_active = true
  AND c.is_active = true
  AND d.course_id = $2
  AND d.is_deleted = false
ORDER BY ce.embedding <=> $1
LIMIT 5;
```

Điều này rất phù hợp với use case chat theo từng môn học.

---

## 11. Tạo vector index trong pgvector

## 11.1. IVFFlat

```sql
CREATE INDEX idx_chunk_embeddings_embedding_ivfflat
ON chunk_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Đặc điểm
- nhanh hơn full scan
- phù hợp dữ liệu vừa/lớn
- cần `ANALYZE`
- thường nên tạo khi bảng đã có dữ liệu

## 11.2. HNSW

```sql
CREATE INDEX idx_chunk_embeddings_embedding_hnsw
ON chunk_embeddings
USING hnsw (embedding vector_cosine_ops);
```

### Đặc điểm
- chất lượng ANN tốt
- thường tốt hơn IVFFlat trong nhiều trường hợp
- build index có thể nặng hơn
- phù hợp khi PostgreSQL/pgvector version hỗ trợ tốt

## 11.3. Nên chọn IVFFlat hay HNSW?

### Với đồ án
Nếu môi trường đơn giản và version ổn định:
- ưu tiên thử **HNSW** nếu pgvector hỗ trợ
- nếu muốn phổ biến, dễ giải thích hơn: dùng **IVFFlat**

### Gợi ý an toàn
- ban đầu chạy full scan để kiểm tra đúng logic
- sau đó thêm IVFFlat hoặc HNSW để benchmark performance

---

## 12. Full scan vs ANN

## 12.1. Full scan

Ưu điểm:
- chính xác tuyệt đối
- dễ debug
- phù hợp dataset nhỏ

Nhược điểm:
- chậm khi số chunk lớn

## 12.2. Approximate Nearest Neighbor (IVFFlat/HNSW)

Ưu điểm:
- nhanh hơn nhiều
- phù hợp dataset lớn hơn

Nhược điểm:
- có thể không trả về đúng top-K tuyệt đối
- cần tuning

### Khuyến nghị cho dự án

- **Giai đoạn đầu**: dùng full scan
- **Giai đoạn benchmark/performance**: thêm HNSW hoặc IVFFlat

---

## 13. Chiến lược re-index đúng cách

Đây là phần rất quan trọng.

## 13.1. Vấn đề

Khi document được re-index với:
- model embedding khác
- chunk size khác
- chunk strategy khác

thì vector/chunk cũ không nên bị lẫn với dữ liệu mới.

## 13.2. Cách làm đúng

1. Tạo record mới trong `document_index_runs`
2. Tạo chunk mới trong `chunks`
3. Tạo embedding mới trong `chunk_embeddings`
4. Sau khi hoàn tất, đánh dấu:
   - `documents.last_index_run_id = index_run_id mới`
   - chunk/vector cũ `is_active = false`
5. Chỉ query dữ liệu từ run đang active

## 13.3. Gợi ý transaction logic

- Tạo `index_run` trước
- Insert chunk và embedding theo batch
- Nếu thành công toàn bộ thì activate run mới
- Nếu fail thì mark `document_index_runs.status = 'Failed'`
- Không xóa cứng dữ liệu cũ ngay lập tức

---

## 14. Cách chọn index run active khi chat

Có 2 cách:

### Cách 1: dùng `documents.last_index_run_id`
Dễ làm và rõ ràng nhất.

### Cách 2: dùng cờ `is_active` trên chunks/embeddings
Linh hoạt hơn nhưng dễ sai nếu đồng bộ không chuẩn.

### Khuyến nghị
Dùng kết hợp:
- `documents.last_index_run_id`
- `chunks.is_active`
- `chunk_embeddings.is_active`

Khi query chat runtime, filter theo `last_index_run_id` hoặc `index_run_id` đã chọn.

---

## 15. Hướng dẫn cài PostgreSQL + pgvector bằng Docker

## 15.1. Docker Compose mẫu

```yaml
version: '3.9'
services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: educhatbot-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: EduChatbotDb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 15.2. Khởi động

```bash
docker compose up -d
```

## 15.3. Kết nối vào database

```bash
docker exec -it educhatbot-postgres psql -U postgres -d EduChatbotDb
```

## 15.4. Bật extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## 16. Migration strategy cho .NET / EF Core

## 16.1. Package cần cài

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Pgvector.EntityFrameworkCore
```

Nếu dùng direct ADO.NET / Dapper thì cài thêm package tương ứng cho pgvector.

## 16.2. Connection string mẫu

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=EduChatbotDb;Username=postgres;Password=postgres"
  }
}
```

## 16.3. Cấu hình DbContext

```csharp
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Chunk> Chunks => Set<Chunk>();
    public DbSet<ChunkEmbedding> ChunkEmbeddings => Set<ChunkEmbedding>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("vector");
        modelBuilder.UseVector();

        modelBuilder.Entity<ChunkEmbedding>()
            .Property(x => x.Embedding)
            .HasColumnType("vector(768)");
    }
}
```

## 16.4. Entity mẫu

```csharp
using Pgvector;

public class ChunkEmbedding
{
    public Guid ChunkEmbeddingId { get; set; }
    public Guid ChunkId { get; set; }
    public Guid IndexRunId { get; set; }
    public string EmbeddingModel { get; set; } = default!;
    public int EmbeddingDimension { get; set; }
    public Vector Embedding { get; set; } = default!;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
```

## 16.5. Tạo migration

```bash
dotnet ef migrations add InitPostgresSchema
dotnet ef database update
```

---

## 17. Ví dụ insert vector bằng SQL

```sql
INSERT INTO chunk_embeddings (
    chunk_embedding_id,
    chunk_id,
    index_run_id,
    embedding_model,
    embedding_dimension,
    embedding,
    is_active
)
VALUES (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'multilingual-e5-base',
    768,
    '[0.12, -0.03, 0.44, ...]',
    true
);
```

---

## 18. Ví dụ query semantic search trong C#

Pseudo flow:

1. Nhận câu hỏi từ user
2. Tạo query embedding
3. Gọi SQL search trên `chunk_embeddings`
4. Join sang `chunks`, `documents`
5. Lấy top-K
6. Build prompt
7. Gọi LLM
8. Lưu `chat_messages`
9. Lưu `message_citations`

### SQL mẫu gọi từ app

```sql
SELECT
    c.chunk_id,
    c.text_content,
    c.page_number,
    d.document_id,
    d.original_file_name,
    1 - (ce.embedding <=> @query_embedding) AS similarity
FROM chunk_embeddings ce
JOIN chunks c ON c.chunk_id = ce.chunk_id
JOIN documents d ON d.document_id = c.document_id
WHERE ce.index_run_id = @index_run_id
  AND ce.is_active = true
  AND c.is_active = true
  AND d.is_deleted = false
ORDER BY ce.embedding <=> @query_embedding
LIMIT @top_k;
```

---

## 19. Gợi ý pipeline indexing với Postgres + pgvector

## 19.1. Luồng chuẩn

```text
Upload file
  -> lưu documents
  -> tạo background job
  -> extract text
  -> chunk
  -> insert chunks
  -> embed từng chunk
  -> insert chunk_embeddings
  -> mark index run completed
  -> update documents.last_index_run_id
```

## 19.2. Batch insert

Vì số chunk có thể nhiều, nên:
- insert chunk theo batch
- insert embedding theo batch
- không insert từng bản ghi một nếu file lớn

## 19.3. Transaction boundary

Không nên để toàn bộ file lớn trong 1 transaction quá dài.

Gợi ý:
- transaction 1: tạo document + index run
- transaction 2..n: insert chunk/embedding theo batch
- transaction cuối: activate run

---

## 20. Gợi ý pipeline chat với citations

## 20.1. Luồng

```text
User question
 -> create query embedding
 -> semantic search trong pgvector
 -> filter top-k
 -> build prompt từ chunks
 -> call LLM
 -> lưu assistant answer
 -> lưu message_citations
```

## 20.2. Citation nên lưu gì?

Trong `message_citations` nên lưu:
- `chunk_id`
- `document_id`
- `page_number`
- `slide_number`
- `snippet`
- `similarity_score`
- `citation_order`

Lý do:
- hiển thị UI dễ hơn
- nếu chunk/document sau này soft delete vẫn còn snippet để trace

---

## 21. Gợi ý cho benchmark / research module

## 21.1. Vì sao database phải phục vụ benchmark?

Dự án này không chỉ là chatbot runtime mà còn là đồ án có yếu tố nghiên cứu.

Vì vậy database phải lưu được:
- cấu hình mỗi run
- câu trả lời từng câu hỏi
- retrieved chunks
- score từng câu
- latency, token, cost

## 21.2. Điều bắt buộc để tái lập

Trong `experiment_runs` cần lưu ít nhất:
- `embedding_model`
- `embedding_dimension`
- `chunking_strategy`
- `chunk_size`
- `chunk_overlap_ratio`
- `top_k`
- `rerank_enabled`
- `prompt_template_id`
- `llm_provider`
- `llm_model`
- `similarity_threshold`
- `git_commit_hash`
- `code_version`

## 21.3. Điều bắt buộc ở per-question level

Trong `experiment_question_results` cần lưu:
- snapshot câu hỏi
- snapshot ground truth
- generated answer
- latency
- token
- cost
- ragas scores
- status

## 21.4. Retrieved chunks nên lưu riêng

`experiment_retrieved_chunks` giúp:
- phân tích retrieval quality
- giải thích low context recall
- so sánh embedding model tốt/xấu ở từng câu hỏi

---

## 22. Cấu hình pgvector cho nhiều model embedding

Đây là điểm cần cân nhắc kỹ.

## 22.1. Bài toán dimension khác nhau

Ví dụ:
- model A: 768 chiều
- model B: 1024 chiều
- model C: 1536 chiều

Trong pgvector, một cột `vector(n)` phải cố định dimension `n`.

## 22.2. Các chiến lược triển khai

### Chiến lược A - chỉ benchmark model cùng dimension
Đơn giản nhất.

**Ưu điểm:**
- dễ làm
- ít migration phức tạp
- EF Core dễ mapping

**Nhược điểm:**
- ít linh hoạt

### Chiến lược B - bảng embedding theo dimension
Ví dụ:
- `chunk_embeddings_768`
- `chunk_embeddings_1536`

**Ưu điểm:**
- chuẩn kỹ thuật
- hỗ trợ nhiều model

**Nhược điểm:**
- code search phức tạp hơn

### Chiến lược C - dùng một schema/bảng riêng cho mỗi experiment family
Không cần cho đồ án giai đoạn đầu.

## 22.3. Khuyến nghị thực tế cho bạn

Nếu muốn triển khai nhanh và ổn:

- Chọn **1 dimension chính** cho MVP
- Thiết kế benchmark quanh nhóm model đó
- Khi cần mở rộng, thêm bảng embedding mới theo dimension

---

## 23. Tối ưu hiệu năng PostgreSQL

## 23.1. Vacuum / Analyze

Sau khi insert nhiều vector/chunk:

```sql
ANALYZE chunk_embeddings;
ANALYZE chunks;
```

## 23.2. Partitioning có cần không?

Với đồ án thường chưa cần.

Chỉ cân nhắc khi:
- rất nhiều chat logs
- rất nhiều experiment logs
- chunk cực lớn

## 23.3. Không select text dài khi không cần

Ví dụ trang danh sách documents không nên join kéo `text_content`.

## 23.4. Giới hạn top-K hợp lý

Thường:
- `top_k = 3, 5, 8`

Không nên quá lớn nếu chưa rerank.

## 23.5. Batch writes

Indexing nên ghi theo batch để giảm round-trip.

---

## 24. Bảo mật và toàn vẹn dữ liệu

## 24.1. Không lưu plain password

Dùng password hash qua ASP.NET Identity hoặc BCrypt/Argon2.

## 24.2. Dùng soft delete cho documents

Không nên xóa cứng ngay vì:
- có thể làm mất citation cũ
- làm hỏng audit
- làm sai benchmark lịch sử

## 24.3. Kiểm tra file trùng

Dựa vào:
- `file_checksum`
- `course_id`

## 24.4. Log lỗi pipeline

Lưu cả ở:
- `document_index_runs.error_message`
- `background_jobs.error_message`
- `app_events`

---

## 25. Backup và restore

## 25.1. Backup local

```bash
pg_dump -U postgres -d EduChatbotDb > backup.sql
```

## 25.2. Restore

```bash
psql -U postgres -d EduChatbotDb < backup.sql
```

## 25.3. Vì sao PostgreSQL + pgvector tiện?

Do vector nằm cùng DB nên:
- backup/restore đồng nhất
- không phải đồng bộ giữa SQL DB và vector DB khác

---

## 26. Thứ tự triển khai thực tế được khuyến nghị

## Giai đoạn 1 - Nền tảng DB
1. Cài PostgreSQL
2. Cài pgvector
3. Tạo DB `EduChatbotDb`
4. Tạo migration nền
5. Tạo các bảng core: `users`, `courses`, `chapters`, `documents`, `document_index_runs`, `chunks`, `chunk_embeddings`

## Giai đoạn 2 - Upload & Indexing
1. Upload file
2. Lưu `documents`
3. Tạo `document_index_runs`
4. Extract text
5. Chunk
6. Insert `chunks`
7. Embed và insert `chunk_embeddings`
8. Tạo vector index

## Giai đoạn 3 - Chat
1. Tạo `chat_sessions`
2. Tạo semantic search query
3. Gọi LLM
4. Lưu `chat_messages`
5. Lưu `message_citations`

## Giai đoạn 4 - Benchmark
1. Tạo `test_sets`, `test_questions`
2. Tạo `experiment_runs`
3. Lưu `experiment_question_results`
4. Lưu `experiment_retrieved_chunks`

## Giai đoạn 5 - Vận hành
1. `background_jobs`
2. `app_events`
3. backup/restore
4. tối ưu index

---

## 27. Tài liệu pgvector tóm tắt

## 27.1. pgvector là gì?

`pgvector` là extension của PostgreSQL cho phép lưu vector và chạy nearest neighbor search ngay trong PostgreSQL.

## 27.2. Cú pháp kiểu dữ liệu

```sql
embedding vector(768)
```

## 27.3. Một số toán tử quan trọng

Tùy version, pgvector thường dùng các toán tử như:

- `<->` : L2 distance
- `<#>` : inner product
- `<=>` : cosine distance

Với semantic search text embedding, thường quan tâm nhất đến **cosine distance**.

## 27.4. Ví dụ insert

```sql
INSERT INTO items (embedding)
VALUES ('[1,2,3]');
```

## 27.5. Ví dụ search

```sql
SELECT *
FROM items
ORDER BY embedding <=> '[1,2,3]'
LIMIT 5;
```

## 27.6. Index types thường dùng

- `ivfflat`
- `hnsw`

## 27.7. Khi nào cần index?

- vài trăm vector: chưa cần gấp
- vài nghìn đến hàng chục nghìn: nên bắt đầu benchmark index
- lớn hơn nữa: index gần như bắt buộc

## 27.8. Lưu ý khi dùng pgvector

- dimension phải cố định theo cột
- nên normalize embedding nếu dùng cosine similarity
- ANN index có trade-off giữa tốc độ và recall
- luôn benchmark bằng dữ liệu thật của dự án

---

## 28. Khuyến nghị cuối cùng cho dự án này

## 28.1. Lựa chọn kiến trúc nên dùng

**Nên dùng:**
- PostgreSQL làm DB chính
- pgvector để lưu embedding
- ASP.NET Core + EF Core + Npgsql
- BackgroundService hoặc Hangfire cho indexing/benchmark

## 28.2. Thiết kế bảng cốt lõi tối thiểu

Nếu cần MVP nhanh, ưu tiên:
- `users`
- `courses`
- `chapters`
- `documents`
- `document_index_runs`
- `chunks`
- `chunk_embeddings`
- `chat_sessions`
- `chat_messages`
- `message_citations`
- `test_sets`
- `test_questions`
- `experiment_runs`
- `experiment_question_results`

## 28.3. Điều quan trọng nhất

Điểm quan trọng nhất của thiết kế này là:

1. Hỗ trợ **chat runtime**.
2. Hỗ trợ **RAG benchmark/research**.
3. Hỗ trợ **traceability**.
4. Hỗ trợ **re-index an toàn**.
5. Đơn giản hóa kiến trúc nhờ dùng **PostgreSQL + pgvector** thay vì DB + vector DB tách riêng.

---

## 29. Kết luận

Với dự án chatbot hỏi đáp tài liệu môn học, triển khai database bằng **PostgreSQL + pgvector** là phương án rất phù hợp vì:

- đơn giản hơn kiến trúc SQL Server + vector DB riêng
- dễ đồng bộ dữ liệu
- dễ demo
- đủ mạnh cho đồ án và benchmark học thuật
- hỗ trợ tốt cho semantic search, citation, experiment tracking và audit

Nếu muốn, bước tiếp theo mình có thể làm tiếp cho bạn một trong các file sau:

1. **PostgreSQL DDL.sql** hoàn chỉnh để chạy ngay
2. **ERD Mermaid.md**
3. **EF Core Entity Mapping.md**
4. **Sample semantic search queries.sql**
5. **Database migration plan từ thiết kế cũ sang PostgreSQL.md**
