# Upload Step 3 — Visual Redesign theo Mockup

> **Mục tiêu:** Redesign `UploadStep3Review` từ layout single-column hiện tại sang layout 2 cột theo mockup `step_3_visibility_review_final_sync`, giữ nguyên toàn bộ logic API/form.

---

## 1. Phân tích so sánh Mockup vs Current

### Layout Structure

| Aspect | Mockup | Current | Action |
|--------|--------|---------|--------|
| **Studio Sidebar** | ✅ Sidebar 256px cố định | ❌ Không có | **Không cần sửa** — `StudioLayoutFeature` đã wrap sẵn sidebar + header ở `studio/layout.tsx` |
| **Studio Header** | ✅ Top header với notification/account | ❌ Không có | **Không cần sửa** — đã có `StudioHeader` |
| **Content Layout** | 2 cột (main left + sidebar right 340px) | Single column centered | **CẦN SỬA** |
| **Progress Stepper** | Horizontal stepper (1-2-3) với check icons | Stepper nằm ở `StudioUploadFeature` parent | **CẦN REFINE** stepper trong parent |

> **Phát hiện quan trọng:** Sidebar + Header **đã có sẵn** nhờ `studio/layout.tsx` → `StudioLayoutFeature` wrap `<StudioSidebar/>` + `<StudioHeader/>` + `<div className="md:ml-64">{children}</div>`. Vấn đề chính chỉ là **nội dung bên trong** `UploadStep3Review` đang single-column.

### Content Organization (Mockup Layout)

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Header                              │
│  "Publishing Pipeline" + subtitle                           │
├──────────────────────────────┬──────────────────────────────┤
│        LEFT COLUMN           │       RIGHT COLUMN (340px)   │
│                              │                              │
│  ┌─ Progress Stepper ──────┐│  ┌─ Video Summary Card ────┐ │
│  │ (1)──(2)──[3]           ││  │ Thumbnail               │ │
│  └─────────────────────────┘│  │ Title + Status           │ │
│                              │  │ Tier Badge + Price       │ │
│  ┌─ Visibility Options ────┐│  └─────────────────────────┘ │
│  │ ○ Public                ││                              │
│  │ ○ Unlisted              ││  ┌─ Pre-flight Checks ─────┐ │
│  │ ● Private (selected)    ││  │ ✅ Copyright: No issues  │ │
│  └─────────────────────────┘│  │ ✅ Quality: 4K complete  │ │
│                              │  └─────────────────────────┘ │
│  ┌─ Schedule Release ──────┐│                              │
│  │ Toggle + Date/Time      ││  ┌─ Actions ───────────────┐ │
│  └─────────────────────────┘│  │ [Publish Video]         │ │
│                              │  │ [Save as Draft]         │ │
│                              │  └─────────────────────────┘ │
└──────────────────────────────┴──────────────────────────────┘
```

### Content Changes (Current → Mockup)

| Current | Mockup | Action |
|---------|--------|--------|
| Summary card ở top center | Summary card ở **right sidebar** | Di chuyển |
| Declarations/checkboxes | **Visibility options** (Public/Unlisted/Private) | Thay thế UI (nhưng giữ data) |
| Footer action bar fixed bottom | **Actions trong right sidebar** | Di chuyển |
| Không có Schedule section | **Schedule Release** section | Thêm mới (UI-only, chưa có API) |
| Không có Pre-flight checks | **Pre-flight Checks** section | Thêm mới (static/UI-only) |

---

## 2. Thiết kế kỹ thuật

### Nguyên tắc

1. **Chỉ thay đổi visual/layout** — Logic form, API call `handlePublish`, states (`isChecked1`, `isChecked2`, `isPublishing`, `isSuccess`) giữ nguyên.
2. **Tách component nhỏ** theo AGENTS.md rule.
3. **Không tạo API mới** — Schedule Release và Pre-flight Checks chỉ là UI decorative.

### Component Tree mới

```
UploadStep3Review (refactored)
├── Page Header (title + subtitle)
├── 2-Column Layout
│   ├── Left Column
│   │   ├── ProgressStepper (inline, refined from parent)
│   │   ├── VisibilityOptions (new component)
│   │   └── ScheduleRelease (new component, UI-only)
│   └── Right Column (sticky sidebar)
│       ├── VideoSummaryCard (extracted from current summary)
│       ├── PreflightChecks (new component, static)
│       └── PublishActions (extracted from footer)
└── Publishing Overlay (existing spinner)
```

### Files cần thay đổi

| File | Action | Chi tiết |
|------|--------|----------|
| `StudioUploadFeature.tsx` | **MODIFY** | Di chuyển stepper vào Step3 (hoặc truyền currentStep prop) |
| `UploadStep3Review.tsx` | **REWRITE** | Layout 2 cột, tách components con |

### Files mới tạo (tách component từ Step3)

| File | Mô tả |
|------|-------|
| `upload-step-3/VisibilityOptions.tsx` | Radio options: Public/Unlisted/Private |
| `upload-step-3/ScheduleRelease.tsx` | Toggle + Date/Time inputs (UI-only) |
| `upload-step-3/VideoSummaryCard.tsx` | Thumbnail + metadata card |
| `upload-step-3/PreflightChecks.tsx` | Static checklist (Copyright, Quality) |
| `upload-step-3/PublishActions.tsx` | Publish + Save Draft buttons |
| `upload-step-3/ProgressStepper.tsx` | 3-step horizontal stepper |

---

## 3. Chi tiết Implementation

### Phase 1: Tạo sub-components

#### A. `ProgressStepper.tsx`

Stepper ngang 3 bước. Hiện tại stepper nằm trong `StudioUploadFeature.tsx` (dòng 37-53). Tách ra component riêng và truyền `currentStep` prop.

```tsx
// Props
interface ProgressStepperProps {
  currentStep: number; // 1, 2, or 3
}
```

Visual theo mockup:
- Step 1, 2: Hiện icon `check` (đã hoàn thành)
- Step 3: Hiện số `3` với active styling (border-primary, glow)
- Connector lines giữa steps

#### B. `VisibilityOptions.tsx`

Thay thế Declarations section. Hiển thị 3 options:
- **Public**: Icon `public`, mô tả, radio unselected
- **Unlisted**: Icon `link`, mô tả, radio unselected  
- **Private**: Icon `lock` (filled), mô tả, radio **selected** (active style)

```tsx
interface VisibilityOptionsProps {
  value: "public" | "private";
  onChange: (value: "public" | "private") => void;
}
```

> **Lưu ý:** API backend chỉ hỗ trợ `public` | `private`. Option "Unlisted" sẽ hiển thị UI nhưng map sang `private` (hoặc disable nếu muốn).

#### C. `ScheduleRelease.tsx`

UI-only component theo mockup: Toggle switch + Date/Time inputs.

```tsx
// Chưa có API backend cho scheduling
// Component chỉ render UI decorative
// State nội bộ cho toggle on/off
```

#### D. `VideoSummaryCard.tsx`

Sidebar card hiển thị video metadata từ `formData`.

```tsx
interface VideoSummaryCardProps {
  formData: UploadFormData;
}
```

Bao gồm:
- Thumbnail (16:9 aspect ratio)
- Duration badge
- Title + "Draft • Just now"
- Tier badge (nếu `requiredTierLevel`)
- Unlock Price (nếu `price > 0`)

#### E. `PreflightChecks.tsx`

Static checklist:
- ✅ Copyright: "No issues found"
- ✅ Quality: Processing status

```tsx
// Static component, no props needed for now
```

#### F. `PublishActions.tsx`

Extracted từ footer actions hiện tại.

```tsx
interface PublishActionsProps {
  canPublish: boolean;
  isPublishing: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
  onBack: () => void;
}
```

### Phase 2: Rewrite `UploadStep3Review.tsx`

Layout mới theo mockup 2 cột:

```tsx
<div className="px-12 py-10 pb-32 animate-in fade-in">
  {/* Page Header */}
  <div className="mb-10 max-w-5xl mx-auto">
    <h1>Publishing Pipeline</h1>
    <p>Configure release parameters...</p>
  </div>

  {/* 2-Column Layout */}
  <div className="flex gap-10 max-w-5xl mx-auto items-start">
    {/* Left Column */}
    <div className="flex-1 flex flex-col gap-10">
      <ProgressStepper currentStep={3} />
      <VisibilityOptions value={formData.visibility} onChange={...} />
      <ScheduleRelease />
    </div>

    {/* Right Column (sticky) */}
    <aside className="w-[340px] shrink-0 flex flex-col gap-6 sticky top-24">
      <VideoSummaryCard formData={formData} />
      <PreflightChecks />
      <PublishActions ... />
    </aside>
  </div>

  {/* Publishing Overlay (giữ nguyên) */}
  {isPublishing && <PublishingOverlay />}
</div>
```

### Phase 3: Cập nhật `StudioUploadFeature.tsx`

Stepper hiện tại nằm trong parent. Cần quyết định:

**Option A (khuyến nghị):** Giữ stepper trong parent cho Step 1, 2 — nhưng cho Step 3 tự render stepper riêng bên trong left column (vì Step 3 có layout 2 cột khác biệt).

**Option B:** Truyền `currentStep` xuống và mỗi Step tự render stepper.

→ Chọn **Option A**: Step 3 ẩn parent stepper, tự render stepper trong layout 2 cột.

Thay đổi `StudioUploadFeature.tsx`:
- Ẩn Top Stepper khi `currentStep === 3`
- Hoặc: luôn hiển thị stepper cho Step 1, 2 — Step 3 tự vẽ

---

## 4. API Contract Analysis ✅

> Đã kiểm tra 3 backend services: **Media**, **Finance**, **Identity**.

### 4.1 Kết quả đối chiếu

| Feature UI | API endpoint | Field | Status |
|------------|-------------|-------|--------|
| **Visibility: Public** | `POST /api/media/videos/init-upload` | `visibility: "public"` | ✅ Hỗ trợ |
| **Visibility: Private** | `POST /api/media/videos/init-upload` | `visibility: "private"` | ✅ Hỗ trợ |
| **Visibility: Unlisted** | — | — | ❌ **Không có**. API chỉ accept `"public" \| "private"`. Gửi giá trị khác → 400 (`forbidNonWhitelisted`) |
| **Schedule Release** | — | — | ❌ **Không có**. Không endpoint nào nhận `scheduledAt` / `publishAt` |
| **Pre-flight Checks** | `GET /api/media/videos/:id/progress` (4.7) | `stage`, `percent`, `message` | ⚠️ **Timing sai** — cần `videoId` nhưng video chưa được tạo ở Step 3. API này chỉ dùng **sau** init-upload |
| **Publish (init-upload)** | `POST /api/media/videos/init-upload` (4.1) | `title`, `description`, `categories`, `visibility`, `price`, `requiredTierLevel` | ✅ **Đang dùng** — giữ nguyên |

### 4.2 Quyết định cho từng feature

| Component | Chiến lược | Chi tiết |
|-----------|-----------|----------|
| `VisibilityOptions` | Hiển thị 3 options, **"Unlisted" → disabled + badge "Coming soon"** | Chỉ `public` / `private` cập nhật `formData.visibility`. Click Unlisted không làm gì |
| `ScheduleRelease` | **UI với local state** — toggle + date/time inputs | Tạo state `{ enabled: boolean, date: string, time: string }` để sẵn sàng kết nối khi backend hỗ trợ. **Không gửi lên API** |
| `PreflightChecks` | **Static UI** — hardcode ✅ | Hiển thị 2 items cố định: Copyright + Quality. Khi backend bổ sung pre-publish check API thì kết nối sau |
| `PublishActions` | **Giữ nguyên** logic `handlePublish` → `mediaService.initUpload()` | Chỉ thay đổi vị trí (footer → right sidebar) |

---

## 5. Declarations (Terms) — Quyết định ✅

**→ Đặt inline trong right sidebar**, giữa PreflightChecks và PublishActions.

Lý do: Mockup không hiển thị declarations, nhưng chúng là **requirement bắt buộc** trước khi publish. Đặt inline giữ UX flow liền mạch và không cần modal phụ.

```
Right Column (aside):
├── VideoSummaryCard
├── PreflightChecks
├── Declarations (2 checkboxes, compact)  ← Giữ nguyên logic isChecked1/isChecked2
└── PublishActions (disabled khi chưa check cả 2)
```

---

## 6. File Tree cuối cùng

```
src/features/studio-upload/components/
  StudioUploadFeature.tsx               ← [MODIFY] Ẩn stepper khi step === 3
  UploadStep3Review.tsx                 ← [REWRITE] Layout 2 cột + orchestrate sub-components
  upload-step-3/
    ProgressStepper.tsx                 ← [NEW] Client component
    VisibilityOptions.tsx               ← [NEW] Client component
    ScheduleRelease.tsx                 ← [NEW] Client component (UI-only, local state)
    VideoSummaryCard.tsx                ← [NEW] Render-only component
    PreflightChecks.tsx                 ← [NEW] Static component
    PublishActions.tsx                  ← [NEW] Client component
```

---

## 7. Chi tiết Code Specs cho từng Component

### A. `ProgressStepper.tsx` — Client Component

```tsx
"use client";

interface ProgressStepperProps {
  currentStep: number; // 1 | 2 | 3
}

// Steps config
const steps = [
  { label: "Details", step: 1 },
  { label: "Monetization", step: 2 },
  { label: "Visibility", step: 3 },
];
```

**Visual rules (theo mockup dòng 174-198):**
- Completed steps (< currentStep): `bg-surface-container-high`, border `outline-variant/30`, icon `check` màu `primary`
- Active step (=== currentStep): `bg-primary/20`, border `primary`, shadow glow `rgba(255,142,128,0.2)`, hiện **số** bold
- Connector line: completed = `bg-primary/30`, active = `bg-primary`
- Layout: `flex items-center w-full relative` + pseudo `before:` line ngang phía sau

### B. `VisibilityOptions.tsx` — Client Component

```tsx
"use client";

type VisibilityValue = "public" | "private";

interface VisibilityOptionsProps {
  value: VisibilityValue;
  onChange: (value: VisibilityValue) => void;
}

const options = [
  {
    id: "public",
    icon: "public",
    title: "Public",
    description: "Everyone can watch your video immediately upon publishing. It will appear on your channel and in search results.",
    disabled: false,
  },
  {
    id: "unlisted",
    icon: "link",
    title: "Unlisted",
    description: "Anyone with the video link can watch it. It won't appear on your channel page or in search results.",
    disabled: true, // ← Backend không hỗ trợ
    badge: "Coming soon",
  },
  {
    id: "private",
    icon: "lock",
    iconFilled: true, // font-variation-settings: 'FILL' 1
    title: "Private",
    description: "Only you and people you choose can watch your video. It requires explicit access granting.",
    disabled: false,
  },
];
```

**Visual rules (theo mockup dòng 200-236):**
- Inactive option: `bg-surface-container-low hover:bg-surface-container`, icon `text-on-surface-variant`, radio empty circle `border-outline-variant/30`
- Active option: `bg-surface-container border border-primary/30 shadow-glow`, icon `text-primary` filled, radio filled dot `bg-primary`
- Disabled (Unlisted): `opacity-50 cursor-not-allowed`, badge `text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded`
- Layout mỗi option: `flex items-start gap-4 p-6 rounded-lg cursor-pointer`
- Radio indicator: absolute right, `w-5 h-5 rounded-full border-2`, active thêm inner dot `w-2.5 h-2.5`

### C. `ScheduleRelease.tsx` — Client Component (UI-only)

```tsx
"use client";

import { useState } from "react";

export function ScheduleRelease() {
  const [enabled, setEnabled] = useState(true); // default on theo mockup
  const [date, setDate] = useState("2024-10-24"); // placeholder
  const [time, setTime] = useState("18:00"); // placeholder

  // State chỉ local, KHÔNG gửi API
}
```

**Visual rules (theo mockup dòng 239-267):**
- Container: `bg-surface-container-low rounded-lg p-6`
- Header row: title + description bên trái, toggle switch bên phải
- Toggle switch: `w-11 h-6 bg-primary rounded-full` khi on, `bg-zinc-700` khi off
- Knob: `w-5 h-5 bg-on-surface rounded-full`, position `right-0.5` khi on, `left-0.5` khi off
- Date/Time inputs: `flex gap-4`, mỗi input có icon prefix (`calendar_today` / `schedule`)
- Input style: `bg-surface-container-lowest border border-outline-variant/20 rounded text-sm pl-10 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary`

### D. `VideoSummaryCard.tsx` — Render Component

```tsx
import { UploadFormData } from "../StudioUploadFeature";

interface VideoSummaryCardProps {
  formData: UploadFormData;
}
```

**Visual rules (theo mockup dòng 270-303):**
- Container: `bg-surface-container-low rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]`
- Thumbnail: `aspect-video w-full` + gradient overlay bottom + duration badge bottom-right (`bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs`)
- Metadata section: `p-5 flex flex-col gap-4`
  - Title: `font-headline text-base font-bold`
  - Subtitle: `text-xs text-on-surface-variant` → "Draft • Just now"
  - Tier badge (nếu `requiredTierLevel`): `bg-secondary/10 border border-secondary/20 text-secondary` + icon `star`
  - Price row: `flex items-center justify-between py-3 border-t` → label "Unlock Price" + `{price} AC` với icon `monetization_on`
- Nếu `price === 0` và `requiredTierLevel === null`: hiển thị "Free" thay vì price

### E. `PreflightChecks.tsx` — Static Component

```tsx
// Không cần props — static hardcode

const checks = [
  { label: "Copyright", detail: "No issues found", passed: true },
  { label: "Quality", detail: "Processing ready", passed: true },
];
```

**Visual rules (theo mockup dòng 305-323):**
- Container: `bg-surface-container-low rounded-xl p-5`
- Title: `font-headline text-sm font-semibold`
- Each check: `flex items-center gap-3`
  - Icon: `check_circle` filled (`font-variation-settings: 'FILL' 1`) màu `primary`
  - Label: `font-body text-sm font-medium`
  - Detail: `font-body text-xs text-on-surface-variant`

### F. `PublishActions.tsx` — Client Component

```tsx
"use client";

interface PublishActionsProps {
  canPublish: boolean;
  isPublishing: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
  onBack: () => void;
}
```

**Visual rules (theo mockup dòng 325-334):**
- Publish button: `bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-black font-headline font-bold py-3.5 rounded-sm shadow-[0_10px_20px_rgba(255,142,128,0.2)]` + icon `publish`
- Disabled state: `bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none`
- Save Draft: `bg-transparent border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container` + icon `save`
- Loading state: spinner thay icon
- Layout: `flex flex-col gap-3`

---

## 8. Cập nhật `StudioUploadFeature.tsx`

**Thay đổi:** Ẩn stepper khi `currentStep === 3`.

```tsx
// Dòng 37-54 hiện tại (stepper UI) → wrap trong điều kiện:
{currentStep < 3 && (
  <div className="max-w-6xl mx-auto px-8 pt-12 pb-4">
    {/* existing stepper JSX */}
  </div>
)}
```

**Truyền thêm prop** cho Step3:

```tsx
{currentStep === 3 && (
  <UploadStep3Review
    formData={formData}
    updateFormData={updateFormData}  // ← THÊM để Step3 cập nhật visibility
    onPrev={() => setCurrentStep(2)}
  />
)}
```

> **Lưu ý:** Hiện tại Step3 nhận `formData` + `onPrev`. Cần thêm `updateFormData` để `VisibilityOptions` có thể thay đổi `formData.visibility`.

---

## 9. Layout trong `UploadStep3Review.tsx`

```tsx
// Skeleton layout chính
<div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
  {/* Page Header */}
  <div className="px-12 py-10">
    <div className="mb-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl tracking-tight font-bold text-on-surface mb-2">
        Publishing Pipeline
      </h1>
      <p className="font-body text-sm text-on-surface-variant">
        Configure release parameters and final checks before going live.
      </p>
    </div>

    {/* 2-Column Layout */}
    <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto items-start">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-10">
        <ProgressStepper currentStep={3} />
        <VisibilityOptions
          value={formData.visibility}
          onChange={(v) => updateFormData({ visibility: v })}
        />
        <ScheduleRelease />
      </div>

      {/* Right Column (sticky) */}
      <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-24">
        <VideoSummaryCard formData={formData} />
        <PreflightChecks />

        {/* Declarations — compact inline */}
        <div className="bg-surface-container-low rounded-xl p-5 flex flex-col gap-3">
          <h4 className="font-headline text-sm font-semibold">Terms</h4>
          {/* checkbox 1: Community Guidelines */}
          {/* checkbox 2: DRM consent */}
        </div>

        <PublishActions
          canPublish={isChecked1 && isChecked2}
          isPublishing={isPublishing}
          onPublish={handlePublish}
          onSaveDraft={() => {/* noop hoặc save draft logic */}}
          onBack={onPrev}
        />
      </aside>
    </div>
  </div>

  {/* Success Screen (giữ nguyên logic hiện tại) */}
  {/* Publishing Overlay (giữ nguyên logic hiện tại) */}
</div>
```

**Responsive:** `flex-col lg:flex-row` — mobile stack, desktop 2 cột.

---

## 10. Tóm tắt thay đổi

| Hạng mục | Trước | Sau |
|----------|-------|-----|
| **Layout** | Single column centered | 2 cột (`flex-1` left + `w-[340px]` right sticky) |
| **Stepper** | Ở parent `StudioUploadFeature` | Ẩn parent khi step 3, tự render trong left column |
| **Visibility** | Không có UI chọn (hardcode trong formData) | Radio options: Public ✅ / Unlisted 🔒 / Private ✅ |
| **Summary Card** | Top center, full-width | Right sidebar, compact card |
| **Actions** | Fixed footer bar | Right sidebar, inline buttons |
| **Schedule** | Không có | UI-only với local state (chưa có API) |
| **Pre-flight** | Không có | Static checklist 2 items |
| **Declarations** | Full-width section | Compact trong right sidebar |
| **API** | `mediaService.initUpload()` | **Không thay đổi** |

---

## 11. Verification

| # | Test | Expected |
|---|------|----------|
| 1 | Navigate `/studio/upload` → Step 1 → 2 → 3 | Step 3 hiển thị layout 2 cột, parent stepper ẩn |
| 2 | Studio Sidebar + Header | Hiển thị đúng (đã có từ `studio/layout.tsx`) |
| 3 | Chọn Public → Private | `formData.visibility` cập nhật, radio UI thay đổi |
| 4 | Click Unlisted | Không thay đổi, hiển thị "Coming soon" badge |
| 5 | Toggle Schedule Release | Date/Time inputs show/hide, state local chỉ |
| 6 | Check 2 declarations → Publish button enabled | Logic `canPublish = isChecked1 && isChecked2` giữ nguyên |
| 7 | Click Publish | API `initUpload` gọi đúng → success screen |
| 8 | Click Back | Quay Step 2, parent stepper hiện lại |
| 9 | Viewport < lg (mobile) | Right sidebar stack xuống dưới left column |
| 10 | `npx tsc --noEmit` | Không lỗi TypeScript |

---

## 12. Resolved Questions

| # | Câu hỏi | Quyết định | Lý do |
|---|---------|-----------|-------|
| Q1 | Unlisted visibility | **Disabled + badge "Coming soon"** | API chỉ accept `public \| private`. `forbidNonWhitelisted` sẽ reject giá trị khác. Hiển thị disabled để user biết feature tồn tại nhưng chưa sẵn sàng |
| Q2 | Schedule Release | **Local state, không gửi API** | Không có endpoint scheduling. Tạo state `{ enabled, date, time }` sẵn để khi backend bổ sung chỉ cần connect |
| Q3 | Declarations placement | **Inline trong right sidebar** trước PublishActions | Giữ flow liền mạch, không cần modal phụ. Compact design phù hợp sidebar 340px |
