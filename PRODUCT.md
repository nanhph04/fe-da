File này không phải coding style guide.
File này chỉ mô tả ngữ cảnh sản phẩm, nghiệp vụ, vai trò người dùng và các hành vi UI quan trọng.
Về kiến trúc thư mục, naming convention, component structure, API client và code style, hãy tuân theo file AGENTS.md.

# PRODUCT CONTEXT & BUSINESS SPECIFICATION

## 1. Ứng dụng này là gì? (Project Overview)
Đây là một **Nền tảng Phân phối Nội dung Đa phương tiện (Distributed Media Streaming System)**. 
Hệ thống là sự kết hợp giữa mô hình chia sẻ video (giống YouTube), nền tảng kinh tế nhà sáng tạo (giống Patreon), và hệ thống tiền tệ ảo (giống Twitch/TikTok). 
Mục tiêu của ứng dụng là cung cấp trải nghiệm xem video mượt mà (HLS Streaming), đồng thời cho phép người dùng dễ dàng ủng hộ nhà sáng tạo thông qua hệ thống "Coin" nội bộ với các giao dịch tốc độ cao (micro-transactions).

---

## 2. Các nhóm người dùng (User Roles)
Hệ thống sử dụng mô hình "Hỗn hợp" (Mixed Model) - bất kỳ ai cũng có thể trở thành Nhà sáng tạo.
1. **Guest (Khách vãng lai):** Có thể xem các video public miễn phí, xem thông tin kênh và tìm kiếm nội dung.
2. **Viewer (Người xem / User):** Có thể nạp Tiền thật để lấy Coin, dùng Coin để mua Membership (Gói hội viên) của kênh, xem video độc quyền, tương tác (Like, Comment, Tăng View).
3. **Creator (Nhà sáng tạo):** Chính là các User có tính năng đăng tải video. Có quyền tạo các Tier (Gói hội viên) để kiếm Coin, xem thống kê, quản lý video của mình.
4. **Admin (Quản trị viên hệ thống):** Quản lý nội dung toàn hệ thống. Có quyền khóa/mở kênh (Lock Channel), tước quyền hội viên của kênh (Suspend Membership) và xử lý các nội dung vi phạm.

---

## 3. Các tính năng cốt lõi (Core Features)
* **Real-time Video Processing:** Upload video dung lượng lớn và theo dõi tiến độ xử lý ngầm (Kiểm duyệt AI, Băm HLS) theo thời gian thực.
* **HLS Video Player:** Trình phát video hỗ trợ Adaptive Bitrate Streaming (Tự động nhảy chất lượng 1080p, 720p tùy theo băng thông mạng của Client).
* **Creator Economy (Membership):** Chức năng khóa video, chỉ dành cho hội viên (Members-only). Cấp quyền truy cập dựa trên Tier.
* **Virtual Wallet (Ví Coin Nội bộ):** Hệ thống giao dịch bằng Coin. Tiền thật chỉ xuất hiện ở bước Nạp (Deposit) và Rút (Withdraw) thông qua Payment Gateway.
* **SSE Notifications:** Nhận thông báo từ server một chiều (Server-Sent Events) cho các tiến trình chạy ngầm để không bị chặn UI.
* **Khám phá & Tìm kiếm (Search & Discovery):** Hệ thống tìm kiếm toàn cục (Global Search) hỗ trợ Full-text search thông minh cho Tiêu đề/Mô tả Video và Tên/Tiểu sử Kênh, kết hợp lọc chuyên sâu theo Thể loại (Category).

---

## 4. Luồng hoạt động chính & Vòng đời Dữ liệu (Workflows & Lifecycles)

### A. Vòng đời của Video (Video States)
Video trong hệ thống phải tuân thủ nghiêm ngặt các trạng thái sau để FE điều hướng UI:
* `DRAFT`: Đang chờ upload hoặc upload bị gián đoạn.
* `PROCESSING`: Đang nằm trong Message Broker, đang tiến hành băm HLS hoặc AI đang kiểm duyệt nội dung.
* `READY`: Xử lý thành công, chính thức hiển thị công khai cho Viewer. (Các API danh sách public tuyệt đối chỉ trả về trạng thái này).
* `REJECTED`: Bị AI phát hiện vi phạm chính sách, chặn hiển thị trên toàn hệ thống.
* `FAILED`: Lỗi hệ thống trong quá trình convert HLS (Cần có nút Retry cho Creator).

### B. Luồng Đăng tải & Xử lý Video
1. Creator upload file raw (gọi API lấy Presigned URL rồi upload thẳng lên Cloud Storage).
2. Gọi API `confirm-upload` để báo cho Server biết.
3. Chuyển sang màn hình Dashboard. FE mở kết nối **SSE (Server-Sent Events)** để lắng nghe tiến độ.
4. Server chạy ngầm (AI Kiểm duyệt -> Transcode HLS) và liên tục bắn % qua SSE. FE cập nhật Progress Bar.
5. Khi hoàn tất (chuyển `READY`) hoặc bị AI từ chối (`REJECTED`), FE hiện thông báo kết quả.

### C. Luồng Cấp quyền Hội viên (Eligibility & Admin Control)
Để một Kênh được phép mở tính năng Hội viên, kênh đó phải thỏa mãn hệ thống điều kiện khắt khe:
* **Điều kiện Xét duyệt (Live Eligibility):** Thỏa mãn bộ 3 tiêu chí:
    1. *Năng suất:* Có tối thiểu 10 video ở trạng thái `READY`.
    2. *Sức hút:* Tổng lượt xem toàn kênh đạt >= 1.000 views.
    3. *Uy tín:* Kênh có dưới 5 video bị AI đánh trạng thái `REJECTED` (Chống hành vi spam up video rác).
* **Luật "Earned Once" (Đạt một lần giữ vĩnh viễn):** Một khi kênh đã mở Membership Tier, trạng thái hợp lệ sẽ được duy trì. Nếu kênh vô tình tụt view hoặc xóa bớt video xuống dưới mốc quy định, hệ thống chỉ cảnh báo chứ **không tự động đóng** các Tier đang hoạt động để bảo vệ quyền lợi tài chính của Viewer đã đăng ký.
* **Admin Control:** Tuy nhiên, Admin có đặc quyền đóng (Close) tính năng này bất kỳ lúc nào nếu kênh vi phạm nghiêm trọng (Strike). Khi bị Admin đóng: Kênh không được nhận thêm hội viên mới. FE phải ẩn/disable các nút "Tham gia (Join)" và "Gia hạn (Renew)". Các hội viên cũ vẫn xem được nội dung cho đến khi hết hạn chu kỳ.

### D. Luồng Thanh toán Membership (Giao dịch bằng Coin)
1. Viewer ấn "Đăng ký hội viên".
2. FE hiển thị số dư Coin. Nếu thiếu, gợi ý nạp thêm (qua VNPay/Stripe ra tiền thật).
3. Nếu đủ Coin, gọi API thanh toán nội bộ.
4. Giao dịch mua được xử lý bằng ví Coin. Nếu Tier bất ngờ bị Creator đóng lại trong lúc giao dịch diễn ra, Backend sẽ Reject sự kiện và hoàn bảo toàn số Coin trong ví Viewer (Kèm Toast báo lỗi rõ ràng trên UI).

---

## 5. Quy tắc & Hướng dẫn Trải nghiệm (UI/UX & Technical Rules)

* **Rule 1 - Tối ưu hóa API Calls (Idempotency):** 
  Với mọi thao tác liên quan đến Tiền bạc (Nạp coin, Mua membership), Với một hành động giao dịch duy nhất, FE phải sinh một (`Idempotency-Key`).   Không sinh key mới cho mỗi lần retry của cùng một giao dịch. và gắn vào Header của request. Nếu request bị timeout, FE có thể tự tin gọi lại (Retry) mà không sợ user bị trừ tiền 2 lần. **KHÔNG** được tự sinh Idempotency-Key cho các API đọc dữ liệu (GET).

* **Rule 2 - Bảo mật Upload (Zero-Payload Backend):**
  Tuyệt đối không stream/upload file Media trực tiếp xuyên qua Backend Node.js để tránh sập RAM (OOM). Frontend bắt buộc phải xin Presigned URL và thực hiện thao tác PUT thẳng file media lên MinIO/S3. Backend chỉ làm nhiệm vụ lưu Metadata và quản lý Message Queue.

* **Rule 3 - Real-time nhưng nhẹ nhàng (SSE First):**
  Tuyệt đối không dùng cơ chế Polling (Dùng `setInterval` gọi API liên tục) để check trạng thái video. Bắt buộc phải dùng SSE (EventSource) để hứng event từ Backend. Nhớ dọn dẹp (cleanup/close) SSE khi user chuyển trang để tránh memory leak.

* **Rule 4 - Phản hồi UI tức thì (Optimistic UI & State Blocking):**
  Khi user bấm mua hoặc tương tác (Like, Subscribe), hãy khóa nút bấm (Loading state) ngay lập tức. Đừng để user vô tình thao tác 2 lần liên tiếp.

* **Rule 5 - Xử lý "Coin" thay vì "Tiền":**
  Giao diện hiển thị giá cả cho các dịch vụ bên trong app luôn luôn mang biểu tượng "Coin". Chỉ các màn hình Quản lý ví (Nạp/Rút) mới hiển thị tỷ giá quy đổi ra VNĐ/USD.

* **Rule 6 - Tôn trọng Cờ hệ thống (System Flags):**
  Khi load danh sách video hay chi tiết kênh, chú ý đến các cờ như `isMembershipClosedByAdmin` hay `canRenew`. Nếu cờ này là `false`, không được hiển thị UI cho phép thao tác (Tránh việc user bấm vào rồi mới báo lỗi 403 từ server).

* **Rule 7 - Chống Spam View (View Anti-cheat):**
  Lượt xem (View) phải được quản lý chặt chẽ thông qua cơ chế "Đóng băng" (Cooldown) trên Memory Cache (Redis). Mỗi tài khoản (hoặc IP) chỉ được cộng 1 view cho 1 video trong một khoảng thời gian quy định (VD: 1 giờ). Hơn nữa, Frontend chỉ được phép gọi API đếm view khi video đã được phát tối thiểu từ 10 - 30 giây để đảm bảo người dùng xem thật.
