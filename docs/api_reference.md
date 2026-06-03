# SWD392 Chatbot RAG - API Reference Document

Tài liệu chi tiết toàn bộ các REST API được triển khai trên Go Lang Server (`http://localhost:8080`).

---

## 🔑 Cơ chế Xác thực (Authentication)
Tất cả các API (ngoại trừ Health Check và Swagger) đều yêu cầu Header xác thực sau:
* **Header Key**: `Authorization`
* **Header Value**: `Bearer <session_token>`
* **Ví dụ test nhanh trên Postman**: `Bearer giangvien-token-123456`

---

## 1. API Hệ thống (Public & System)

### 1.1. Health Check
* **Method**: `GET`
* **URL**: `/api/health`
* **Xác thực**: Không yêu cầu
* **Phản hồi mẫu (200 OK)**:
  ```json
  {
    "status": "ok",
    "version": "1.0.0",
    "uptime": "5m23s",
    "services": {
      "database": "ok"
    },
    "memory": "8.50 MB"
  }
  ```

### 1.2. Swagger Documentation UI
* **Method**: `GET`
* **URL**: `/swagger/index.html`
* **Xác thực**: Không yêu cầu
* **Mô tả**: Giao diện hiển thị tài liệu API tương tác trực quan.

---

## 2. API Nghiệp vụ Tài liệu (Giảng viên & Sinh viên)

### 2.1. Lấy danh mục bộ lọc (Metadata Lookups)
* **Method**: `GET`
* **URL**: `/api/documents/lookups`
* **Vai trò**: Sinh viên (3), Giảng viên (2), Admin (1)
* **Mô tả**: Trả về danh sách môn học, học kỳ, loại học liệu, nguồn tài liệu và ngôn ngữ để hiển thị lên giao diện lọc.

### 2.2. Lấy danh sách tài liệu công khai
* **Method**: `GET`
* **URL**: `/api/documents`
* **Vai trò**: Sinh viên (3), Giảng viên (2)
* **Query Params (Lọc & Tìm kiếm)**:
  * `q`: Từ khóa tìm kiếm (tiêu đề, môn học, mô tả)
  * `subjectId`: Lọc theo UUID môn học
  * `documentTypeId`: Lọc theo UUID loại học liệu
  * `languageId`: Lọc theo UUID ngôn ngữ
  * `documentSourceId`: Lọc theo UUID nguồn
  * `sortBy`: `title_asc`, `title_desc`, `date_asc`, `date_desc` (mặc định), `views_asc`, `views_desc`
  * `page`: Trang hiện tại (mặc định: `1`)
  * `pageSize`: Kích thước trang (mặc định: `6`)

### 2.3. Xem chi tiết tài liệu bằng Slug (Đọc trang văn bản)
* **Method**: `GET`
* **URL**: `/api/documents/:slug`
* **Vai trò**: Sinh viên (3), Giảng viên (2), Admin (1)
* **Query Params**:
  * `chunkPage`: Số trang văn bản cần đọc (mặc định: `1`)
  * `chunkPageSize`: Số lượng chunks mỗi trang, kẹp từ `8` đến `10` (mặc định: `10`)
* **Mô tả**: Tự động tăng lượt xem (`view_count`) khi tải `chunkPage = 1`. Trả về thông tin file, mục lục AI (Chapters) và nội dung văn bản tương ứng với trang.

### 2.4. Báo cáo tài liệu vi phạm
* **Method**: `POST`
* **URL**: `/api/documents/:slug/report`
* **Vai trò**: Sinh viên (3), Giảng viên (2)
* **Body (JSON)**:
  ```json
  {
    "reason": "Tài liệu chứa thông tin sai lệch / vi phạm bản quyền"
  }
  ```

---

## 3. API Dành riêng cho Giảng viên (Lecturer Only)

### 3.1. Thống kê Dashboard
* **Method**: `GET`
* **URL**: `/api/documents/dashboard`
* **Vai trò**: Giảng viên (2)
* **Mô tả**: Trả về thống kê tổng số tài liệu, files, chunks của giảng viên cùng danh sách upload jobs đang chạy.

### 3.2. Danh sách tài liệu cá nhân
* **Method**: `GET`
* **URL**: `/api/documents/my`
* **Vai trò**: Giảng viên (2)
* **Query Params**: Tương tự như API `GET /api/documents` nhưng có thêm lọc `termId` (UUID học kỳ) và hiển thị các Job chạy ngầm đang xử lý.

### 3.3. Tải lên tài liệu mới (Upload)
* **Method**: `POST`
* **URL**: `/api/documents/upload`
* **Vai trò**: Giảng viên (2)
* **Body**: Gửi bằng **form-data** với các trường sau:
  * `file`: Tệp tin vật lý (PDF, DOC, DOCX, PPT, PPTX tối đa 50MB)
  * `title`: Tiêu đề (Chuỗi)
  * `description`: Mô tả ngắn (Chuỗi, tùy chọn)
  * `subject_id`, `document_type_id`, `academic_term_id`, `language_id`, `document_source_id` (UUID lấy từ API `/lookups`)
  * `visibility`: `"school_wide"` (mặc định), `"public"`, hoặc `"private"`

### 3.4. Cập nhật thông tin tài liệu (Edit)
* **Method**: `POST`
* **URL**: `/api/documents/:slug/edit`
* **Vai trò**: Giảng viên (2)
* **Body (JSON)**:
  ```json
  {
    "id": "uuid-của-document",
    "title": "Tiêu đề mới",
    "description": "Mô tả mới",
    "subject_id": "uuid-môn-học",
    "document_type_id": "uuid-loại-học-liệu",
    "academic_term_id": "uuid-học-kỳ",
    "language_id": "uuid-ngôn-ngữ",
    "document_source_id": "uuid-nguồn",
    "visibility": "public"
  }
  ```

### 3.5. Xem thông tin thống kê trước khi xóa
* **Method**: `GET`
* **URL**: `/api/documents/:slug/delete-view`
* **Vai trò**: Giảng viên (2)
* **Mô tả**: Trả về thống kê số lượng file và chunks sẽ bị xóa sạch nếu xác nhận xóa tài liệu này.

### 3.6. Xác nhận xóa tài liệu
* **Method**: `POST`
* **URL**: `/api/documents/:slug/delete`
* **Vai trò**: Giảng viên (2)
* **Mô tả**: Xóa sạch tài liệu khỏi Database và xóa các tệp tin vật lý tương ứng trên AWS S3.

---

## 4. API Dành cho Quản trị viên (Admin Only - role_id = 1)

### 4.1. Quản lý Người dùng (Users)
* **Xem danh sách người dùng**:
  * **Method**: `GET`
  * **URL**: `/api/admin/users`
* **Khóa tài khoản**:
  * **Method**: `POST`
  * **URL**: `/api/admin/users/:id/block`
* **Mở khóa tài khoản**:
  * **Method**: `POST`
  * **URL**: `/api/admin/users/:id/unblock`

### 4.2. Duyệt tài liệu & Báo cáo
* **Danh sách tài liệu hệ thống**:
  * **Method**: `GET`
  * **URL**: `/api/admin/documents`
* **Phê duyệt tài liệu**:
  * **Method**: `POST`
  * **URL**: `/api/admin/documents/:id/approve`
* **Từ chối tài liệu**:
  * **Method**: `POST`
  * **URL**: `/api/admin/documents/:id/reject`
* **Xóa tài liệu bất kỳ**:
  * **Method**: `POST`
  * **URL**: `/api/admin/documents/:id/delete`
* **Danh sách báo cáo vi phạm**:
  * **Method**: `GET`
  * **URL**: `/api/admin/reports`
* **Xử lý báo cáo vi phạm**:
  * **Method**: `POST`
  * **URL**: `/api/admin/reports/:id/resolve?resolution=delete` (hoặc `resolution=ignore`)

### 4.3. Quản lý Danh mục (CRUD Metadata)

#### 1. Môn học (Subjects)
* **Tạo**: `POST` `/api/admin/subjects`
  * Body: `{"code": "SWD392", "name": "Software Architecture", "academicTermId": "uuid-học-kỳ"}`
* **Sửa**: `PUT` `/api/admin/subjects/:id`
* **Xóa**: `DELETE` `/api/admin/subjects/:id`

#### 2. Loại học liệu (Document Types)
* **Tạo**: `POST` `/api/admin/document-types`
  * Body: `{"name": "Bài tập lớn", "description": "Tài liệu hướng dẫn bài tập"}`
* **Sửa**: `PUT` `/api/admin/document-types/:id`
* **Xóa**: `DELETE` `/api/admin/document-types/:id`

#### 3. Ngôn ngữ (Languages)
* **Tạo**: `POST` `/api/admin/languages`
  * Body: `{"code": "en", "name": "English"}`
* **Sửa**: `PUT` `/api/admin/languages/:id`
* **Xóa**: `DELETE` `/api/admin/languages/:id`

#### 4. Nguồn tài liệu (Document Sources)
* **Tạo**: `POST` `/api/admin/document-sources`
  * Body: `{"name": "Thư viện Trường"}`
* **Sửa**: `PUT` `/api/admin/document-sources/:id`
* **Xóa**: `DELETE` `/api/admin/document-sources/:id`

#### 5. Học kỳ (Academic Terms)
* **Tạo**: `POST` `/api/admin/academic-terms`
  * Body: `{"name": "Kỳ 2 năm 2026", "order": 2}`
* **Sửa**: `PUT` `/api/admin/academic-terms/:id`
* **Xóa**: `DELETE` `/api/admin/academic-terms/:id`
