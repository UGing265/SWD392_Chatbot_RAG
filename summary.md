# Tóm Tắt Kết Quả Triển Khai Phân Hệ Chatbot RAG

Tài liệu này tóm tắt toàn bộ quá trình porting phân hệ Chatbot RAG từ .NET sang Go, chi tiết nghiệp vụ RAG pipeline, các lỗi phát sinh đã sửa và hướng dẫn vận hành cho dự án **SWD392_Chatbot_RAG**.

---

## 1. Các File Đã Triển Khai (Clean Architecture)

Phần backend Go đã được cấu trúc lại hoàn toàn theo Clean Architecture với các file sau:

### Lớp Domain (Domain Layer)
*   **[internal/domain/chatsession](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/domain/chatsession)**:
    *   `entity.go`: Khai báo thực thể `ChatSession` lưu trữ thông tin phòng chat.
    *   `repository.go`: Định nghĩa interface `ChatSessionRepository`.
*   **[internal/domain/message](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/domain/message)**:
    *   `entity.go`: Khai báo `Message` (tin nhắn), `MessageCitation` (nguồn trích dẫn), và `SimilarChunk` (các đoạn tài liệu khớp).
    *   `repository.go`: Định nghĩa interface `MessageRepository`.

### Lớp Infrastructure (Infrastructure Layer)
*   **[internal/infrastructure/repository/postgres](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/infrastructure/repository/postgres)**:
    *   `chat-repo.go`: Cài đặt CRUD cho phòng chat.
    *   `message-repo.go`: Cài đặt lưu tin nhắn, trích dẫn và **tìm kiếm tương đồng Cosine qua pgvector**.
*   **[internal/infrastructure/llm](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/infrastructure/llm)**:
    *   `gemini-llm.go`: Client gọi Gemini Pro để sinh câu trả lời đồng bộ (sync), tích hợp cơ chế xoay vòng Key (Round-robin) và Retry tự động.

### Lớp Application (Application Layer)
*   **[internal/application/chatusecase](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/application/chatusecase)**:
    *   `usecase.go`: Khởi tạo và Dependency Injection.
    *   `create-session.go`: Logic tạo, lấy danh sách, xóa phòng chat.
    *   `get-history.go`: Lấy lịch sử hội thoại kèm trích dẫn.
    *   `send-message.go`: **Luồng RAG Pipeline chính** (Embed câu hỏi -> Quét Vector DB -> Kiểm tra ngưỡng lọc -> Gửi LLM -> Lưu lịch sử & Trích dẫn).

### Lớp Interface & Cấu Hình (Interface Layer)
*   **[internal/interface/dto](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/interface/dto)**:
    *   `request/message.go`: DTO nhận câu hỏi từ Client.
    *   `response/chat.go`: DTO định dạng kết quả trả về cho Client.
*   **[internal/interface/handler](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/interface/handler)**:
    *   `chat-handler.go`: Ghi nhận các HTTP request, xử lý validate và gọi usecase. Tích hợp annotation sinh Swagger.
*   **Đăng ký Route & Config:**
    *   [router.go](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/interface/router/router.go): Đăng ký 6 RESTful API chat cho Role 2 (Lecturer) và 3 (Student).
    *   [env.go](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/pkg/config/env.go): Thêm cấu hình biến môi trường `GEMINI_CHAT_MODEL`.

---

## 2. Nghiệp Vụ Của Chatbot (RAG Pipeline Workflow)

Nghiệp vụ của Chatbot tuân thủ nghiêm ngặt quy trình RAG (Retrieval-Augmented Generation) cục bộ, được thiết kế bảo mật và phân quyền chi tiết:

1.  **Hội thoại giới hạn theo môn học (Course-scoped Session):**
    Mỗi phiên chat (`ChatSession`) được liên kết với một `course_id` (môn học) cụ thể. Học sinh chỉ có thể hỏi đáp các tài liệu thuộc môn học đó mà không được đọc lẫn sang tài liệu của môn học khác.
2.  **Chuyển đổi câu hỏi thành Vector (Embedding):**
    Khi nhận câu hỏi từ học sinh, hệ thống gọi dịch vụ Gemini Embedding Client để tạo ra vector đặc trưng 3072 chiều đại diện cho ngữ nghĩa câu hỏi.
3.  **Truy vấn tương đồng ngữ nghĩa (Semantic Search):**
    Sử dụng toán tử khoảng cách Cosine (`<=>`) của extension `pgvector` trong PostgreSQL để truy vấn 5 đoạn văn bản (`document_chunks`) có nội dung gần nhất với câu hỏi. 
    *   *Điều kiện lọc:* Tài liệu phải thuộc môn học hiện tại (`d.subject_id = course_id`) và có trạng thái xử lý ngầm đã thành công (`d.status = 'completed'`).
4.  **Kiểm soát phạm vi kiến thức (Similarity Threshold Filter):**
    *   Hệ thống thiết lập một ngưỡng tương đồng tối thiểu là **`0.6`** (tương đương 60% độ tương đồng ngữ nghĩa).
    *   Nếu điểm số cao nhất của các đoạn văn tìm thấy nhỏ hơn `0.6` hoặc không tìm thấy tài liệu nào, câu hỏi sẽ được đánh dấu là **ngoài phạm vi giáo trình** (`out_of_scope = true`).
    *   Khi đó, Chatbot sẽ lập tức từ chối trả lời một cách lịch sự bằng thông điệp định sẵn: *"Xin lỗi, thông tin này không có trong giáo trình. Vui lòng tham khảo thêm tài liệu khác hoặc hỏi giảng viên trên lớp."* nhằm tránh hiện tượng mô hình AI "ảo tưởng" (hallucination) ra các kiến thức ngoài bài học.
5.  **Tạo ngữ cảnh & Hỏi đáp với LLM:**
    *   Nếu tìm thấy thông tin hợp lệ (điểm `>= 0.6`), hệ thống sẽ gộp 5 đoạn văn này thành chuỗi ngữ cảnh (Context string).
    *   Lấy lịch sử 20 tin nhắn gần nhất của phòng chat để gửi kèm làm ngữ cảnh hội thoại tiếp diễn.
    *   Gộp ngữ cảnh tài liệu + lịch sử chat + câu hỏi mới vào System Prompt và gọi Gemini LLM để nhận câu trả lời đồng bộ (Sync Response, không sử dụng Streaming/SSE theo yêu cầu nghiệp vụ tại `AGENTS.md`).
6.  **Lưu trữ & Tạo trích dẫn:**
    *   Lưu câu trả lời của Bot vào bảng `messages` (role = `'bot'`).
    *   Với mỗi đoạn văn tài liệu được dùng làm ngữ cảnh ở trên, hệ thống ghi nhận một bản ghi liên kết vào bảng `message_citations` chứa: ID tin nhắn bot, ID chunk tài liệu, điểm số tương đồng và đoạn trích dẫn thực tế.
    *   Trả về đồng thời cả `user_message` và `bot_message` (kèm mảng `citations` chứa tên file, số trang) giúp Front-end dễ dàng render giao diện.

---

## 3. Thiết Kế Database (Migrations)

Bảng dữ liệu được thêm mới thông qua file migration SQL:
*   **[002_chat_tables.sql](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/migrations/002_chat_tables.sql)**:
    *   Bảng `chat_sessions`: Quản lý các phiên chat.
    *   Bảng `messages`: Lưu lịch sử tin nhắn của User và Bot.
    *   Bảng `message_citations`: Liên kết các câu trả lời của Bot tới các chunk tài liệu trong bảng `document_chunks`.
    *   Tạo 6 index trên các trường `user_id`, `course_id`, `session_id`, `message_id`, `chunk_id` để tăng tốc truy vấn.

---

## 4. Các Lỗi Quan Trọng Đã Sửa & Cải Tiến

### Lỗi Cắt Byte UTF-8 Tiếng Việt (Sửa trong background_worker.go)
*   **Vấn đề:** Bộ cắt đoạn (Chunker) thực hiện cắt chữ dựa trên số lượng byte. Khi xử lý tiếng Việt có dấu, việc cắt byte ngẫu nhiên đã làm "cắt đôi" các ký tự nhiều byte, tạo ra các byte rác không hợp lệ (như `0xac`) ở biên của chunk. PostgreSQL từ chối lưu các chuỗi có byte rác này và báo lỗi `invalid byte sequence for encoding "UTF8"`, khiến file upload bị lỗi (Status = `error`).
*   **Giải pháp:** Đã bổ sung hàm loại bỏ byte rác tự động bằng `strings.ToValidUTF8(text, "")` và lọc mã null byte `\x00` trước khi lưu vào database trong [background_worker.go](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/internal/infrastructure/worker/background_worker.go#L183-L190). Nhờ đó, tất cả các tài liệu PDF tiếng Việt dung lượng lớn đã được tải lên và lưu vào DB trơn tru.

### Cải Tiến Cấu Trúc JSON Phản Hồi Cho Front-End (FE)
*   **Vấn đề:** Giao diện FE cần hiển thị cả tin nhắn của User kèm Database ID thật để đồng bộ trạng thái hội thoại.
*   **Giải pháp:** Cập nhật API gửi tin nhắn trả về đồng thời cả `user_message` (thông tin tin nhắn của user) và `bot_message` (câu trả lời kèm danh sách trích dẫn `citations`), giúp FE dựng giao diện mượt mà không cần gọi lại API reload lịch sử.

---

## 5. Hướng Dẫn Vận Hành Hệ Thống

### Bước 1: Khởi Tạo/Cập Nhật Cơ Sở Dữ Liệu
Vì hệ thống có thêm các bảng chat mới và trường dữ liệu bổ sung, bạn cần chạy các file SQL migration vào database PostgreSQL của bạn:
1.  Mở phần mềm quản lý Database (DBeaver, pgAdmin, v.v.).
2.  Kết nối vào database của dự án (`swd391_db`).
3.  Chạy lần lượt 2 file SQL theo đúng thứ tự:
    *   File khởi tạo ban đầu: [001_initial.sql](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/migrations/001_initial.sql)
    *   File khởi tạo bảng Chat: [002_chat_tables.sql](file:///d:/SWD392/Project/SWD392_Chatbot_RAG/backend/go/migrations/002_chat_tables.sql)

### Bước 2: Cài Đặt Môi Trường
Đảm bảo file `backend/go/.env` của bạn có đầy đủ các thông tin:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/swd391_db?sslmode=disable
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_CHAT_MODEL=gemini-2.5-flash
```

### Bước 3: Khởi Động Dự Án

*   **Chạy toàn bộ hệ thống (Go Server + Hono Auth service):**
    Mở Command Prompt/PowerShell tại thư mục `backend/` và chạy:
    ```cmd
    .\start-backends.bat
    ```
*   **Chạy Web Frontend:**
    Mở terminal tại thư mục `frontend/` và chạy:
    ```bash
    pnpm dev  # hoặc npm run dev
    ```

### Bước 4: Kiểm Thử
*   Truy cập Swagger UI của dự án tại: **[http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)**
*   Nhấp **Authorize**, điền token đăng nhập để kiểm thử trực tiếp các API.
