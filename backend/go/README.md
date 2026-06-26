# 🚀 SWD392 Chatbot RAG - Core Backend (Go)

Chào mừng bạn đến với **Backend Core** của dự án Chatbot RAG SWD392. Đây là trái tim của hệ thống, chịu trách nhiệm xử lý toàn bộ logic liên quan đến Truy xuất Thông tin (RAG), Quản lý Tài liệu, và trò chuyện với AI.

---

## 🏗️ Kiến Trúc Hệ Thống (Clean Architecture)

Backend được thiết kế chặt chẽ theo **Clean Architecture** để đảm bảo khả năng mở rộng, dễ bảo trì và dễ dàng viết Unit Test. Cấu trúc chia làm 4 tầng chính:

1. **Domain Layer (`internal/domain`)**: Chứa các Entity (Thực thể) và các Interface của Repository. Đây là tầng cốt lõi, không phụ thuộc vào bất kỳ thư viện hay framework nào bên ngoài.
2. **Application Layer (`internal/application`)**: Chứa các **Use-Case** (Logic Nghiệp vụ). Mọi thao tác xử lý dữ liệu (Upload, Phân quyền, Chat) đều nằm ở đây.
3. **Infrastructure Layer (`internal/infrastructure`)**: Tầng giao tiếp với thế giới bên ngoài. Chứa các file kết nối Database (PostgreSQL/pgvector), tương tác với Gemini (LLM & Embedding), File Storage (S3/Local), và thuật toán Chunking/Parsing.
4. **Interface Layer (`internal/interface`)**: Tầng giao tiếp HTTP. Chứa các Handler (Controller), Router, DTO (Data Transfer Object) và Middleware xác thực (Auth).

---

## 🌟 Chức Năng Chính

* **🧠 RAG Pipeline (Retrieval-Augmented Generation)**: 
  * Tự động trích xuất văn bản từ file upload (PDF, DOCX, PPTX, TXT).
  * Chia nhỏ dữ liệu (Chunking) thông minh theo cấu trúc chương.
  * Nhúng vector (Embedding) qua mô hình **Gemini Embedding 2** và lưu vào **pgvector**.
* **📁 Quản lý Tài liệu**:
  * Tải lên, quản lý trạng thái, và phân quyền hiển thị (Công khai / Nội bộ / Cá nhân).
  * Phân quyền truy cập dựa trên Môn học của Giảng viên.
* **💬 Trợ lý AI (Chatbot)**:
  * Trả lời câu hỏi của người dùng dựa trên ngữ cảnh chính xác trích xuất từ dữ liệu nội bộ (Vector Search).
  * Hỗ trợ Stream trả lời theo thời gian thực (Server-Sent Events).
* **🔐 Tích hợp Auth (Better Auth)**:
  * Xác thực JWT Token được cấp phát từ hệ thống Better Auth (Node.js Hono).

---

## 🚀 Hướng Dẫn Sử Dụng (Dành Cho Lập Trình Viên)

### 1. Cài Đặt Môi Trường
Đảm bảo bạn đã cài đặt các công cụ sau:
- **Go** (phiên bản 1.21 trở lên)
- **PostgreSQL** có cài sẵn extension `pgvector`
- Cấu hình file `.env` chứa các biến môi trường cần thiết (GEMINI_API_KEY, DB_URL, BETTER_AUTH_SECRET...)

### 2. Chạy Server
Cách đơn giản nhất để khởi chạy toàn bộ Backend (cùng với Hono Auth Service):
Mở terminal ở thư mục gốc của dự án và chạy:
```cmd
backend\start-backends.bat
```

Hoặc nếu bạn chỉ muốn chạy độc lập Go Server (Mặc định chạy ở **Port 8080**):
```bash
go run ./cmd/server/main.go
```

### 3. Build & Test
- **Biên dịch dự án:**
  ```bash
  go build -o server.exe ./cmd/server/main.go
  ```
- **Chạy Unit Test:**
  Dự án hỗ trợ Manual Mocking cục bộ, cho phép test rất nhanh mà không cần cài thêm thư viện phức tạp.
  ```bash
  # Chạy test chi tiết
  go test ./internal/application/... -v
  ```

---

*Lưu ý: Mọi giao dịch với Database **bắt buộc** phải đi qua tầng Use-Case (Application Layer) theo đúng nguyên tắc Clean Architecture. Tuyệt đối không query DB trực tiếp từ Handler!*
