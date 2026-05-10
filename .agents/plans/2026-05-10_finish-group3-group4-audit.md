# Plan: Hoàn tất audit còn lại — Nhóm 3 Creator/Studio + Nhóm 4 Admin Console

- **Ngày viết:** 2026-05-10
- **Trạng thái:** ✅ Hoàn thành — Phase 1-4 đã xong
- **Ngày hoàn thành:** 2026-05-10

---

## 1. Mục tiêu

Hoàn tất các phần còn lại của audit/refactor visual cho:

- **Nhóm 3: Creator / Studio**
- **Nhóm 4: Admin Console**

Yêu cầu chính:

- Bám mockup HTML trong `stitch_media_commerce_platform/`.
- Giữ nguyên API/service logic hiện có.
- Với các feature có service phức tạp, chỉ sửa visual/layout/className.
- Nếu cần đụng service/API/hook/provider, phải dừng lại và viết plan riêng để duyệt trước.
- Sau mỗi cụm lớn phải chạy verification.
- Cập nhật trạng thái trong plan gốc và `AGENTS.md` Section 26.2.

---

## 2. Nguyên tắc thực hiện

### 2.1 Quy tắc chung

- Đọc mockup `code.html` tương ứng trước khi sửa từng giao diện.
- Đọc component hiện tại trước khi sửa.
- Không sửa `page.tsx` thành Client Component nếu không cần.
- Không nhét UI phức tạp trực tiếp vào `page.tsx`.
- Không thêm package mới.
- Không dùng Axios.
- Không hardcode backend URL.
- Không dùng tím/violet làm primary.
- Ưu tiên CSS variables/Tailwind tokens thay vì hardcode hex.
- Không tạo global component nếu không thật sự shared.

### 2.2 Với feature có API/service

Chỉ được sửa:

- `className`
- Tailwind classes
- layout wrapper
- static copy/UI
- visual-only child markup nếu không đổi props/data contract

Không được sửa nếu chưa có plan duyệt riêng:

- service files
- hooks logic
- provider state
- API payload
- API response type/shape
- auth/credentials logic
- validation/business logic

---

## 3. Trạng thái hiện tại

### 3.1 Nhóm 3 — Creator / Studio

Đã làm:

| # | Mockup | Trạng thái |
|---|--------|-----------|
| 5 | `step_3_visibility_review_final_sync` | ✅ Đã redesign Step 3, chỉnh FE phù hợp API hiện tại |

Cần hoàn tất:

| # | Mockup | Route | Mức rủi ro | Việc cần làm |
|---|--------|-------|-----------|--------------|
| 1 | `creator_dashboard_velvet_gallery` | `/studio` | An toàn | Đối chiếu/refactor visual |
| 2 | `creator_studio_content_library` | `/studio/content` | An toàn | Đối chiếu/refactor visual |
| 3 | `step_1_details_access_level` | `/studio/upload` step 1 | An toàn nhưng chú ý category API | Đối chiếu visual, không tự thêm API |
| 4 | `step_2_pricing_monetization` | `/studio/upload` step 2 | An toàn | Đối chiếu visual, giữ `price`/`requiredTierLevel` |
| 6 | `creator_wallet_payouts_synchronized_ac_logic` | `/studio/wallet` | ⚠️ Nguy hiểm | Chỉ sửa visual, không đụng 8 services/hooks/providers |
| 7 | `withdraw_funds_creator_studio` | `/studio/wallet/withdraw` | ⚠️ Nguy hiểm | Chỉ sửa visual, không đụng `withdrawalService` |
| 8 | `membership_eligibility_creator_studio` | `/studio/memberships` | An toàn | Đối chiếu eligibility UI |
| 9 | `membership_management_creator_studio` | `/studio/memberships` | An toàn | Đối chiếu management UI |
| 10 | `membership_tier_editor_velvet_gallery` | `/studio/memberships/edit` | Cần kiểm tra | Redesign 2-column nếu hiện còn lệch mockup |

### 3.2 Nhóm 4 — Admin Console

Đã làm:

| # | Mockup | Trạng thái |
|---|--------|-----------|
| 12 | `admin_system_settings_content_policy_editor` | ✅ Đã code route `/admin/settings/policies` |
| 2 | `video_detail_moderation_admin` | ✅ Đã kiểm tra có component detail |
| 7 | `verification_detail_admin_console` | ✅ Đã kiểm tra có component detail |
| 10 | `payout_request_detail_admin` | ✅ Đã kiểm tra và refactor visual |
| 9 | `payout_management_admin_console` | ✅ Đã refactor visual, không đụng service |
| Shared | `admin-layout` | ✅ Đã đồng bộ sidebar/header |

Cần hoàn tất visual sâu từng page:

| # | Mockup | Route | Mức rủi ro | Việc cần làm |
|---|--------|-------|-----------|--------------|
| 1 | `content_review_admin_dashboard` | `/admin/content/review` | An toàn | Refactor visual theo mockup |
| 2 | `video_detail_moderation_admin` | `/admin/content/[id]` | An toàn | Refactor visual sâu nếu lệch mockup |
| 3 | `content_library_admin_console` | `/admin/content` | An toàn | Refactor table/filter/status |
| 4 | `user_management_admin_console` | `/admin/users` | An toàn | Refactor table/action/filter |
| 5 | `channel_management_admin_console` | `/admin/channels` | An toàn | Refactor KPI/table/status |
| 6 | `verification_queue_admin_console` | `/admin/verifications` | An toàn | Refactor queue/cards/tabs |
| 7 | `verification_detail_admin_console` | `/admin/verifications/[id]` | An toàn | Refactor detail/action panel |
| 8 | `category_management_admin_console` | `/admin/categories` | An toàn | Refactor category UI/empty state |
| 11 | `admin_system_settings` | `/admin/settings` | An toàn | Đồng bộ visual với policy editor |

---

## 4. Phase 1 — Hoàn tất Nhóm 3 safe visual pages

**Trạng thái:** ✅ Đã thực hiện visual pass cho #1, #2, #3, #4, #8, #9, #10. `tsc` và `lint` pass. Không thêm/sửa service.

### 4.1 Creator Dashboard (#1)

Mockup:

```txt
stitch_media_commerce_platform/creator_dashboard_velvet_gallery/code.html
```

Files dự kiến:

```txt
src/features/studio-dashboard/components/StudioDashboardFeature.tsx
```

Hành động:

- Đối chiếu stat cards, charts, recent content, creator density.
- Đảm bảo layout vẫn nằm trong Studio layout hiện có.
- Không thêm API.
- Sửa visual bằng Tailwind tokens/design variables.

### 4.2 Studio Content Library (#2)

Mockup:

```txt
stitch_media_commerce_platform/creator_studio_content_library/code.html
```

Files dự kiến:

```txt
src/features/studio-content/components/StudioContentFeature.tsx
```

Hành động:

- Đối chiếu content table/grid, filters, actions, status badges.
- Không thêm service.
- Giữ static/mock data nếu hiện đang static.

### 4.3 Upload Step 1 (#3)

Mockup:

```txt
stitch_media_commerce_platform/step_1_details_access_level/code.html
```

Files dự kiến:

```txt
src/features/studio-upload/components/UploadStep1Details.tsx
```

Hành động:

- Đối chiếu form details/access level.
- Kiểm tra `categories` vì `init-upload` yêu cầu category slug active, không được để rỗng khi publish.
- Nếu cần tích hợp `GET /api/media/categories`, dừng lại và viết plan API integration riêng.
- Nếu chỉ visual/static, sửa ngay.
- Giữ flow Step 1 → Step 2 → Step 3.

### 4.4 Upload Step 2 (#4)

Mockup:

```txt
stitch_media_commerce_platform/step_2_pricing_monetization/code.html
```

Files dự kiến:

```txt
src/features/studio-upload/components/UploadStep2Monetization.tsx
```

Hành động:

- Đối chiếu pricing/monetization controls.
- Giữ đúng fields `price` và `requiredTierLevel`.
- Không thêm API.

### 4.5 Studio Membership (#8–#9)

Mockups:

```txt
stitch_media_commerce_platform/membership_eligibility_creator_studio/code.html
stitch_media_commerce_platform/membership_management_creator_studio/code.html
```

Files dự kiến:

```txt
src/features/studio-membership/components/*
```

Hành động:

- Xác định component hiện tại hiển thị eligibility hay management bằng state/mock condition nào.
- Đối chiếu layout, tier cards, requirement cards, CTA states.
- Không thêm service.
- Nếu UI cần field API chưa có, dùng fallback hoặc ghi chú.

### 4.6 Membership Tier Editor (#10)

Mockup:

```txt
stitch_media_commerce_platform/membership_tier_editor_velvet_gallery/code.html
```

Files dự kiến:

```txt
src/features/studio-membership/components/TierEditorOverlay.tsx
src/app/studio/memberships/edit/page.tsx (nếu route thiếu)
```

Hành động:

- Kiểm tra route/component hiện có.
- Nếu thiếu route thật, tạo route theo feature-based architecture.
- Redesign 2-column layout theo mockup.
- Giữ props/state hiện tại.

### Verification Phase 1

Chạy:

```bash
npx tsc --noEmit
npm run lint
```

Manual routes:

```txt
/studio
/studio/content
/studio/upload   (step 1 → step 2 → step 3)
/studio/memberships
/studio/memberships/edit nếu có
```

---

## 5. Phase 2 — Nhóm 3 nguy hiểm: Studio Wallet

**Trạng thái:** ✅ Đã thực hiện visual pass cho #6 và #7. Không sửa service/hook/provider. `tsc`, `lint`, và `test:smoke` pass.

### 5.1 Studio Wallet (#6)

Mockup:

```txt
stitch_media_commerce_platform/creator_wallet_payouts_synchronized_ac_logic/code.html
```

Files cần đọc trước:

```txt
src/features/studio-wallet/components/*
src/features/studio-wallet/hooks/*
src/features/studio-wallet/services/*   (chỉ đọc, không sửa)
```

Hành động:

- Đọc component + hooks để hiểu data contract.
- Chỉ sửa visual ở components.
- Không đổi props interface nếu props đang đến từ hook/provider.
- Không đổi service/hook/provider.
- Đối chiếu wallet summary, revenue cards, payout table, loading/error/empty states.

### 5.2 Withdraw Funds (#7)

Mockup:

```txt
stitch_media_commerce_platform/withdraw_funds_creator_studio/code.html
```

Files cần đọc trước:

```txt
src/features/studio-wallet/components/*Withdraw*
src/features/studio-wallet/services/withdrawalService.ts   (chỉ đọc nếu cần)
```

Hành động:

- Chỉ sửa visual.
- Giữ submit/validation/service logic.
- Đối chiếu amount input, method/bank details, summary panel, confirmation copy.

### Verification Phase 2

Chạy:

```bash
npx tsc --noEmit
npm run lint
```

Nếu có test wallet:

```txt
Chạy đúng test liên quan studio-wallet, ví dụ earningsService.test.ts / walletService.test.ts nếu repo có script phù hợp.
```

Manual routes:

```txt
/studio/wallet
/studio/wallet/withdraw
```

Nếu test fail do service/hook logic không liên quan visual:

- Không tự sửa service.
- Báo lỗi và đề xuất plan riêng.

---

## 6. Phase 3 — Hoàn tất Nhóm 4 safe admin pages

**Trạng thái:** ✅ Đã refactor visual các trang admin safe #1, #2, #3, #4, #5, #6, #7, #8, #11. Không thêm API/service. `tsc` và `lint` pass.

### 6.1 Content Review (#1)

Mockup:

```txt
stitch_media_commerce_platform/content_review_admin_dashboard/code.html
```

Files:

```txt
src/features/admin-content/components/ContentReviewQueueFeature.tsx
```

Hành động:

- Refactor table/review queue/action buttons.
- Nếu mockup có side preview/review panel, đối chiếu và bổ sung visual-only nếu không cần API.

### 6.2 Video Detail Moderation (#2)

Mockup:

```txt
stitch_media_commerce_platform/video_detail_moderation_admin/code.html
```

Files:

```txt
src/features/admin-content/components/ContentModerationDetailFeature.tsx
```

Hành động:

- Refactor video preview, metadata, review judgement/action panel.
- Không thêm service.

### 6.3 Content Library (#3)

Mockup:

```txt
stitch_media_commerce_platform/content_library_admin_console/code.html
```

Files:

```txt
src/features/admin-content/components/ContentLibraryFeature.tsx
```

Hành động:

- Refactor table, filter controls, status badges, action buttons.
- Không thêm service.

### 6.4 User Management (#4)

Mockup:

```txt
stitch_media_commerce_platform/user_management_admin_console/code.html
```

Files:

```txt
src/features/admin-users/components/UserManagementFeature.tsx
```

Hành động:

- Refactor user table, role badges, profile cells, actions.
- Không thêm service.

### 6.5 Channel Management (#5)

Mockup:

```txt
stitch_media_commerce_platform/channel_management_admin_console/code.html
```

Files:

```txt
src/features/admin-users/components/ChannelManagementFeature.tsx
```

Hành động:

- Refactor KPI cards, channel table, level/status badges, actions.
- Không thêm service.

### 6.6 Verification Queue (#6)

Mockup:

```txt
stitch_media_commerce_platform/verification_queue_admin_console/code.html
```

Files:

```txt
src/features/admin-verification/components/VerificationQueueFeature.tsx
```

Hành động:

- Refactor queue stats, tabs, table, review actions.
- Không thêm service.

### 6.7 Verification Detail (#7)

Mockup:

```txt
stitch_media_commerce_platform/verification_detail_admin_console/code.html
```

Files:

```txt
src/features/admin-verification/components/VerificationDetailFeature.tsx
```

Hành động:

- Refactor applicant header, document panels, statement, decision panel.
- Không thêm service.

### 6.8 Category Management (#8)

Mockup:

```txt
stitch_media_commerce_platform/category_management_admin_console/code.html
```

Files:

```txt
src/features/admin-content/components/CategoryManagementFeature.tsx
```

Hành động:

- Refactor category grid/list/filter/search/empty state.
- Không thêm service.

### 6.9 Admin Settings (#11)

Mockup:

```txt
stitch_media_commerce_platform/admin_system_settings/code.html
```

Files:

```txt
src/features/admin-settings/components/AdminSettingsFeature.tsx
```

Hành động:

- Đồng bộ visual với `AdminContentPolicyEditorFeature`.
- Không thêm API.
- Giữ local state hiện tại.

### Verification Phase 3

Chạy:

```bash
npx tsc --noEmit
npm run lint
```

Manual routes:

```txt
/admin/content/review
/admin/content
/admin/content/[id]
/admin/users
/admin/channels
/admin/verifications
/admin/verifications/[id]
/admin/categories
/admin/settings
/admin/settings/policies
```

---

## 7. Phase 4 — Bookkeeping cuối cùng

**Trạng thái:** ✅ Đã cập nhật plan gốc Nhóm 3/Nhóm 4 và `AGENTS.md` Section 26.2. Phase 3 đã được xác nhận bằng `npx tsc --noEmit` và `npm run lint` pass trước khi bookkeeping.

Files cần cập nhật:

```txt
.agents/plans/2026-05-10_audit-group3-creator-studio.md
.agents/plans/2026-05-10_audit-group4-admin-console.md
AGENTS.md
```

Hành động:

- ✅ Cập nhật trạng thái từng interface từ `⚠️`/`🔍` sang `✅` nếu hoàn tất.
- ✅ Ghi chú interface nào chỉ kiểm tra và không cần code thêm.
- ✅ Không ghi nhận khác biệt đáng kể cần tách plan riêng; các chỉnh sửa hiện tại là visual/layout-only theo mockup.
- ✅ Cập nhật ngày hoàn thành nếu toàn bộ nhóm xong.

Final verification:

```bash
npx tsc --noEmit
npm run lint
```

Nếu có test liên quan wallet/payout:

```txt
Chạy test tương ứng nếu script tồn tại.
```

---

## 8. Rủi ro và điểm dừng bắt buộc

### 8.1 Studio Wallet

Rủi ro:

- Feature có nhiều service/hook/provider.
- Dễ làm vỡ API thật nếu đổi props hoặc data flow.

Điểm dừng:

- Nếu cần sửa service/hook/provider/API type, dừng và viết plan riêng.

### 8.2 Upload Step 1 Category

Rủi ro:

- `init-upload` yêu cầu `categories` là slug active và không rỗng.

Điểm dừng:

- Nếu cần tích hợp API categories thật, viết plan API integration riêng trước.

### 8.3 Admin pages mock data

Rủi ro:

- Nhiều trang đang dùng mock data + remote images.

Chiến lược:

- Có thể thay remote image bằng placeholder/gradient nếu không có asset nội bộ.
- Không tự thêm API chỉ để thay mock data.

### 8.4 Backend/service change

Chỉ đề xuất backend/service change nếu thật sự cần để tính năng hoạt động đúng.
Nếu chỉ là nice-to-have:

- Disable UI
- Gắn badge `Coming soon`
- Dùng local state
- Dùng fallback/placeholder

---

## 9. Kết quả mong đợi

- Nhóm 3 đạt 10/10 giao diện đã đối chiếu/code/refactor.
- Nhóm 4 đạt 12/12 giao diện đã đối chiếu/code/refactor.
- Không regression service/API.
- `tsc` pass.
- `lint` pass.
- Plan gốc và `AGENTS.md` được cập nhật đầy đủ.
