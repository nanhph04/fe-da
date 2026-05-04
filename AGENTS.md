<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
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

## 3. Kiến trúc Rendering (SSR vs CSR)
- **Lấy Server-Side Rendering (SSR) làm gốc**. Chỉ sử dụng Client-Side Rendering (CSR) khi thực sự cần thiết.
- **DÙNG SSR (Server Components - Mặc định):**
  - Các trang hiển thị dữ liệu tĩnh, bài viết, chi tiết video (SEO quan trọng).
  - Component Layout, Header, Footer, Sidebar.
  - Các hàm fetch dữ liệu ban đầu nên được gọi thẳng ở Server Component, truyền xuống dưới dạng Props.
  - Sử dụng `<Suspense fallback={<Loading />}>` thay vì `useEffect` để quản lý trạng thái loading.
  - Tránh lạm dụng `"use client"` ở component gốc (`page.tsx`).
- **DÙNG CSR (Client Components - Khi cần):**
  - Component có tương tác trực tiếp: Nút bấm (`onClick`), Form nhập liệu (`onChange`).
  - Đẩy chữ `"use client"` xuống các component "lá" (Leaf components) ở cấp thấp nhất có thể. Không bọc toàn bộ trang bằng `"use client"`.
- **Form Handling:** Với Next.js 16+, Ưu tiên sử dụng `next/form` (`<Form>`) cho các request `GET` (như Search, Filter) thay vì form HTML truyền thống.

## 4. Thiết kế & Thẩm mỹ (Aesthetics & UI)
- **Phong cách**: "Cinematic Canvas" - Dark Mode, giao diện tối cao cấp. Tránh xa phong cách "Generic AI".
- **Bảng màu**: TUYỆT ĐỐI KHÔNG dùng màu Tím/Violet (`#8d00e6`, `#cf96ff`) làm màu chủ đạo. Sử dụng các tone màu sắc nét, độ tương phản cao: Đỏ trầm (Crimson), Vàng kim (Gold), Đen nhám (Matte Black), hoặc Trắng ngà (Ivory).
- **Hình khối & Viền**: Giảm thiểu việc bo tròn thái quá. Sử dụng bo góc nhẹ (`rounded-sm` hoặc `rounded-md`). Hạn chế sử dụng "Glassmorphism" rẻ tiền, ưu tiên nền Solid kết hợp viền tinh tế.
- **Typography**: Kết hợp giữa **Manrope** (Tiêu đề, nổi bật) và **Inter** (Nội dung, văn bản đọc).
- **Khoảng trắng (Whitespace)**: Tuân thủ Grid 8px. Thiết kế sang trọng cần Không gian thở (Breathing room).

## 5. Hiệu ứng & Chuyển động (Animations & Performance)
- **Sử dụng CSS Native**: Luôn sử dụng CSS Transitions (`transition-all duration-300 ease-in-out`) cho hover/focus. KHÔNG DÙNG JavaScript cho các hiệu ứng đơn giản.
- Chỉ animate các thuộc tính rẻ tiền: `transform`, `opacity`. Tuyệt đối không animate `width`, `height`, `margin`, `padding` vì sẽ gây Layout Thrashing.
- Hạn chế lạm dụng `animate-pulse`, `animate-spin`. Hiệu ứng xuất hiện chỉ nên mờ vào (`fade-in`) và trượt nhẹ (`slide-up`).

## 6. Tương tác với API
- Gọi API phải qua **API Gateway** (`NEXT_PUBLIC_GATEWAY_URL`).
- Token `accessToken` nằm trong response body, lưu vào bộ nhớ / Context.
- `refresh_token` là `httpOnly cookie`, trình duyệt tự xử lý. Phải set `credentials: "include"` khi dùng fetch.
- Luôn phải có luồng xử lý lỗi 401: Khi token hết hạn, phải tự động auto-refresh token ngầm.

## 7. Quy tắc phối hợp cùng AI
- **Intelligent Routing**: Mọi hành động của AI phải khai báo chuyên gia đang xử lý.
- **Socratic Gate**: Trước khi code tính năng mới, AI phải "Hỏi" hoặc "Lên Kế Hoạch" (`implementation_plan.md`) trước để người dùng xác nhận.
- **Đồng bộ Giao diện và API**: Khi lên plan, nếu phát hiện field trên UI không khớp với API contract, **PHẢI HỎI** người dùng để ra quyết định.
- **Xác thực Code**: Trước khi hoàn thành UI Component, AI phải tự hỏi: Có lạm dụng `"use client"` không? Có vi phạm quy tắc cấm màu Tím không? Hiệu ứng JS có làm nặng trang không?
