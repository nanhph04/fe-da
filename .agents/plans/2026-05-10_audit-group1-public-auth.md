# Plan: Đối chiếu giao diện — Nhóm 1: Public / Auth

- **Ngày viết:** 2026-05-10
- **Trạng thái:** ✅ Hoàn thành
- **Ngày hoàn thành:** 2026-05-10

---

## Mục tiêu

Đối chiếu 6 giao diện nhóm Public/Auth với mockup HTML, xác định thiếu/sai, code mới hoặc sửa cho khớp.

---

## Tổng quan nhóm

| # | Mockup | Route hiện tại | Có code? | Có API? | Hành động |
|---|--------|---------------|----------|---------|-----------|
| 1 | `home_velvet_gallery_landing_page` | `/(main)/landing` | ✅ Có | ❌ Không | 🔍 Đối chiếu visual |
| 2 | `sign_in_velvet_gallery` | `/(auth)/login` | ✅ Có | ✅ authService | ⚠️ Đối chiếu visual — KHÔNG sửa logic auth |
| 3 | `sign_up_velvet_gallery` | `/(auth)/register` | ✅ Có | ✅ authService | ⚠️ Đối chiếu visual — KHÔNG sửa logic auth |
| 4 | `forgot_password_velvet_gallery` | `/(auth)/forgot-password` | ✅ Có | ✅ authService | ⚠️ Đối chiếu visual — KHÔNG sửa logic auth |
| 5 | `otp_verification_velvet_gallery` | `/(auth)/verify-otp` | ✅ Có | ✅ authService | ⚠️ Đối chiếu visual — KHÔNG sửa logic auth |
| 6 | `change_password_velvet_gallery` | `/(auth)/change-password` | ✅ Có | ✅ authService | ⚠️ Đối chiếu visual — KHÔNG sửa logic auth |

---

## Quy trình cho từng giao diện

### Bước 1: Đối chiếu (mỗi giao diện)

1. Mở `stitch_media_commerce_platform/<tên>/screen.png` — chụp ảnh mockup.
2. Chạy dev server, mở route tương ứng — chụp ảnh thực tế.
3. So sánh: layout, spacing, màu sắc, font, border-radius, icon, nội dung text.

### Bước 2: Phân loại

- **Giống** (≥90%) → Đánh ✅, không cần sửa.
- **Khác nhỏ** (70-90%) → Sửa CSS/Tailwind class, không đụng logic.
- **Khác lớn** (<70%) → Refactor component, giữ nguyên logic API.

### Bước 3: Thực hiện sửa

- **Ưu tiên**: Chỉ sửa visual (className, layout structure).
- **CẤM**: Sửa `authService.ts`, `AuthContext`, logic form validation, API calls.
- **Nếu mockup có element mới**: Thêm component UI mới, không đụng components đang hoạt động.

---

## Lưu ý quan trọng

> ⚠️ **Auth flow đã hoạt động thật** — có `authService.ts`, `LoginForm`, `RegisterForm`, `VerifyOTPForm`, `ChangePasswordForm`, `ForgotPasswordForm`.
> Chỉ sửa **visual/styling**, tuyệt đối không refactor logic, không đổi tên state, không đổi API call.

---

## Kết quả mong đợi

- 6/6 giao diện đối chiếu xong.
- Cập nhật trạng thái trong `AGENTS.md` Section 26.2.
- Không có regression trên auth flow.

---

## Kết quả thực hiện

- Đã đối chiếu và chỉnh visual cho 6/6 giao diện Public/Auth theo mockup HTML.
- Giữ nguyên `authService.ts`, `AuthContext`, form validation và API calls.
- Đã cập nhật lại trạng thái và route thực tế trong `AGENTS.md` Section 26.2.
