# Plan: Đối chiếu giao diện — Nhóm 4: Admin Console

- **Ngày viết:** 2026-05-10
- **Trạng thái:** 📋 Chờ thực hiện
- **Ngày hoàn thành:** —

---

## Mục tiêu

Đối chiếu 12 giao diện nhóm Admin Console với mockup HTML. Nhóm này nhiều nhất, có một số đã code nhưng nhiều trang detail/sub-page cần kiểm tra hoặc code mới.

---

## Tổng quan nhóm

| # | Mockup | Route | Có code? | Có API? | Hành động |
|---|--------|-------|----------|---------|-----------|
| 1 | `content_review_admin_dashboard` | `/admin/(dashboard)/content/review` | ✅ Có | ❌ Không | 🔍 Đối chiếu visual |
| 2 | `video_detail_moderation_admin` | `/admin/(dashboard)/content/[id]` | ✅ Có route `[id]` | ❌ Không | 🔍 Kiểm tra component chi tiết |
| 3 | `content_library_admin_console` | `/admin/(dashboard)/content` | ✅ Có page.tsx | ❌ Không | 🔍 Đối chiếu visual |
| 4 | `user_management_admin_console` | `/admin/(dashboard)/users` | ✅ Có | ❌ Không | 🔍 Đối chiếu visual |
| 5 | `channel_management_admin_console` | `/admin/(dashboard)/channels` | ✅ Có page.tsx | ❌ Không | 🔍 Đối chiếu visual |
| 6 | `verification_queue_admin_console` | `/admin/(dashboard)/verifications` | ✅ Có | ❌ Không | 🔍 Đối chiếu visual |
| 7 | `verification_detail_admin_console` | `/admin/(dashboard)/verifications/[id]` | ✅ Có route `[id]` | ❌ Không | 🔍 Kiểm tra component chi tiết |
| 8 | `category_management_admin_console` | `/admin/(dashboard)/categories` | ✅ Có page.tsx | ❌ Không | 🔍 Đối chiếu visual |
| 9 | `payout_management_admin_console` | `/admin/(dashboard)/payouts` | ✅ Có | ✅ admin-payouts services | ⚠️ CHỈ sửa visual |
| 10 | `payout_request_detail_admin` | `/admin/(dashboard)/payouts/[id]` | ✅ Có route `[id]` | ✅ admin-payouts services | ⚠️ CHỈ sửa visual |
| 11 | `admin_system_settings` | `/admin/(dashboard)/settings` | ✅ Có | ❌ Không | 🔍 Đối chiếu visual |
| 12 | `admin_system_settings_content_policy_editor` | `/admin/(dashboard)/settings/policies` | ❌ Không có route | ❌ Không | 🆕 Code mới |

---

## Chi tiết hành động

### Giao diện CẦN CODE MỚI

**12**: `admin_system_settings_content_policy_editor`
- Route `/admin/(dashboard)/settings/policies` **chưa tồn tại**.
- Cần tạo:
  - `src/app/admin/(dashboard)/settings/policies/page.tsx`
  - Component trong `src/features/admin-settings/components/`
- Tham chiếu mockup: `admin_system_settings_content_policy_editor/code.html`

### Giao diện CẦN KIỂM TRA CHI TIẾT

**2**: `video_detail_moderation_admin`
- Route `/admin/(dashboard)/content/[id]` tồn tại.
- Cần kiểm tra page.tsx có component review detail đầy đủ chưa.
- Mockup có: video preview, metadata, approval/rejection controls.

**7**: `verification_detail_admin_console`
- Route `/admin/(dashboard)/verifications/[id]` tồn tại.
- Cần kiểm tra page.tsx có component verification detail đầy đủ chưa.

**10**: `payout_request_detail_admin`
- Route `/admin/(dashboard)/payouts/[id]` tồn tại.
- Feature `admin-payouts` **có services** → nếu page đã ghép API thì chỉ sửa visual.

### Giao diện CÓ API — CHỈ SỬA VISUAL

**9–10**: Payout Management & Detail
- Feature `admin-payouts` có services (gọi API thật).
- Feature `admin-finance` cũng có services liên quan.
- CHỈ sửa visual, KHÔNG đụng API logic.

### Giao diện AN TOÀN — KHÔNG CÓ API

**1, 3–8, 11**: Content Review, Content Library, Users, Channels, Verifications, Categories, Settings
- Các feature admin này **chỉ có components**, chưa có services.
- An toàn để refactor visual hoàn toàn theo mockup.

---

## Thứ tự thực hiện

1. 🆕 Code mới giao diện 12 (Content Policy Editor) trước.
2. 🔍 Kiểm tra giao diện 2, 7, 10 (detail pages) — xác định cần code thêm không.
3. 🎨 Đối chiếu visual giao diện 1, 3–8, 11 (an toàn, không API).
4. ⚠️ Đối chiếu visual giao diện 9–10 (có API, chỉ sửa styling).

---

## Lưu ý quan trọng

> ⚠️ **Admin layout (`admin-layout` feature) là shared layout cho tất cả admin pages.**
> Nếu sửa sidebar/header trong layout, sẽ ảnh hưởng **tất cả 12 giao diện admin**.
> Sửa layout cần kiểm tra trên nhiều trang.

> ⚠️ **Feature `admin-payouts` và `admin-finance` có API services.**
> Chỉ sửa visual, không refactor component structure.

---

## Kết quả mong đợi

- 12/12 giao diện đối chiếu xong.
- 1 giao diện mới (Content Policy Editor) được code.
- Detail pages (2, 7, 10) được bổ sung nếu thiếu.
- Cập nhật trạng thái trong `AGENTS.md` Section 26.2.
- Không regression trên admin-payouts và admin-finance flows.
