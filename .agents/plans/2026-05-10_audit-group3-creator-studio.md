# Plan: Đối chiếu giao diện — Nhóm 3: Creator / Studio

- **Ngày viết:** 2026-05-10
- **Trạng thái:** ✅ Hoàn thành — 10/10 giao diện đã đối chiếu/code/refactor
- **Ngày hoàn thành:** 2026-05-10

---

## Mục tiêu

Đối chiếu 10 giao diện nhóm Creator/Studio với mockup HTML. Nhóm này đã code nhiều nhất và có API services phức tạp — ưu tiên bảo vệ chức năng.

---

## Tổng quan nhóm

| # | Mockup | Route | Có code? | Có API? | Hành động |
|---|--------|-------|----------|---------|-----------|
| 1 | `creator_dashboard_velvet_gallery` | `/studio` | ✅ Có | ❌ Không service | ✅ Visual pass hoàn thành |
| 2 | `creator_studio_content_library` | `/studio/content` | ✅ Có | ✅ mediaService owner videos | ✅ Visual pass hoàn thành - không đụng service |
| 3 | `step_1_details_access_level` | `/studio/upload` (step 1) | ✅ Có | ❌ Không service | ✅ Visual token pass hoàn thành |
| 4 | `step_2_pricing_monetization` | `/studio/upload` (step 2) | ✅ Có | ❌ Không service | ✅ Visual pass hoàn thành |
| 5 | `step_3_visibility_review_final_sync` | `/studio/upload` (step 3) | ✅ Có | ❌ Không service | ✅ **ĐÃ HOÀN THÀNH** - Layout 2 cột, components con tách riêng |
| 6 | `creator_wallet_payouts_synchronized_ac_logic` | `/studio/wallet` | ✅ Có | ✅ **8 services** | ✅ Visual pass hoàn thành - không đụng service/hook/provider |
| 7 | `withdraw_funds_creator_studio` | `/studio/wallet/withdraw` | ✅ Đã tạo route + page feature | ✅ payout/withdraw services | ✅ Visual pass hoàn thành - không sửa service |
| 8 | `membership_eligibility_creator_studio` | `/studio/memberships` | ✅ Có | ✅ mediaService channel read | ✅ Visual pass hoàn thành - không đụng service |
| 9 | `membership_management_creator_studio` | `/studio/memberships` | ✅ Có | ✅ mediaService channel read | ✅ Visual pass hoàn thành - không đụng service |
| 10 | `membership_tier_editor_velvet_gallery` | `/studio/memberships/edit` | ✅ Đã tạo route + component | ❌ Không service | ✅ Hoàn thành 2-column editor |

---

## Chi tiết hành động

### Giao diện NGUY HIỂM — CÓ API PHỨC TẠP

**6**: `creator_wallet_payouts_synchronized_ac_logic` (`/studio/wallet`)
- Feature `studio-wallet` có **8 service files**:
  - `earningsService.ts` + test + utils
  - `enhancedStudioWalletService.ts`
  - `payoutService.ts`
  - `revenueService.ts`
  - `studioWalletService.ts`
  - `withdrawalService.ts`
- Có **hooks** và **providers** (state management phức tạp).
- ⚠️ **CHỈ SỬA**: className, Tailwind classes, layout wrapper.
- ⚠️ **CẤM SỬA**: component props interface, hooks logic, service calls, provider state, utils.

**7**: `withdraw_funds_creator_studio` (`/studio/wallet/withdraw`)
- Cùng feature `studio-wallet`, chia sẻ services.
- Cùng quy tắc: chỉ sửa visual.

### Giao diện AN TOÀN — KHÔNG CÓ API

**1–5, 8–9**: Dashboard, Content Library, Upload (3 steps), Membership
- Các feature này **chỉ có components**, không có services.
- An toàn để refactor visual theo mockup.
- Upload wizard (3 steps) cần giữ đúng flow step 1→2→3.

### Giao diện CẦN KIỂM TRA

**10**: `membership_tier_editor_velvet_gallery`
- Route `/studio/memberships/edit` hoặc tương đương.
- Kiểm tra `page.tsx` của memberships xem đã có tier editor chưa.
- Nếu chưa: Code component mới theo mockup.

---

## Thứ tự thực hiện

1. 🔍 Kiểm tra giao diện 10 trước (xác định cần code mới không).
2. 🎨 Đối chiếu visual giao diện 1–5, 8–9 (an toàn, không API).
3. ⚠️ Đối chiếu visual giao diện 6–7 (có API, cực kỳ cẩn thận).
4. 🆕 Code mới giao diện 10 nếu thiếu.

---

## Lưu ý quan trọng

> ⚠️ **Feature `studio-wallet` là feature phức tạp nhất trong project.**
> - 8 service files, hooks, providers, utils, config.
> - Đã tích hợp Finance API thật (earnings, payout, revenue, withdrawal).
> - Có unit tests (`earningsService.test.ts`, `walletService.test.ts`).
> - **Sửa visual phải chạy test sau khi sửa** để đảm bảo không regression.

---

## Kết quả mong đợi

- 10/10 giao diện đối chiếu xong.
- Giao diện thiếu được code mới.
- Tests `studio-wallet` vẫn pass sau khi sửa visual.
- Cập nhật trạng thái trong `AGENTS.md` Section 26.2.
