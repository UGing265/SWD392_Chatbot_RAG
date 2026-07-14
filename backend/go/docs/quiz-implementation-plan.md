# QUIZ MODULE — KẾ HOẠCH TRIỂN KHAI CHI TIẾT (BA / PO)

| Mục | Nội dung |
|-----|----------|
| **Tài liệu nguồn** | [quiz.md](./quiz.md) — BR, FR, baseline nghiệp vụ |
| **Phiên bản** | v1.0 |
| **Ngày** | 2026-07-10 |
| **Vai trò soạn** | Business Analyst / Product Owner |
| **Trạng thái** | Draft for stakeholder review |
| **Phạm vi** | Full-stack: DB → Go Clean Architecture → Frontend Next.js |

---

## 0. Tóm tắt điều hành (Executive Summary)

StudyMate hiện là nền tảng **quản lý tài liệu học thuật + RAG chat + admin**. Module **Quiz** đã có:

- Tài liệu nghiệp vụ khá đầy đủ (`backend/go/docs/quiz.md`)
- UI prototype/mock trên frontend (`/practice`, create/take quiz components)

Nhưng **chưa có backend/API/DB persistence** cho quiz, attempt, AI generation, publish workflow, hay statistics.

**Kết luận PO:** Quiz là **greenfield backend** + **tích hợp/refactor frontend**. Không thể “bật” mock UI thành production chỉ bằng wiring — cần thiết kế domain, migration, use-case, API, và chốt các quyết định baseline còn mở.

| Lớp | Hiện trạng |
|-----|------------|
| Domain / UseCase / Repo / Handler / Routes (Go) | **NOT IMPLEMENTED** |
| Bảng DB `quiz*` | **NOT IN SCHEMA** |
| Frontend UI | **UI PROTOTYPE (mock)** |
| Frontend API client | **NONE** (`frontend/src/api/` không có quiz) |
| Business requirements | **DOC ONLY** — khá chi tiết |
| Product core (AGENTS.md, SRS, PLANNING) | **Chưa liệt kê Quiz** là core feature |

---

## 1. Hiện trạng dự án (As-Is) — căn cứ code

### 1.1 Kiến trúc monorepo

| Thành phần | Path | Port / Ghi chú |
|------------|------|----------------|
| Frontend | `frontend/` | Next.js + Mantine v7 — `:3000` |
| RAG / Business API | `backend/go/` | Go Clean Architecture — `:8080` |
| Auth | `backend/better-auth/` | Hono + Better Auth — `:5000` |
| DB dump | `backend/database/swd391_dangerous_malware.sql` | PostgreSQL + pgvector |
| Spec Quiz | `backend/go/docs/quiz.md` | BR/FR baseline |

### 1.2 Pattern Clean Architecture (bắt buộc tái sử dụng)

```
Handler (interface) → UseCase (application) → Repository interface (domain) → Postgres (infrastructure)
```

Ví dụ module đã có: `document`, `chat`, `admin`, `lookup`.  
Quiz **phải** theo cùng pattern — **cấm** query DB từ handler.

### 1.3 Auth & phân quyền sẵn có (tái sử dụng)

| Role | role_id | JWT claim |
|------|---------|-----------|
| Admin | 1 | `admin` |
| Lecturer | 2 | `lecturer` |
| Student | 3 | `student` |

- Middleware: `AuthMiddleware` + `RequireRoles(...)`
- Lecturer–Subject: bảng `user_subjects` + `lecturersubject.AssignmentRepository`
- Upload document đã enforce `EnsureLecturerCanUseSubject` → **BR-QUIZ-01 có thể reuse pattern này**

### 1.4 Pipeline tài liệu (nền cho AI quiz)

1. Lecturer upload → S3 + `documents` + `upload_jobs`
2. Background worker: parse → chunk → Gemini embed → `document_chunks` → chapter segmentation
3. Document status: `pending | processing | completed | rejected`
4. **AI quiz chỉ được sinh từ document `status = completed` và có chunk** (BR-QUIZ-02)

### 1.5 Frontend Quiz hiện có — chỉ mock

| File | Vai trò | Vấn đề |
|------|---------|--------|
| `app/[role]/practice/page.tsx` | Route practice | Split student/lecturer view |
| `app/[role]/practice/quiz/page.tsx` | Gamified runner | Hardcoded `MOCK_QUIZ`, lặp theo `?count=` |
| `components/lecturer/quiz/create-quiz-view.tsx` | Form tạo quiz thủ công | **Orphan** — không được page nào import |
| `components/student/quiz/take-quiz-view.tsx` | List + take + history | **Orphan** — không được page nào import |
| `hooks/lecturer/use-create-quiz.ts` | State + mock subjects | `handleSave` = `setTimeout` |
| `hooks/student/use-quiz.ts` | Mock quizzes + client scoring | Không gọi API |
| `hooks/*/use-practice.ts` | Dashboard mock charts | Generate = `console.log` |
| Sidebar `app-layout.tsx` | Nav | **Không có link** `/practice` hay `/quiz` |

### 1.6 Module đã có vs chưa có (Quiz)

| Capability | Status |
|------------|--------|
| Lecturer create quiz UI | Prototype (orphan) |
| Student take quiz UI | Prototype (orphan) |
| Practice dashboards | Prototype mock |
| AI generate quiz | Prototype / console only |
| Persist quiz/attempt | **Not implemented** |
| Publish workflow Draft→Published→Archived | **Not implemented** |
| Lecturer analytics real data | **Not implemented** |
| Role-gated quiz APIs | **Not implemented** |
| AI from completed docs | **Not implemented** (pipeline RAG có, quiz gen chưa) |

---

## 2. Mục tiêu sản phẩm (To-Be)

### 2.1 Value proposition

| Actor | Giá trị |
|-------|---------|
| **Lecturer** | Tạo quiz (thủ công / AI từ tài liệu đã index), review, publish, theo dõi kết quả & chất lượng câu hỏi |
| **Student** | Xem quiz Published theo môn/kỳ, làm bài MCQ, nộp, xem điểm & lịch sử |
| **System** | Chấm điểm tự động, validate schema AI, audit thao tác nhạy cảm |

### 2.2 Baseline nghiệp vụ chốt theo `quiz.md` (làm chuẩn triển khai MVP)

| # | Baseline |
|---|----------|
| B1 | 3 trạng thái: **Draft / Published / Archived** |
| B2 | Student chỉ thấy **Published** |
| B3 | Không password quiz |
| B4 | MCQ **single-correct only**; 2–7 options (A–G) |
| B5 | Publish yêu cầu **10–100** câu |
| B6 | AI chỉ tạo **Draft**; Lecturer review rồi publish thủ công |
| B7 | Multi-attempt: mỗi lần nộp = 1 attempt; UI/stats hiển thị **lần gần nhất + điểm cao nhất** |
| B8 | AI chỉ từ document **completed/indexed** + chunk hợp lệ |
| B9 | Lecturer chỉ tạo/sửa quiz môn được assign (`user_subjects`) |
| B10 | Có attempt → không hard-delete; dùng **Archived** |
| B11 | Sửa quiz đã có attempt → **cảnh báo** (versioning full có thể phase sau) |

### 2.3 Ngoài phạm vi MVP (Out of scope — giữ nguyên `quiz.md` §8)

- Password quiz, tự luận, AI chấm tự luận  
- Multiple-correct, mã đề random nâng cao  
- Proctoring / tab tracking / camera  
- Export Excel/PDF (trừ khi stakeholder yêu cầu thêm)  
- Real-time classroom / livestream quiz  
- Adaptive difficulty (UI mock student practice có “difficulty” — **không làm backend MVP**)

---

## 3. Gap analysis & những thứ KHÔNG ỔN / CHƯA XỬ LÝ ĐƯỢC

> Mục này là trọng tâm PO: liệt kê **mâu thuẫn, mơ hồ, thiếu nền tảng, và rủi ro** trước khi dev sprint.

### 3.1 Critical — chặn triển khai nếu không chốt

| ID | Vấn đề | Hiện trạng | Rủi ro nếu bỏ qua | Đề xuất chốt MVP |
|----|--------|------------|-------------------|------------------|
| **GAP-01** | **Student–Subject scope** | Chỉ có `user_subjects` cho **Lecturer**. Student **không** được assign môn trong schema. | Không biết student “được” thấy quiz môn nào; publish “theo subject” dễ thành “mọi student thấy mọi quiz” | **MVP:** Student thấy mọi quiz **Published** filter theo subject/term (giống list document school-wide). Ghi rõ: không có enrollment/class. |
| **GAP-02** | **Time limit (`duration_minutes`)** | Model gợi ý có field; UI mock có duration; BR chưa chốt auto-submit | FE/BE lệch: có field nhưng không enforce → user tưởng có timer | **MVP:** lưu `duration_minutes` nullable; **không** auto-submit server-side. FE countdown optional cosmetic. Phase 2: server deadline + force submit. |
| **GAP-03** | **Show correct answers sau nộp** | Mock gamified page show ngay từng câu; take-quiz-view show score; BR mở | Policy học tập vs gian lận nếu multi-attempt | **MVP:** Student xem **điểm + đúng/sai từng câu + đáp án đúng + explanation** sau submit. (Ôn tập, không thi nghiêm.) |
| **GAP-04** | **Edit quiz đã Published + có attempt** | BR-QUIZ-17 yêu cầu version hoặc warning | Sửa đáp án đúng → attempt cũ “đúng/sai” lệch thống kê | **MVP:** cho sửa + **warning bắt buộc**; snapshot `is_correct` đã lưu trên `quiz_attempt_answers` nên điểm attempt cũ **không đổi**. Stats theo attempt (historical). Phase 2: `quiz_versions`. |
| **GAP-05** | **AI generation latency & cost** | 10–100 câu sync request dễ timeout (LLM client timeout 60s) | 100 câu = nhiều token, timeout, partial garbage | **MVP:** job async giống `upload_jobs`: `quiz_generation_jobs` status pending/processing/done/failed; FE poll. Batch prompt (vd 10–20 câu/lần) hoặc 1 lần với cap 20–30 cho MVP. |
| **GAP-06** | **Nguồn AI: subject vs document vs chapter** | BR hỏi; UI mock mơ hồ | Scope retrieval không rõ → câu hỏi kém/không grounded | **MVP phase 1:** bắt buộc chọn **≥1 document completed** (optional filter chapter). Subject-only “toàn bộ doc môn” = phase 1.5 nếu đủ thời gian. |
| **GAP-07** | **Open/close window (ngày mở/đóng)** | BR mở; baseline “nếu chưa cần ghi ngoài phạm vi” | Stakeholder có thể giả định có deadline | **MVP: ngoài phạm vi.** Chỉ status Draft/Published/Archived. |
| **GAP-08** | **Random thứ tự câu/đáp án** | BR mở | Gian lận nhẹ nếu multi-attempt + show answer | **MVP: không random.** Phase 2 optional flag. |
| **GAP-09** | **Bắt buộc trả lời đủ trước nộp** | BR-QUIZ-13 “nếu không cho bỏ trống” — mơ hồ | Validation BE/FE lệch | **MVP: bắt buộc đủ câu.** BE reject nếu thiếu answer. |
| **GAP-10** | **Điểm từng câu vs equal weight** | BR hỏi | Thống kê/score formula | **MVP: mỗi câu 1 điểm.** Score = correct/total * 100 (hoặc fraction). Không partial credit. |

### 3.2 Product / UX inconsistencies (frontend mock lệch spec)

| ID | Vấn đề | Chi tiết |
|----|--------|----------|
| **UX-01** | **Hai “thế giới” UI không nối** | `/practice` (Intelligence Lab) vs orphan `CreateQuizView`/`TakeQuizView` — khác design, dark/light, flow. Cần **một IA thống nhất**. |
| **UX-02** | **Student tự generate quiz** | `StudentPracticeView` + `handleGenerateQuiz` gợi ý student tự sinh quiz. **Mâu thuẫn BR:** chỉ Lecturer tạo/publish; Student chỉ làm. |
| **UX-03** | **Difficulty / adaptive** | Mock student có difficulty — **không có trong BR baseline**. Phải gỡ khỏi MVP hoặc đánh dấu “future”. |
| **UX-04** | **Gamified page lộ đáp án cho Lecturer ngay** | `/practice/quiz` set `isAnswered = isLecturer` — đây là “preview”, không phải attempt. Cần tách rõ **Preview mode** vs **Student attempt mode**. |
| **UX-05** | **Create form không enforce 10–100 câu, 2–7 options** | Hook cho phép 1 câu, add option không cap 7, remove option không chặn <2. |
| **UX-06** | **Không có status Draft/Published/Archived trên UI** | Mock save = “thành công” không phân draft/publish. |
| **UX-07** | **Nav thiếu entry** | User không vào được practice/quiz từ sidebar. |
| **UX-08** | **Design system** | Practice student dùng nền đen full; lecturer practice light — cần align `DESIGN_SYSTEM.md` khi productionize. |
| **UX-09** | **History stats hardcode** | “12 bài”, “8.5/10”, “4h 30m” hardcode trong take-quiz-view. |
| **UX-10** | **correct_answer index vs option id** | Gamified mock dùng index; create/take dùng option id — schema API phải **một chuẩn** (option UUID + is_correct server-side). |

### 3.3 Platform / data model gaps

| ID | Vấn đề | Ảnh hưởng Quiz |
|----|--------|----------------|
| **PLAT-01** | **Không có class/section/enrollment** | Không publish theo lớp; không % hoàn thành “theo danh sách SV mục tiêu” (FR-QUIZ-13) thật được. Stats chỉ trên attempts thực tế. |
| **PLAT-02** | **`user_subjects.subject_id` UNIQUE** | Mỗi subject chỉ assign **1 lecturer**. OK cho BR “lecturer phụ trách môn”, nhưng multi-lecturer cùng môn **không hỗ trợ**. |
| **PLAT-03** | **Subject gắn `academic_term_id`** | Quiz model gợi ý có cả `subject_id` + `academic_term_id`. Có thể thừa/mâu thuẫn nếu subject đã thuộc 1 term. Cần rule: term lấy từ subject **hoặc** cho override. |
| **PLAT-04** | **Chat dùng `course_id` naming** | Lịch sử naming “course” vs “subject” — Quiz nên dùng **subject_id** nhất quán với document domain. |
| **PLAT-05** | **Migration story** | Full dump + incremental `002`/`003` chat; không có runner chuẩn. Quiz cần `004_quiz_tables.sql` + hướng dẫn apply thủ công. |
| **PLAT-06** | **Audit log** | Có `audit_logs` domain; Quiz publish/archive/delete/edit-published nên ghi audit (FR-QUIZ-14). |
| **PLAT-07** | **LLM client chỉ text chat** | `LLMClient.Generate(system, history)` — đủ cho quiz gen nếu prompt + parse JSON; **chưa có** structured output / response_schema helper. Cần validate chặt phía app. |
| **PLAT-08** | **Không có rate limit / quota AI** | Lecturer spam generate 100 câu × N lần → cost Gemini. Cần soft limit (vd 5 jobs/hour/user) MVP tối thiểu. |
| **PLAT-09** | **Document visibility vs quiz** | Document có visibility; quiz “public theo subject” khác model. Student có thể làm quiz từ doc họ không “thấy”? **MVP đề xuất:** quiz độc lập visibility document; AI gen chỉ từ doc lecturer có quyền + completed. |

### 3.4 Security & integrity gaps

| ID | Vấn đề | Mitigation MVP |
|----|--------|----------------|
| **SEC-01** | Student nhận **correct answers trong payload trước nộp** | API “start attempt / get quiz for taking” **không** trả `is_correct` / explanation. Chỉ trả sau submit hoặc endpoint result. |
| **SEC-02** | Client-side scoring (mock hiện tại) | **Chấm điểm chỉ server** khi submit. |
| **SEC-03** | Truy cập URL quiz Draft | 403/404 theo role + status. |
| **SEC-04** | Lecturer môn A sửa quiz môn B | Check assignment + ownership (lecturer_id hoặc assign subject). |
| **SEC-05** | Race: 2 tab submit cùng attempt | Unique `(attempt_id)` status transition in_progress→submitted; reject double submit. |
| **SEC-06** | IDOR attempt của student khác | Get result chỉ owner (student) hoặc lecturer của quiz. |

### 3.5 AI quality & validation gaps

| ID | Vấn đề | Mitigation |
|----|--------|------------|
| **AI-01** | JSON malformed / markdown fence | Parse robust; strip ```json; retry 1 lần; fail job rõ message |
| **AI-02** | Thiếu đúng 1 correct | Reject question hoặc whole batch |
| **AI-03** | Options trùng / rỗng | FR-QUIZ-03 validate |
| **AI-04** | Câu không grounded tài liệu | Prompt + optional `source_chunk_id`; không guarantee 100% factual |
| **AI-05** | Số câu trả về ≠ requested | Accept partial + flag `generated_count` để lecturer bổ sung thủ công; **không auto-publish** |
| **AI-06** | Ngôn ngữ (VI/EN) | MVP: prompt theo language document hoặc fixed VI |
| **AI-07** | Token context quá dài (nhiều doc) | Map-reduce: sample chunks / per-chapter batches; giới hạn N chunks top-k embed hoặc sequential chapters |

### 3.6 Analytics gaps

| ID | Vấn đề | MVP |
|----|--------|-----|
| **AN-01** | “Tỷ lệ hoàn thành” cần danh sách SV mục tiêu | **Không có enrollment** → chỉ hiển thị **số unique students attempted**, không % class |
| **AN-02** | Multi-attempt stats | Định nghĩa rõ: avg score theo **best attempt** hay **all attempts**? **MVP: avg trên best attempt/user; total attempts count riêng** |
| **AN-03** | Item analysis (câu sai nhiều) | Tính trên submitted attempts; exclude in_progress |
| **AN-04** | Export | Out of scope MVP |

### 3.7 Process / delivery gaps

| ID | Vấn đề |
|----|--------|
| **PROC-01** | Quiz **không** nằm trong core feature AGENTS.md / SRS / PLANNING → cần update docs khi commit scope |
| **PROC-02** | Không có acceptance test plan gắn CI; unit test pattern có ở document-usecase — quiz cần tương tự |
| **PROC-03** | Orphan components dễ bị quên; cần decision: **reuse + wire** hay **rewrite under /practice** |
| **PROC-04** | Swagger/api_reference chưa có quiz — phải cập nhật khi ship API |

### 3.8 Ma trận “xử lý được ngay” vs “chưa xử lý / cần quyết định”

| Hạng mục | Xử lý được với nền tảng hiện tại? | Ghi chú |
|----------|-------------------------------------|---------|
| CRUD quiz Draft + MCQ | Có | Greenfield nhưng pattern sẵn |
| Role gate Lecturer/Student | Có | JWT + RequireRoles |
| Subject assignment lecturer | Có | user_subjects |
| AI gen từ completed docs/chunks | Một phần | Cần job + prompt + validate; LLM client reuse |
| Publish workflow | Có | Status machine đơn giản |
| Attempt + auto grade | Có | Design mới |
| Stats lecturer | Có (trên attempts) | Không có class completion % |
| Publish theo lớp | **Không** | Thiếu enrollment |
| Timer force-submit | **Chưa** (cần design server time) | MVP skip enforce |
| Full versioning quiz | **Chưa** (phức tạp) | MVP warning + immutable answer snapshot |
| Password / proctoring / essay | **Không (OOS)** | — |
| Student self-generate quiz | **Mâu thuẫn BR** | Bỏ khỏi MVP student |

---

## 4. Quyết định sản phẩm chốt cho MVP (Product Decisions)

> Các quyết định dưới đây **đóng** phần lớn câu hỏi mở §2.2 của `quiz.md`. Stakeholder review; nếu đổi phải update file này.

| # | Quyết định | Giá trị MVP |
|---|------------|-------------|
| D1 | Status | `draft` \| `published` \| `archived` |
| D2 | Password | Không |
| D3 | Question type | Single-choice MCQ only |
| D4 | Options | 2–7, labels A–G |
| D5 | Publish min/max questions | 10–100 |
| D6 | AI output status | Luôn `draft` |
| D7 | Retry | Cho phép nhiều attempt |
| D8 | Scoring display | Best score + latest attempt; UI **toggle 3 dạng**: `/10`, `%`, `đúng/tổng` |
| D9 | Grade formula | equal weight, server-side only; BE trả đủ field để FE toggle |
| D10 | Must answer all | Yes |
| D11 | Show answers after submit | Yes (full review) |
| D12 | Duration | Optional metadata; no force submit |
| D13 | Randomize | No |
| D14 | Schedule open/close | No |
| D15 | Student quiz visibility | All Published by subject/term filters (no enrollment) |
| D16 | AI source | Selected completed document(s); optional chapters |
| D17 | Edit after attempts | Allowed with warning; historical attempts immutable |
| D18 | Delete | Hard delete only if zero submitted attempts; else archive |
| D19 | Ownership | `lecturer_id` creator; must remain assigned to subject |
| D20 | Student generate | **Forbidden** — only take published lecturer quizzes |
| D21 | AI gen execution | Async job + poll |
| D22 | MVP AI question cap (cost control) | **Đề xuất** 30/request cho release 1; cần stakeholder chốt giữa 30 và 100 |
| D23 | Unpublish | **Đề xuất** cho phép published→draft chỉ khi 0 submitted attempts; cần stakeholder chốt |

**Lưu ý D22:** `quiz.md` cho 10–100; thực tế Gemini latency/cost → PO đề xuất release 1 giới hạn AI generation tối đa `QUIZ_AI_MAX_QUESTIONS=30` câu/lần. Manual quiz vẫn có thể chuẩn bị đến 100 câu; sau khi AI job ổn định có thể nâng config lên 100. Cần stakeholder chốt 30 hay 100.

---

## 5. Data model chi tiết (DDL định hướng)

File migration đề xuất: `backend/go/migrations/004_quiz_tables.sql`

### 5.1 `quizzes`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | VARCHAR(300) NOT NULL | |
| description | TEXT | |
| subject_id | UUID NOT NULL FK → subjects | |
| academic_term_id | UUID NULL FK → academic_terms | denormalize từ subject hoặc explicit |
| lecturer_id | UUID NOT NULL FK → users | creator |
| status | VARCHAR(20) NOT NULL | draft/published/archived |
| source_type | VARCHAR(20) NOT NULL | manual/ai/mixed |
| question_count | INT NOT NULL DEFAULT 0 | cache |
| duration_minutes | INT NULL | metadata only MVP |
| published_at | TIMESTAMPTZ NULL | |
| archived_at | TIMESTAMPTZ NULL | |
| created_at / updated_at | TIMESTAMPTZ | |

Indexes: `(lecturer_id)`, `(subject_id, status)`, `(status, academic_term_id)`.

### 5.2 `quiz_questions`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| quiz_id | UUID FK CASCADE | |
| question_order | INT NOT NULL | |
| question_text | TEXT NOT NULL | |
| explanation | TEXT NULL | |
| source_chunk_id | UUID NULL FK → document_chunks | AI traceability |
| source_document_id | UUID NULL FK → documents | convenience |
| created_at / updated_at | | |

### 5.3 `quiz_options`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| question_id | UUID FK CASCADE | |
| option_label | CHAR(1) NOT NULL | A–G |
| option_text | TEXT NOT NULL | |
| is_correct | BOOLEAN NOT NULL DEFAULT false | |
| option_order | INT NOT NULL | |

Constraint app-level: exactly one `is_correct=true` per question; 2–7 rows.

### 5.4 `quiz_attempts`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| quiz_id | UUID FK | Restrict delete if exists |
| student_id | UUID FK → users | |
| attempt_number | INT NOT NULL | per student per quiz |
| started_at | TIMESTAMPTZ NOT NULL | |
| submitted_at | TIMESTAMPTZ NULL | |
| score | NUMERIC(5,2) NULL | 0–100 |
| total_questions | INT NOT NULL | snapshot count at start/submit |
| correct_count | INT NULL | |
| wrong_count | INT NULL | |
| status | VARCHAR(20) NOT NULL | in_progress/submitted/abandoned |

Unique: `(quiz_id, student_id, attempt_number)`.  
Index: `(quiz_id, student_id)`, `(student_id, submitted_at DESC)`.

### 5.5 `quiz_attempt_answers`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| attempt_id | UUID FK CASCADE | |
| question_id | UUID NOT NULL | **không cascade xóa question nếu muốn giữ history — dùng RESTRICT** |
| selected_option_id | UUID NOT NULL | |
| is_correct | BOOLEAN NOT NULL | **snapshot lúc chấm** |

Unique: `(attempt_id, question_id)`.

### 5.6 `quiz_generation_jobs` (AI async)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| quiz_id | UUID NULL FK | set when draft created |
| lecturer_id | UUID NOT NULL | |
| subject_id | UUID NOT NULL | |
| requested_count | INT NOT NULL | |
| status | VARCHAR(20) | pending/processing/done/failed |
| source_document_ids | UUID[] or junction table | |
| source_chapter_ids | UUID[] NULL | |
| error_message | TEXT NULL | |
| result_question_count | INT NULL | |
| created_at / started_at / finished_at | | |

Junction optional: `quiz_generation_job_documents(job_id, document_id)`.

### 5.7 Domain packages Go đề xuất

```
internal/domain/quiz/
internal/domain/quizquestion/   # hoặc gộp quiz package
internal/domain/quizattempt/
internal/domain/quizgenerationjob/
internal/application/quiz-usecase/
internal/infrastructure/repository/postgres/quiz-*.go
internal/interface/handler/quiz-handler.go
internal/interface/dto/request|response/quiz*.go
```

Có thể gộp entity quiz+question+option trong một package `quiz` để giảm boilerplate — **khuyến nghị gộp** cho module mới cỡ trung bình.

---

## 6. API design (REST — khớp convention hiện tại)

Base: `/api` + Bearer JWT.  
Response: JSON trực tiếp; error `{ "error": "..." }`.  
Roles: 2 = Lecturer, 3 = Student.

### 6.1 Lecturer — quản lý quiz

| Method | Path | Role | Mô tả |
|--------|------|------|-------|
| GET | `/api/quizzes` | 2 | List quiz của lecturer (filter term, subject, status, q) |
| POST | `/api/quizzes` | 2 | Tạo quiz manual draft (metadata + optional questions) |
| GET | `/api/quizzes/:id` | 2 | Chi tiết + questions + options (**có** is_correct) |
| PUT | `/api/quizzes/:id` | 2 | Update metadata |
| PUT | `/api/quizzes/:id/questions` | 2 | Replace/sync full question set (draft-friendly) |
| POST | `/api/quizzes/:id/publish` | 2 | Validate 10–100 + rules → published |
| POST | `/api/quizzes/:id/archive` | 2 | → archived |
| POST | `/api/quizzes/:id/unpublish` | 2 | published→draft **chỉ khi 0 submitted attempts** (D23) |
| DELETE | `/api/quizzes/:id` | 2 | Hard delete nếu không có submitted attempt |
| POST | `/api/quizzes/generate` | 2 | Enqueue AI job → `{ job_id }` |
| GET | `/api/quizzes/generate/jobs/:jobId` | 2 | Poll job status |
| GET | `/api/quizzes/:id/attempts` | 2 | List attempts (stats table) |
| GET | `/api/quizzes/:id/attempts/:attemptId` | 2 | Attempt detail |
| GET | `/api/quizzes/:id/statistics` | 2 | Aggregate stats + per-question accuracy |

### 6.2 Student — làm quiz

| Method | Path | Role | Mô tả |
|--------|------|------|-------|
| GET | `/api/student/quizzes` | 3 | List Published (filter term, subject, search) + flags attempted/best_score |
| GET | `/api/student/quizzes/:id` | 3 | Quiz info **không** đáp án đúng |
| POST | `/api/student/quizzes/:id/attempts` | 3 | Start attempt → questions **không** is_correct |
| PUT | `/api/student/attempts/:attemptId/answers` | 3 | Autosave optional (batch answers) |
| POST | `/api/student/attempts/:attemptId/submit` | 3 | Submit + grade + result payload |
| GET | `/api/student/attempts` | 3 | History của student |
| GET | `/api/student/attempts/:attemptId` | 3 | Result detail (sau submit) |

### 6.3 Lookups tái sử dụng

- Subjects/terms: existing `/api/documents/lookups`, `/api/subjects/public`
- Lecturer subjects assigned: reuse lookup use case
- Documents completed for AI source: filter `GET /api/documents/my?status=completed` hoặc endpoint riêng

### 6.4 Payload sketch (submit result)

```json
{
  "attempt_id": "...",
  "score": 80.0,
  "correct_count": 8,
  "wrong_count": 2,
  "total_questions": 10,
  "submitted_at": "...",
  "answers": [
    {
      "question_id": "...",
      "selected_option_id": "...",
      "correct_option_id": "...",
      "is_correct": false,
      "explanation": "..."
    }
  ]
}
```

---

## 7. Use-case breakdown & business rules mapping

| Use case | BR / FR | Notes implementation |
|----------|---------|----------------------|
| UC-L1 Create manual draft | FR-01, BR-01,03 | Default status draft; check assignment |
| UC-L2 AI generate draft | FR-02,03; BR-02,03,19,20 | Async job; validate schema; attach source_chunk when possible |
| UC-L3 Edit draft questions | FR-04; BR-06,07,08 | Full freedom on draft |
| UC-L4 Publish | FR-05; BR-05,10 | Validate counts & options |
| UC-L5 Archive / delete | FR-07; BR-12 | |
| UC-L6 List & filter | FR-06 | |
| UC-L7 View attempts & stats | FR-12,13; BR-16 | |
| UC-S1 List published | FR-08; BR-09,10 | |
| UC-S2 Start & answer | FR-09; BR-13 | No correct flags in API |
| UC-S3 Submit & grade | FR-10,11; BR-14,15 | |
| UC-SYS Audit | FR-14 | create/publish/archive/delete/edit-published |

### State machine Quiz

```
        create/AI
           │
           ▼
        ┌──────┐
   ┌───►│draft │◄── unpublish (only if 0 submitted attempts, D23)
   │    └──┬───┘
   │       │ publish (valid)
   │       ▼
   │    ┌──────────┐
   │    │published │
   │    └────┬─────┘
   │         │ archive
   │         ▼
   │    ┌──────────┐
   └────│archived  │  (student cannot new attempt)
        └──────────┘
```

### State machine Attempt

```
start → in_progress → submitted
                 ╲→ abandoned (optional timeout client leave)
```

---

## 8. AI generation design (chi tiết)

### 8.1 Flow

```
Lecturer chọn subject + documents (+ chapters) + N câu
        │
        ▼
Validate: assignment, docs completed, N in range, soft quota
        │
        ▼
Insert quiz_generation_jobs (pending)
        │
        ▼
Worker/goroutine (tương tự upload worker hoặc inline queue)
  - Load chunks (by doc/chapter; limit tokens)
  - Prompt Gemini: JSON schema MCQ
  - Parse + validate FR-QUIZ-03
  - Create quizzes row draft + questions/options
  - Job done + quiz_id
        │
        ▼
FE poll → redirect editor review
```

### 8.2 Prompt requirements (functional)

- Output JSON only: array of `{question, options[2..7], correct_index|correct_label, explanation, source_hint}`
- Language: Vietnamese academic unless doc English
- Grounded in provided context excerpts
- Exactly one correct
- Distractors plausible
- No duplicate options

### 8.3 Failure modes

| Case | Behavior |
|------|----------|
| No chunks | fail job, message rõ |
| LLM error | retry ≤2, then failed |
| Partial valid questions | save valid if ≥1; job done with warning; lecturer bổ sung |
| All invalid | failed, no quiz row or empty draft? **Đề xuất: no quiz row** |

---

## 9. Frontend implementation plan

### 9.1 Information architecture đề xuất

| Route | Role | Mục đích |
|-------|------|----------|
| `/lecturer/practice` | Lecturer | Hub: list quizzes, stats entry, CTA tạo |
| `/lecturer/practice/quizzes/new` | Lecturer | Manual create |
| `/lecturer/practice/quizzes/:id/edit` | Lecturer | Review/edit draft & published |
| `/lecturer/practice/quizzes/:id/results` | Lecturer | Attempts + item analysis |
| `/lecturer/practice/quizzes/:id/preview` | Lecturer | Preview as student (no grading) |
| `/student/practice` | Student | List published + history summary |
| `/student/practice/quizzes/:id` | Student | Take quiz |
| `/student/practice/attempts/:id` | Student | Result review |

**Loại bỏ / không ship:** Student “Generate quiz bằng AI” trên practice lab (UX-02).

### 9.2 Component strategy

1. **Không** ship 2 UI song song. Chọn:
   - **Option A (recommended):** Refactor `CreateQuizView` + `TakeQuizView` theo DESIGN_SYSTEM, mount vào routes trên; simplify `/practice` thành hub thật.
   - **Option B:** Rebuild trong practice-view tabs — rủi ro phình component.

2. Thêm `frontend/src/api/quiz.ts` dùng `ragApi` (axios client sẵn).

3. Hooks:
   - `useLecturerQuizzes`, `useQuizEditor`, `useQuizGenerate`
   - `useStudentQuizzes`, `useQuizAttempt`, `useQuizHistory`

4. Nav: thêm “Luyện tập / Quiz” vào `app-layout.tsx` cho lecturer & student.

5. States UX bắt buộc:
   - Loading / empty / error
   - Generate job progress
   - Publish validation errors (insufficient questions)
   - Warning modal khi edit quiz có attempts

### 9.3 Client validation (mirror server)

- Title required  
- 2–7 options, exactly 1 correct  
- Cannot publish outside 10–100  
- Submit disabled until all answered  

---

## 10. Kế hoạch triển khai theo phase (Delivery plan)

### Phase 0 — Alignment (0.5–1 ngày)

- [ ] Stakeholder sign-off decisions D1–D22 (mục 4)
- [ ] Chốt D22 AI max questions
- [ ] Update scope docs (optional): SRS snippet / PLANNING checklist
- [ ] Chốt Option A/B frontend IA

**Exit:** Decision log approved.

### Phase 1 — Foundation DB + Domain (2–3 ngày)

- [ ] Migration `004_quiz_tables.sql`
- [ ] Domain entities + repository interfaces
- [ ] Postgres repositories (CRUD quiz, questions, options)
- [ ] Unit tests validation helpers (option counts, one correct, publish rules)

**Exit:** Repo layer testable; tables applied local.

### Phase 2 — Lecturer manual quiz API + wire FE editor (3–4 ngày)

- [ ] Use cases: create, update, sync questions, list, get, delete, publish, archive
- [ ] Handler + routes + swagger annotations
- [ ] FE: mount create/edit, call real API, subject/term from real lookups
- [ ] Permission tests (wrong subject → 403)

**Exit:** Lecturer tạo–sửa–publish draft manual E2E.

### Phase 3 — Student attempt + grading (3–4 ngày)

- [ ] Start attempt, get quiz sans answers, submit, grade, history
- [ ] FE take quiz + result + history
- [ ] Security review: no answer leak

**Exit:** Student làm quiz published E2E; score đúng.

### Phase 4 — Lecturer monitoring & statistics (2 ngày)

- [ ] Attempts list, detail, aggregate stats, per-question accuracy
- [ ] FE results tab replace mockStudentResults

**Exit:** Lecturer xem ai làm, điểm, câu khó.

### Phase 5 — AI generation (3–5 ngày)

- [ ] `quiz_generation_jobs` + worker
- [ ] Prompt + JSON validate + draft create
- [ ] FE generate modal + poll + open editor
- [ ] Soft quota + error UX
- [ ] Prefer document-scoped generation

**Exit:** AI draft usable; lecturer publish sau review.

### Phase 6 — Hardening (2 ngày)

- [ ] Audit logs sensitive actions  
- [ ] Edge-case tests từ `quiz.md` §7  
- [ ] API reference + quiz.md status update (prototype → implemented)  
- [ ] Nav + empty states + DESIGN_SYSTEM pass  
- [ ] Load test nhẹ AI job / concurrent submit  

**Exit:** MVP shippable demo.

### Ước lượng tổng (1 backend + 1 frontend dev)

| Phase | Effort |
|-------|--------|
| 0 | 0.5–1d |
| 1 | 2–3d |
| 2 | 3–4d |
| 3 | 3–4d |
| 4 | 2d |
| 5 | 3–5d |
| 6 | 2d |
| **Total** | **~16–23 person-days** |

Có thể song song FE Phase 2–3 với mock contract (OpenAPI) sau Phase 1.

---

## 11. Acceptance criteria (MVP Definition of Done)

### Lecturer

1. Chỉ tạo quiz cho subject được assign.  
2. Tạo manual draft, thêm/sửa/xóa câu & options trong giới hạn.  
3. Không publish nếu <10 hoặc >100 câu, hoặc câu thiếu đúng 1 đáp án.  
4. Publish → student thấy; Archive → student không start attempt mới.  
5. (Nếu Phase 5) AI gen từ document completed → draft + có thể review.  
6. Xem danh sách attempts, điểm, chi tiết đúng/sai.  
7. Xem thống kê: attempts count, avg (best), min/max, per-question correct rate.

### Student

1. Không thấy Draft/Archived.  
2. Start attempt, trả lời single-choice, submit khi đủ câu.  
3. Điểm server-side khớp số đúng.  
4. Xem lại đáp án đúng + explanation sau nộp.  
5. Làm lại được; history giữ nhiều attempts.  
6. Không gọi được API create/generate quiz.

### System

1. Không leak `is_correct` trước submit.  
2. Audit publish/archive/delete.  
3. AI job fail không tạo rác không kiểm soát.  
4. Clean Architecture: handler không đụng DB.

---

## 12. Test scenarios ưu tiên (từ quiz.md §7 + bổ sung)

| # | Scenario | Expected |
|---|----------|----------|
| T1 | AI/manual 10 câu hợp lệ publish | OK |
| T2 | 9 câu publish | 400 |
| T3 | 101 câu publish | 400 |
| T4 | Option <2 hoặc >7 | reject save |
| T5 | 0 hoặc 2 correct flags | reject |
| T6 | Student list không thấy draft | OK |
| T7 | Student GET draft by id | 403/404 |
| T8 | Submit thiếu answers | 400 |
| T9 | Submit chấm đúng | score match |
| T10 | Double submit | 409/400 |
| T11 | Lecturer khác subject | 403 |
| T12 | Archive có attempts | history còn, no new attempt |
| T13 | Delete có submitted attempts | blocked → archive |
| T14 | AI doc not completed | job fail clear error |
| T15 | Start attempt response không có is_correct | security |
| T16 | Multi attempt best/latest display | correct aggregation |

---

## 13. Rủi ro & phụ thuộc

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini unstable / slow | AI phase trễ | Async job + manual path ship trước (Phase 2–4 trước 5) |
| Cost API | Budget | Soft cap N questions + rate limit |
| Scope creep (timer, class, export) | Trễ MVP | Giữ OOS list cứng |
| FE orphan dual UI | Waste | Một IA duy nhất Phase 0 |
| Historical grading after edit | Trust stats | Snapshot is_correct on answers |
| UNIQUE subject→1 lecturer | Multi-GV | Document limitation; admin process |
| No enrollment | Weak “completion %” | Only attempt-based metrics |

**Dependencies:** PostgreSQL migration apply, Gemini key, subjects seeded, ≥1 completed document cho demo AI, Better Auth roles.

---

## 14. Backlog ưu tiên (MoSCoW)

### Must (MVP)

- Manual CRUD draft + publish/archive  
- Student attempt + server grade + history  
- Lecturer attempt list + basic stats  
- AuthZ subject assignment  
- Answer non-leakage  
- Score toggle 3 dạng: `/10`, `%`, `đúng/tổng` (D8)  

### Should

- AI generate async from documents  
- Per-question accuracy  
- Audit log  
- Autosave answers  

### Could

- Chapter-scoped AI  
- Client timer display from duration_minutes  
- Soft AI quota dashboard  

### Won’t (this release)

- Enrollment/class publish  
- Force time submit  
- Versioning full  
- Essay / multi-correct / password / proctoring / export  
- Student self-generated quizzes  
- Adaptive difficulty  
- Admin quản lý/xóa quiz toàn hệ thống  

---

## 15. Decision log & open questions còn lại

### 15.1 Đã chốt trong cuộc trao đổi ngày 2026-07-10

| Câu hỏi | Quyết định |
|---------|------------|
| Score scale UI | Chốt UI cho **toggle 3 dạng**: `/10`, `%`, `đúng/tổng`; BE trả đủ dữ liệu để FE đổi cách hiển thị |
| Admin quản lý quiz toàn hệ thống | Chốt **không đưa vào MVP** |

### 15.2 Chưa chốt — cần bạn chọn (đã giải thích bên dưới)

| Câu hỏi | Đề xuất PO | Giải thích |
|---------|-----------|------------|
| **AI max questions release 1:** 30 hay 100? | **Đề xuất 30** | `quiz.md` cho 10–100, nhưng Gemini API mỗi request tốn thời gian + tiền. 100 câu có thể timeout (>60s). 30 câu/lần an toàn, rẻ, nhanh. Manual quiz vẫn chuẩn bị đến 100 câu; sau khi AI job ổn định có thể nâng config lên 100. |
| **Unpublish published→draft?** | **Đề xuất cho phép nếu 0 submitted attempts** | Nếu chưa ai nộp, việc ẩn quiz khỏi Student vô hại. Nếu đã có attempt → cấm unpublish (dùng archive thay thế) để bảo toàn lịch sử. |

### 15.3 Open questions còn lại cho stakeholder

Chỉ còn những câu **không** nên tự chốt một mình PO kỹ thuật:

1. **Nhiều lecturer / subject:** có roadmap nới UNIQUE `user_subjects.subject_id` không?  
2. **Giữ brand “Quiz Intelligence Lab”** hay đổi tên gần StudyMate hơn?

---

## 16. Phụ lục — Mapping file code hiện tại → hành động

| Path | Hành động |
|------|-----------|
| `backend/go/docs/quiz.md` | Giữ BR; cập nhật “hiện trạng” sau khi implement |
| `backend/go/docs/quiz-implementation-plan.md` | **File này** — living plan |
| `backend/go/migrations/004_quiz_tables.sql` | **Tạo mới** |
| `backend/go/internal/domain/quiz/*` | **Tạo mới** |
| `backend/go/internal/application/quiz-usecase/*` | **Tạo mới** |
| `backend/go/internal/interface/handler/quiz-handler.go` | **Tạo mới** |
| `backend/go/internal/interface/router/router.go` | Wire routes |
| `frontend/src/api/quiz.ts` | **Tạo mới** |
| `frontend/src/hooks/lecturer/use-create-quiz.ts` | Thay mock → API |
| `frontend/src/hooks/student/use-quiz.ts` | Thay mock → API |
| `frontend/src/hooks/*/use-practice.ts` | Bỏ generate student; nối list thật |
| `frontend/src/components/lecturer/quiz/create-quiz-view.tsx` | Wire + validate BR |
| `frontend/src/components/student/quiz/take-quiz-view.tsx` | Wire + security UX |
| `frontend/src/app/[role]/practice/**` | IA hub thật; bỏ hardcode charts dần |
| `frontend/src/components/layout/app-layout.tsx` | Thêm nav |
| `docs/api_reference.md` | Bổ sung quiz endpoints sau Phase 2+ |

---

## 17. Kết luận PO

1. **Quiz là module mới end-to-end**, không phải “nối mock”.  
2. Nền tảng hiện tại **đủ** cho MVP cốt lõi (auth, subject assignment, docs completed, Gemini, Clean Architecture).  
3. **Không đủ** cho class-based publish, force timer, full versioning — phải **loại khỏi MVP** hoặc đầu tư platform trước.  
4. Rủi ro lớn nhất về sản phẩm: **UI mock gợi ý student tự gen quiz + dual UI** — cần dọn IA trước khi dev FE sâu.  
5. Rủi ro lớn nhất về kỹ thuật: **AI gen sync 100 câu** — bắt buộc async + cap.  
6. Thứ tự ship tối ưu: **Manual publish path trước (P1–P4) → AI sau (P5)** để luôn có demo ổn định.

---

*Tài liệu này bổ sung, không thay thế, [quiz.md](./quiz.md). Mọi thay đổi baseline D1–D22 cần revision history.*

### Revision history

| Ver | Date | Author | Notes |
|-----|------|--------|-------|
| 1.0 | 2026-07-10 | BA/PO (codebase review) | Initial plan + full gap register |
