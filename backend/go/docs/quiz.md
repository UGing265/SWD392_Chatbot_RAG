QUIZ MODULE - BUSINESS RULES & FUNCTIONAL REQUIREMENTS

Mục tiêu tab này
Tài liệu này dùng để phân rã chi tiết module Quiz cho hệ thống StudyMate RAG. Nội dung được viết theo hướng yêu cầu mục tiêu để duyệt nghiệp vụ trước, không mặc định rằng toàn bộ chức năng đã được triển khai trong code hiện tại.

1. Ghi nhận yêu cầu ban đầu từ nháp của thái

Actor chính:
- Lecturer: tạo, quản lý, chỉnh sửa và công khai quiz cho sinh viên.
- Student: xem danh sách quiz công khai, tham gia làm quiz, nộp bài và xem kết quả/thống kê cá nhân.

Yêu cầu nghiệp vụ đã nêu:
- Lecturer có quyền CRUD quiz.
- Lecturer có thể tạo quiz bằng AI từ nội dung tài liệu học thuật đã có trong hệ thống.
- Lecturer nhấn nút tạo quiz, hệ thống xử lý nội dung, truy xuất tài liệu/chunk liên quan và sinh quiz tự động.
- Số lượng câu hỏi do Lecturer chọn, trong khoảng 10 đến 100 câu.
- Quiz chỉ gồm câu hỏi trắc nghiệm, không có câu tự luận.
- Mỗi câu hỏi có nhiều đáp án lựa chọn, tối đa từ A đến G, tức tối đa 7 lựa chọn.
- Lecturer có thể chỉnh sửa câu hỏi, chỉnh đáp án, thêm đáp án, xóa đáp án, chọn đáp án đúng.
- Lecturer có thể tạo thêm câu hỏi thủ công nếu câu AI sinh ra chưa đủ hoặc chưa đúng.
- Lecturer có thể xóa câu hỏi bất ổn hoặc chỉnh lại nội dung trước khi công khai.
- Sau khi hoàn tất, Lecturer có thể bật trạng thái công khai để Student vào làm.
- Student chỉ tham gia làm quiz, không được tạo hoặc chỉnh sửa quiz.
- Lecturer có thể theo dõi sinh viên làm quiz và xem câu nào đúng/sai.
- Sau khi Student làm xong, hệ thống có thống kê kết quả.
- Không cần password cho quiz trong phạm vi hiện tại.

2. Phân tích và phản biện phạm vi

2.1 Điểm hợp lý
- Không dùng password giúp luồng làm quiz đơn giản, phù hợp với nền tảng học nội bộ đã có đăng nhập và phân quyền.
- Chỉ dùng trắc nghiệm giúp hệ thống chấm điểm tự động, giảm độ phức tạp so với tự luận.
- Cho Lecturer review trước khi publish là cần thiết vì AI có thể sinh câu hỏi sai, mơ hồ hoặc lệch nội dung tài liệu.
- Giới hạn 10-100 câu hợp lý cho việc tạo quiz linh hoạt, nhưng cần kiểm soát chi phí AI và thời gian sinh.
- Giới hạn đáp án A-G đủ rộng cho quiz học thuật, nhưng vẫn giữ UI và validation dễ kiểm soát.

2.2 Điểm cần chốt để tránh mơ hồ
- Quiz có giới hạn thời gian làm bài hay không? Nếu có, thời lượng tính theo phút và hệ thống có tự nộp bài khi hết giờ không?
- Student được làm lại quiz nhiều lần hay chỉ một lần? Nếu nhiều lần thì lưu điểm cao nhất, điểm gần nhất hay tất cả attempts?
- Student có được xem đáp án đúng ngay sau khi nộp không, hay chỉ xem điểm tổng?
- Lecturer có được xem chi tiết từng attempt của từng Student không?
- Quiz công khai theo môn học, theo học kỳ, hay theo tài liệu cụ thể?
- AI sinh quiz từ một tài liệu, nhiều tài liệu, một môn học, hay một chương cụ thể?
- Khi Lecturer sửa quiz đã publish, hệ thống xử lý các attempt cũ như thế nào?
- Có cần random thứ tự câu hỏi và đáp án để giảm gian lận không?
- Quiz có cần trạng thái draft/published/archived không?
- Quiz có cần ngày mở/ngày đóng không? Nếu chưa cần thì ghi rõ ngoài phạm vi.

2.3 Đề xuất baseline để dễ triển khai
- Baseline nên có 3 trạng thái quiz: Draft, Published, Archived.
- Student chỉ thấy quiz ở trạng thái Published.
- Không dùng password quiz trong baseline.
- Mỗi Student được làm nhiều lần, hệ thống lưu từng attempt; thống kê hiển thị lần gần nhất và điểm cao nhất.
- Khi quiz đã có attempt, Lecturer vẫn được sửa nhưng hệ thống phải lưu version hoặc cảnh báo rằng thay đổi có thể làm lệch thống kê.
- AI chỉ tạo bản nháp; Lecturer bắt buộc review và publish thủ công.
- Mỗi câu hỏi bắt buộc có 2-7 lựa chọn và đúng 1 đáp án đúng.
- Quiz chỉ hỗ trợ single-choice MCQ trong baseline, không hỗ trợ tự luận, multiple-correct, upload file hoặc câu hỏi dạng kéo thả.

3. Operation Breakdown

QUIZ-O1 - Lecturer tạo quiz bằng AI
Mục tiêu: Lecturer tạo bản nháp quiz từ tài liệu/môn học bằng AI.
Actor: Lecturer.
Trạng thái triển khai đề xuất: YÊU CẦU MỤC TIÊU / UI PROTOTYPE nếu chỉ có mock UI.

Câu hỏi nghiệp vụ cần chốt:
- Lecturer chọn nguồn tạo quiz theo subject, document, chapter hay nhiều document?
- AI sinh quiz dựa trên toàn bộ tài liệu hay chỉ các chunk liên quan?
- Số câu tối thiểu/tối đa là bao nhiêu? Baseline: 10-100.
- Nếu tài liệu chưa indexed hoặc không có chunk thì hệ thống xử lý thế nào?
- Nếu AI trả JSON lỗi hoặc thiếu đáp án đúng thì retry hay báo lỗi?
- Quiz AI sinh ra có publish ngay không? Baseline: không, chỉ tạo Draft.

Quyết định baseline:
- Lecturer chỉ được tạo quiz cho môn học mà họ được phân công.
- Quiz AI phải được tạo ở trạng thái Draft.
- AI phải sinh câu hỏi từ tài liệu đã indexed/completed.
- Mỗi câu hỏi AI sinh ra phải có nội dung câu hỏi, 2-7 lựa chọn, đúng 1 đáp án đúng và nên có giải thích ngắn.
- Lecturer phải review và lưu trước khi publish.

QUIZ-O2 - Lecturer chỉnh sửa và quản lý quiz
Mục tiêu: Lecturer kiểm soát chất lượng quiz trước và sau khi publish.
Actor: Lecturer.
Trạng thái triển khai đề xuất: UI PROTOTYPE / YÊU CẦU MỤC TIÊU.

Câu hỏi nghiệp vụ cần chốt:
- Lecturer có được xóa quiz đã có student attempt không?
- Có cần archive thay vì delete cứng không?
- Có cần versioning khi sửa câu hỏi đã có attempt không?
- Câu hỏi có điểm riêng từng câu không hay mỗi câu 1 điểm?

Quyết định baseline:
- Lecturer có thể tạo, xem, cập nhật, xóa hoặc archive quiz của môn mình phụ trách.
- Quiz đã publish và đã có attempt không nên hard delete; nên chuyển Archived để bảo toàn lịch sử làm bài.
- Lecturer có thể thêm/xóa/sửa câu hỏi trong Draft thoải mái.
- Với Published quiz đã có attempt, hệ thống nên cảnh báo trước khi sửa và ghi nhận version hoặc mốc cập nhật.

QUIZ-O3 - Lecturer publish quiz cho Student
Mục tiêu: Chỉ quiz hợp lệ mới được hiển thị cho Student.
Actor: Lecturer.
Trạng thái triển khai đề xuất: YÊU CẦU MỤC TIÊU.

Câu hỏi nghiệp vụ cần chốt:
- Publish theo học kỳ, môn học, lớp hay toàn bộ sinh viên có quyền xem môn đó?
- Có ngày mở/ngày đóng không?
- Có cần ẩn kết quả/ẩn đáp án đúng sau khi nộp không?

Quyết định baseline:
- Quiz Published hiển thị cho Student theo subject và academic term tương ứng.
- Draft không hiển thị với Student.
- Archived không cho Student làm mới nhưng vẫn giữ lịch sử attempt.
- Không yêu cầu password quiz.

QUIZ-O4 - Student làm quiz
Mục tiêu: Student chọn quiz công khai, trả lời trắc nghiệm và nộp bài.
Actor: Student.
Trạng thái triển khai đề xuất: UI PROTOTYPE / YÊU CẦU MỤC TIÊU.

Câu hỏi nghiệp vụ cần chốt:
- Student có phải trả lời tất cả câu hỏi mới được nộp không?
- Có giới hạn thời gian không?
- Có random câu hỏi/đáp án không?
- Có cho làm lại không?

Quyết định baseline:
- Student chỉ làm quiz Published.
- Student phải chọn một đáp án cho mỗi câu trước khi nộp.
- Hệ thống tự chấm điểm ngay khi nộp vì chỉ có MCQ single-choice.
- Không có câu tự luận trong baseline.
- Nếu cho phép retry, mỗi lần nộp tạo một attempt riêng.

QUIZ-O5 - Lecturer theo dõi kết quả và thống kê
Mục tiêu: Lecturer theo dõi hiệu quả học tập và chất lượng câu hỏi.
Actor: Lecturer.
Trạng thái triển khai đề xuất: YÊU CẦU MỤC TIÊU.

Câu hỏi nghiệp vụ cần chốt:
- Lecturer xem thống kê theo quiz, theo student hay theo câu hỏi?
- Có cần export kết quả ra Excel/PDF không?
- Có cần thống kê câu hỏi nào nhiều sinh viên sai nhất không?

Quyết định baseline:
- Lecturer xem được danh sách Student đã làm quiz, điểm số, số câu đúng/sai, thời gian nộp.
- Lecturer xem được chi tiết từng câu đúng/sai trong attempt của Student.
- Hệ thống hiển thị thống kê tổng quan: số lượt làm, điểm trung bình, điểm cao nhất, điểm thấp nhất, tỷ lệ đúng theo từng câu.

4. Business Rules

BR-QUIZ-01 - Chỉ Lecturer được phân công môn học mới được tạo quiz cho môn đó. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-02 - AI-generated quiz chỉ được tạo từ tài liệu đã xử lý hoàn tất và có nội dung chunk hợp lệ. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-03 - Quiz do AI tạo ra luôn ở trạng thái Draft, không được tự động publish cho Student. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-04 - Lecturer phải review và xác nhận quiz trước khi publish. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-05 - Một quiz phải có từ 10 đến 100 câu hỏi khi publish. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-06 - Mỗi câu hỏi chỉ hỗ trợ dạng trắc nghiệm một đáp án đúng trong baseline. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-07 - Mỗi câu hỏi phải có tối thiểu 2 lựa chọn và tối đa 7 lựa chọn, tương ứng A đến G. Hiện trạng: UI PROTOTYPE / YÊU CẦU MỤC TIÊU.
BR-QUIZ-08 - Mỗi câu hỏi phải có đúng một đáp án được đánh dấu là đáp án đúng. Hiện trạng: UI PROTOTYPE.
BR-QUIZ-09 - Student không được tạo, sửa, xóa hoặc publish quiz. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-10 - Student chỉ nhìn thấy và làm được quiz ở trạng thái Published. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-11 - Quiz ở trạng thái Draft chỉ hiển thị cho Lecturer sở hữu hoặc Lecturer được phân quyền môn học. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-12 - Quiz ở trạng thái Archived không cho Student tạo attempt mới nhưng vẫn giữ lịch sử kết quả cũ. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-13 - Student phải trả lời tất cả câu hỏi trước khi nộp nếu quiz không cho phép bỏ trống. Hiện trạng: UI PROTOTYPE.
BR-QUIZ-14 - Mỗi lần Student nộp bài phải tạo một attempt độc lập, ghi lại câu trả lời, điểm số, thời gian bắt đầu và thời gian nộp. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-15 - Điểm số của quiz MCQ được tính tự động dựa trên số câu trả lời đúng tại thời điểm nộp bài. Hiện trạng: UI PROTOTYPE / YÊU CẦU MỤC TIÊU.
BR-QUIZ-16 - Lecturer được xem kết quả quiz của Student thuộc quiz do mình quản lý, nhưng không được xem kết quả quiz của môn không được phân công. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-17 - Nếu quiz đã có attempt, mọi thay đổi nội dung câu hỏi/đáp án phải được ghi nhận bằng version hoặc ít nhất hiển thị cảnh báo trước khi lưu. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-18 - Hệ thống không yêu cầu password quiz trong baseline; quyền truy cập dựa trên đăng nhập, role và phạm vi môn học. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-19 - AI output phải được validate schema trước khi lưu: đủ câu hỏi, đủ lựa chọn, đúng một đáp án đúng, không có câu rỗng. Hiện trạng: YÊU CẦU MỤC TIÊU.
BR-QUIZ-20 - Câu hỏi AI sinh ra phải có nguồn ngữ cảnh từ tài liệu/chunk để Lecturer có thể kiểm tra độ tin cậy khi cần. Hiện trạng: YÊU CẦU MỤC TIÊU.

5. Functional Requirements

FR-QUIZ-01 - Tạo quiz thủ công
Actor: Lecturer.
Mô tả: Hệ thống phải cho phép Lecturer tạo quiz mới bằng cách nhập tiêu đề, mô tả, học kỳ, môn học và danh sách câu hỏi trắc nghiệm.
Acceptance criteria:
- Lecturer chỉ chọn được môn học được phân công.
- Quiz mới mặc định ở trạng thái Draft.
- Không cho lưu nếu thiếu tiêu đề hoặc môn học.
- Không cho publish nếu số câu không nằm trong khoảng 10-100.

FR-QUIZ-02 - Tạo quiz bằng AI
Actor: Lecturer.
Mô tả: Hệ thống phải cho phép Lecturer tạo quiz bằng AI từ tài liệu, chương hoặc môn học đã được indexed.
Acceptance criteria:
- Lecturer chọn subject/document/chapter làm nguồn sinh quiz.
- Lecturer chọn số lượng câu hỏi từ 10 đến 100.
- Hệ thống chỉ dùng tài liệu đã completed/indexed.
- AI trả về câu hỏi MCQ theo schema hợp lệ.
- Nếu AI lỗi, hệ thống hiển thị thông báo rõ ràng và không tạo quiz rác.
- Quiz AI sinh ra ở trạng thái Draft.

FR-QUIZ-03 - Validate AI-generated quiz
Actor: System.
Mô tả: Hệ thống phải kiểm tra dữ liệu quiz do AI sinh ra trước khi lưu.
Acceptance criteria:
- Mỗi câu có nội dung không rỗng.
- Mỗi câu có 2-7 lựa chọn.
- Mỗi câu có đúng một đáp án đúng.
- Lựa chọn không được rỗng hoặc trùng hoàn toàn trong cùng câu hỏi.
- Tổng số câu đúng với số lượng Lecturer yêu cầu hoặc báo thiếu để Lecturer xử lý.

FR-QUIZ-04 - Chỉnh sửa quiz draft
Actor: Lecturer.
Mô tả: Lecturer phải có thể chỉnh sửa quiz Draft trước khi công khai.
Acceptance criteria:
- Lecturer sửa tiêu đề, mô tả, học kỳ, môn học nếu còn quyền.
- Lecturer thêm/sửa/xóa câu hỏi.
- Lecturer thêm/sửa/xóa lựa chọn A-G.
- Lecturer chọn đúng một đáp án đúng cho mỗi câu.
- Hệ thống không cho xóa lựa chọn nếu câu hỏi còn dưới 2 lựa chọn.

FR-QUIZ-05 - Quản lý trạng thái quiz
Actor: Lecturer.
Mô tả: Lecturer phải có thể chuyển quiz giữa Draft, Published và Archived theo quyền hợp lệ.
Acceptance criteria:
- Draft có thể publish nếu hợp lệ.
- Published hiển thị cho Student.
- Archived không hiển thị trong danh sách quiz có thể làm mới.
- Hệ thống không cho publish quiz thiếu câu hỏi, thiếu đáp án đúng hoặc vượt giới hạn.

FR-QUIZ-06 - Danh sách quiz cho Lecturer
Actor: Lecturer.
Mô tả: Hệ thống phải cung cấp danh sách quiz do Lecturer quản lý.
Acceptance criteria:
- Có lọc theo học kỳ, môn học, trạng thái.
- Có tìm kiếm theo tiêu đề quiz.
- Hiển thị số câu, trạng thái, số lượt làm và ngày cập nhật.

FR-QUIZ-07 - Xóa hoặc archive quiz
Actor: Lecturer.
Mô tả: Lecturer phải có thể xóa quiz chưa có attempt hoặc archive quiz đã có attempt.
Acceptance criteria:
- Quiz Draft chưa có attempt có thể xóa.
- Quiz Published đã có attempt không nên hard delete; chuyển Archived.
- Hệ thống cảnh báo trước khi xóa/archive.

FR-QUIZ-08 - Danh sách quiz công khai cho Student
Actor: Student.
Mô tả: Student phải xem được các quiz Published theo học kỳ và môn học.
Acceptance criteria:
- Student không thấy Draft.
- Student không làm được Archived quiz.
- Có lọc theo học kỳ, môn học và tìm kiếm theo tên quiz.
- Hiển thị số câu, thời lượng nếu có, trạng thái đã làm/chưa làm.

FR-QUIZ-09 - Student làm quiz
Actor: Student.
Mô tả: Student phải có thể mở quiz Published, chọn đáp án cho từng câu và nộp bài.
Acceptance criteria:
- Mỗi câu chỉ chọn được một đáp án.
- Hệ thống hiển thị tiến độ số câu đã trả lời.
- Nếu baseline yêu cầu trả lời đủ, nút nộp bị disable cho đến khi đủ câu.
- Khi nộp bài, hệ thống lưu attempt và answers.

FR-QUIZ-10 - Tự động chấm điểm
Actor: System.
Mô tả: Hệ thống phải tự động chấm điểm quiz MCQ sau khi Student nộp.
Acceptance criteria:
- Điểm = số câu đúng / tổng số câu.
- Lưu số câu đúng, số câu sai, phần trăm đúng.
- Lưu chi tiết đáp án Student đã chọn cho từng câu.
- Không cần chấm tự luận vì ngoài phạm vi.

FR-QUIZ-11 - Hiển thị kết quả cho Student
Actor: Student.
Mô tả: Sau khi nộp bài, Student xem kết quả cá nhân.
Acceptance criteria:
- Hiển thị điểm số, tỷ lệ đúng và số câu đúng/sai.
- Hiển thị từng câu đúng/sai nếu chính sách cho phép.
- Nếu cho xem đáp án đúng, hệ thống hiển thị đáp án đúng và đáp án Student chọn.
- Student xem được lịch sử các lần làm của mình.

FR-QUIZ-12 - Theo dõi kết quả Student cho Lecturer
Actor: Lecturer.
Mô tả: Lecturer phải xem được kết quả làm quiz của Student cho quiz mình quản lý.
Acceptance criteria:
- Hiển thị danh sách attempts theo Student.
- Hiển thị điểm, số câu đúng/sai, thời gian nộp.
- Lecturer xem chi tiết câu nào Student trả lời đúng/sai.
- Lecturer không xem được kết quả quiz thuộc môn không được phân công.

FR-QUIZ-13 - Thống kê quiz
Actor: Lecturer.
Mô tả: Hệ thống phải cung cấp thống kê tổng quan và thống kê theo câu hỏi.
Acceptance criteria:
- Hiển thị số lượt làm.
- Hiển thị điểm trung bình, cao nhất, thấp nhất.
- Hiển thị tỷ lệ hoàn thành nếu có danh sách Student mục tiêu.
- Hiển thị tỷ lệ đúng/sai theo từng câu hỏi.
- Có thể xác định câu hỏi có tỷ lệ sai cao để Lecturer chỉnh nội dung giảng dạy hoặc chỉnh quiz.

FR-QUIZ-14 - Audit và truy vết thay đổi quiz
Actor: System.
Mô tả: Hệ thống nên ghi nhận các thao tác nhạy cảm trên quiz.
Acceptance criteria:
- Ghi log khi tạo quiz, publish, archive, delete.
- Ghi log khi sửa quiz đã Published.
- Log có actor, thời gian, quiz ID và hành động.

6. Data Model Gợi Ý

Quiz:
- id
- title
- description
- subject_id
- academic_term_id
- lecturer_id
- status: draft/published/archived
- source_type: manual/ai
- question_count
- duration_minutes nullable
- created_at, updated_at, published_at, archived_at

QuizQuestion:
- id
- quiz_id
- question_order
- question_text
- explanation nullable
- source_chunk_id nullable
- created_at, updated_at

QuizOption:
- id
- question_id
- option_label: A/B/C/D/E/F/G
- option_text
- is_correct

QuizAttempt:
- id
- quiz_id
- student_id
- attempt_number
- started_at
- submitted_at
- score
- total_questions
- correct_count
- wrong_count
- status: in_progress/submitted

QuizAttemptAnswer:
- id
- attempt_id
- question_id
- selected_option_id
- is_correct

7. Edge Cases & Test Scenarios

- Lecturer tạo AI quiz với 10 câu hợp lệ.
- Lecturer tạo AI quiz với 100 câu hợp lệ.
- Từ chối tạo quiz với số câu <10 hoặc >100.
- AI trả câu hỏi thiếu đáp án đúng, hệ thống không lưu hoặc yêu cầu sửa.
- AI trả câu hỏi có 8 đáp án, hệ thống từ chối hoặc cắt theo rule có cảnh báo.
- Lecturer thêm câu hỏi thủ công vào Draft.
- Lecturer xóa câu hỏi khiến quiz còn dưới 10 câu và thử publish, hệ thống từ chối.
- Lecturer publish quiz hợp lệ, Student nhìn thấy trong danh sách.
- Student không nhìn thấy Draft quiz.
- Student làm quiz, chọn đủ đáp án và nộp thành công.
- Student cố nộp khi còn câu chưa chọn, hệ thống từ chối nếu rule yêu cầu trả lời đủ.
- Student nộp bài, hệ thống tính đúng số câu đúng/sai.
- Lecturer xem attempt của Student và thấy câu đúng/sai.
- Lecturer archive quiz đã có attempt, Student không thể làm mới nhưng lịch sử vẫn còn.
- Student cố truy cập quiz không Published bằng URL trực tiếp, hệ thống trả 403 hoặc 404.
- Lecturer môn A cố sửa quiz môn B, hệ thống trả 403.

8. Ngoài phạm vi baseline

- Quiz có password.
- Câu hỏi tự luận.
- Chấm điểm bằng AI cho tự luận.
- Multiple-correct question.
- Random nâng cao theo đề thi nhiều mã đề.
- Proctoring, chống gian lận bằng camera hoặc tab tracking.
- Export bảng điểm ra Excel/PDF, trừ khi stakeholder yêu cầu thêm.
- Livestream quiz hoặc real-time classroom mode.

9. Ghi chú hiện trạng repo

Qua kiểm tra nhanh code hiện tại, quiz đang nghiêng về UI prototype/mock data. Lecturer create quiz và Student take quiz đã có giao diện, nhưng chưa thấy backend API/domain/repository/migration đầy đủ cho quiz attempt, AI generation, publish workflow và statistics. Vì vậy module Quiz trong tài liệu nên ghi là YÊU CẦU MỤC TIÊU hoặc UI PROTOTYPE cho đến khi backend/persistence được triển khai.

