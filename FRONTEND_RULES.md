# Frontend Development Rules & Standards

Dự án này tuân thủ nghiêm ngặt các quy tắc sau đây trong quá trình phát triển Frontend. **Tuyệt đối không vi phạm.**

## 1. Kiến trúc thư mục (Architecture)
- **Feature-based Architecture (Feature-Sliced Design - FSD)**: Tổ chức code theo từng tính năng (ví dụ: `src/features/auth`, `src/features/library`, `src/features/studio`).
- **Không gom code thành "Global Bucket"**: Không nhét tất cả components vào `src/components` trừ khi nó là thành phần dùng chung (Shared UI / Shadcn).

## 2. Công nghệ cốt lõi
- **Framework**: Next.js (App Router) + TypeScript.
- **Styling**: **TailwindCSS** + **Shadcn UI**.
- **Data Fetching**: 
  - **TUYỆT ĐỐI KHÔNG SỬ DỤNG AXIOS.**
  - Sử dụng Native `fetch` API hoặc trình bọc tuỳ biến (ví dụ: `src/shared/utils/apiClient.ts`).

## 3. Thiết kế & Giao diện (Aesthetics)
- **Phong cách**: "Cinematic Canvas" - Dark Mode, giao diện tối cao cấp.
- **Màu sắc**: Không dùng màu mặc định cơ bản. Ưu tiên sử dụng dải màu hệ thống đã định nghĩa (Đỏ sậm, Vàng kim, Kính mờ/Glassmorphism).
- **Typography**: Kết hợp giữa **Manrope** (Tiêu đề, nổi bật) và **Inter** (Nội dung, văn bản đọc).
- **Trải nghiệm (UX)**: Giao diện phải mượt mà, có hiệu ứng hover, loading state và thông báo lỗi rõ ràng. Không dùng thiết kế "nhàm chán" hay giống Bootstrap.

## 4. Tương tác với API
- Gọi API phải qua **API Gateway** (`NEXT_PUBLIC_GATEWAY_URL`).
- Token `accessToken` nằm trong response body, lưu vào bộ nhớ / Context.
- `refresh_token` là `httpOnly cookie`, trình duyệt tự xử lý. Phải set `credentials: "include"` khi dùng fetch.
- Luôn phải có luồng xử lý lỗi 401: Khi token hết hạn, phải tự động auto-refresh token ngầm.

## 5. Quy tắc phối hợp cùng AI
- **Intelligent Routing**: Mọi hành động của AI phải khai báo chuyên gia đang xử lý (ví dụ: `🤖 Applying knowledge of @[frontend-specialist]...`).
- **Socratic Gate**: Trước khi code tính năng mới, AI phải "Hỏi" hoặc "Lên Kế Hoạch" (`implementation_plan.md`) trước để người dùng xác nhận.
- **Không giả định**: Nếu không biết rõ yêu cầu, phải hỏi lại.
- **Đồng bộ Giao diện và API**: Khi lên plan, nếu phát hiện field trên UI không khớp với API contract (thừa hoặc thiếu), **PHẢI HỎI** người dùng để ra quyết định. Ví dụ: API chỉ yêu cầu `email` và `password` nhưng Form có thêm `fullName` -> Cần xác nhận để xoá field thừa đi.
