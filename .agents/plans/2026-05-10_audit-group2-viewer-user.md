# Plan: Đối chiếu giao diện — Nhóm 2: Viewer / User

- **Ngày viết:** 2026-05-10
- **Trạng thái:** ✅ Hoàn thành
- **Ngày hoàn thành:** 2026-05-10

---

## Mục tiêu

Đối chiếu 9 giao diện nhóm Viewer/User với mockup HTML. Code mới các màn chưa có, sửa visual các màn chưa khớp, bảo vệ logic API đã ghép.

---

## Tổng quan nhóm

| # | Mockup | Route hiện tại | Có code? | Có API? | Hành động |
|---|--------|---------------|----------|---------|-----------|
| 1 | `complete_your_profile_velvet_gallery` | `/onboarding/profile` | ✅ Có (feature `onboarding`) | ❌ Không | 🔍 Đối chiếu visual |
| 2 | `viewer_dashboard_personal_library` | `/(main)/library` | ✅ Có (feature `library`) | ❌ Không | 🔍 Đối chiếu visual |
| 3 | `viewer_profile_velvet_gallery` | `/(main)/profile` | ✅ Có (feature `profile`) | ❌ Không | 🔍 Đối chiếu visual |
| 4 | `video_library_discovery_levels` | `/(main)/category/[slug]` | ✅ Có (feature `discovery`) | ❌ Không | 🔍 Đối chiếu visual |
| 5 | `watch_video_synchronized` | `/(main)/watch/[id]` | ✅ Có (feature `watch`) | ✅ Có services | ⚠️ Đối chiếu — KHÔNG sửa player/API |
| 6 | `top_up_coins_select_package` | `/(main)/wallet` | ✅ Có (feature `wallet`) | ✅ walletService, depositService | ⚠️ Đối chiếu — KHÔNG sửa logic thanh toán |
| 7 | `top_up_coins_payment_gateway` | `/(main)/wallet/checkout` | ✅ Có | ✅ paymentService | ⚠️ Đối chiếu — KHÔNG sửa logic payment |
| 8 | `top_up_success_velvet_gallery` | `/(main)/wallet/success` | ✅ Có route + component | ❌ Không | 🔍 Đối chiếu visual |
| 9 | `join_membership_cinemalabs` | `/(main)/creator/[id]/join` | ✅ Có route + component | ❌ Chưa ghép API | 🔍 Đối chiếu visual |

---

## Chi tiết hành động

### Giao diện CẦN ĐỐI CHIẾU VISUAL (không có API — an toàn sửa)

**1–4**: `complete-profile`, `library`, `profile`, `discovery`
- `complete-profile` tại route `/onboarding/profile` **không có service**.
- `library`, `profile`, `discovery` hiện là UI/mock data, chưa có service riêng trong feature tương ứng.
- An toàn để refactor visual hoàn toàn theo mockup.
- Quy trình: Mở mockup → so sánh → sửa className/layout/structure.

### Giao diện CÓ API — CHỈ SỬA VISUAL

**5**: `watch_video_synchronized`
- Feature `watch` **có services thật** (HLS player, view counting, etc).
- CHỈ sửa layout wrapper, typography, spacing.
- KHÔNG đụng: video player component, SSE connection, view API call.

**6–7**: `top_up_coins_select_package`, `top_up_coins_payment_gateway`
- Feature `wallet` **có services thật** (walletService, depositService, paymentService, transactionService, withdrawalService).
- CHỈ sửa visual: card style, button style, color, spacing.
- KHÔNG đụng: form submit logic, API calls, idempotency key generation.

### Giao diện ĐÃ CÓ COMPONENT — ĐỐI CHIẾU VISUAL

**8**: `top_up_success_velvet_gallery`
- Route và component đã tồn tại: `TopUpSuccessFeature`.
- Chỉ đối chiếu visual và sửa nếu lệch.

**9**: `join_membership_cinemalabs`
- Route và component đã tồn tại: `JoinMembershipFeature`.
- Hiện chưa ghép membership API thật trong feature này, nhưng cần giữ an toàn cho state checkout hiện có.
- Chỉ đối chiếu visual và sửa nếu lệch.

---

## Thứ tự thực hiện

1. ✅ Chốt lại route/phạm vi đúng của 9 giao diện.
2. 🎨 Đối chiếu visual các giao diện 1–4 (an toàn, không API).
3. 🔍 Đối chiếu visual các giao diện 8–9 (đã có component, chưa cần code mới).
4. ⚠️ Đối chiếu visual giao diện 5–7 (có API, chỉ sửa styling/layout wrapper).

---

## Lưu ý quan trọng

> ⚠️ **Feature `wallet` và `watch` đã có API services thật.**
> - `wallet`: walletService, depositService, paymentService, transactionService, withdrawalService — tất cả đều gọi API Gateway thật.
> - `watch`: có services kết nối player HLS.
> - Khi sửa visual, **chỉ sửa className/Tailwind**, không refactor component structure nếu ảnh hưởng props/state.

---

## Ghi chú chỉnh plan

- Sửa route mockup `complete_your_profile_velvet_gallery` từ `/onboarding` thành `/onboarding/profile`.
- Sửa route mockup `video_library_discovery_levels` từ `/(main)/category` thành `/(main)/category/[slug]`.
- Xác nhận `top_up_success_velvet_gallery` và `join_membership_cinemalabs` đã có component, không còn thuộc nhóm "code nếu thiếu".
- Loại trừ màn `/onboarding` create-channel khỏi phạm vi plan này vì không khớp mockup complete-profile và có API thật (`mediaService.createChannel`).

---

## Kết quả mong đợi

- 9/9 giao diện đối chiếu xong.
- Giao diện thiếu được code mới.
- Cập nhật trạng thái trong `AGENTS.md` Section 26.2.
- Không regression trên wallet flow và watch flow.

---

## Kết quả thực hiện

- Đã sửa lại plan cho đúng route/phạm vi trước khi triển khai.
- Đã đối chiếu và chỉnh visual cho toàn bộ 9 màn Viewer/User trong phạm vi plan.
- Không tạo màn mới vì `top_up_success_velvet_gallery` và `join_membership_cinemalabs` đã có component sẵn.
- Giữ nguyên logic API của `watch`, `wallet`, `membership` checkout state và các flow thanh toán hiện tại.
