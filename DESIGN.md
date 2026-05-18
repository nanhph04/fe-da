# Design System: Velvet Gallery — Cinematic Canvas

> Tài liệu thiết kế chính thức của dự án. Mọi component, page, và feature **phải** tuân thủ hệ thống này.

---

## 1. Triết lý thiết kế

**"The Velvet Gallery"** — Phòng trưng bày nhung.

Không gian số mang đậm chất điện ảnh, sang trọng, tập trung tối đa vào nội dung. Mỗi tương tác phải có chủ đích, mượt mà, và mang cảm giác cao cấp.

**Nguyên tắc cốt lõi:**

- **Cinematic** — Tương phản cao, nền tối, nội dung là ngôi sao.
- **Premium** — Không generic, không template rẻ tiền, không lạm dụng hiệu ứng.
- **Deliberate** — Mọi pixel đều có lý do. Không trang trí thừa.

---

## 2. Bảng màu (Color Palette)

### 2.1 Màu chính (Primary & Secondary)

| Role | Hex | CSS Variable | Sử dụng |
|------|-----|-------------|---------|
| **Primary** | `#E50914` | `--primary` | CTA chính, active state, brand accent |
| **Secondary (Gold)** | `#f59e0b` | `--secondary` | Badge premium, coin economy, accent phụ |
| **Destructive** | `#a70138` | `--destructive` | Lỗi, hành động nguy hiểm |

### 2.2 Nền (Background)

| Layer | Hex | CSS Variable | Sử dụng |
|-------|-----|-------------|---------|
| **Core Background** | `#0E0E10` | `--background` | Nền toàn app (dark mode) |
| **Card / Surface** | `#131313` | `--card` | Container, card, panel |
| **Muted** | `#262626` | `--muted` | Vùng nền nhấn nhẹ, section phụ |
| **Input** | `#1a1a1a` | `--input` | Nền ô nhập liệu |

### 2.3 Text

| Role | Hex | CSS Variable | Sử dụng |
|------|-----|-------------|---------|
| **Primary text** | `#FFFFFF` | `--foreground` | Tiêu đề, nội dung chính |
| **Secondary text** | `#A1A1AA` | `--muted-foreground` | Mô tả, metadata, label phụ |

### 2.4 Border & Surface

| Role | Hex | CSS Variable | Sử dụng |
|------|-----|-------------|---------|
| **Border** | `#484847` | `--border` | Đường kẻ phân cách, viền card |
| **Ring (Focus)** | `#E50914` | `--ring` | Focus ring khi tương tác bàn phím |

### 2.5 Màu cinematic mở rộng

Dùng cho các trường hợp đặc biệt (badge, illustration, chart):

| Tên | Hex | Vai trò |
|-----|-----|---------|
| Ivory | `#f9f5f8` | Text trên nền tối cần mềm hơn white |
| Charcoal | `#1c1e22` | Nền phụ thay thế card |
| Gunmetal | `#2a2e35` | Hover state surface |
| Silver | `#a8b2bd` | Icon muted, metadata |
| Gold | `#d4af37` | Premium badge, coin icon |
| Crimson | `#dc143c` | Alert, accent mạnh |

### 2.6 Quy tắc màu cấm

> **KHÔNG** dùng tím/violet/purple/fuchsia làm màu chủ đạo.
> Tham khảo `AGENTS.md` — Section 7 để biết chi tiết.

---

## 3. Typography

### 3.1 Font stack

| Role | Font | CSS Variable | Fallback |
|------|------|-------------|----------|
| **Heading** | **Manrope** | `--font-headline` | system-ui, sans-serif |
| **Body** | **Inter** | `--font-sans` | system-ui, sans-serif |
| **Mono** | JetBrains Mono | `--font-geist-mono` | Consolas, monospace |

### 3.2 Heading style

- Weight: **Bold** (700) hoặc **ExtraBold** (800).
- Letter-spacing: `-0.02em` (tight) — tạo cảm giác điện ảnh, mạnh mẽ.
- Dùng cho: Page title, section header, modal title, hero text.

### 3.3 Body style

- Weight: **Regular** (400) hoặc **Medium** (500).
- Color: `#FFFFFF` cho text chính, `#A1A1AA` cho text phụ.
- Đảm bảo line-height ≥ 1.5 trên nền tối để dễ đọc.

### 3.4 Scale tham khảo

| Token | Size | Dùng cho |
|-------|------|---------|
| `text-xs` | 0.75rem | Badge, caption |
| `text-sm` | 0.875rem | Label, metadata |
| `text-base` | 1rem | Body text |
| `text-lg` | 1.125rem | Subtitle |
| `text-xl` | 1.25rem | Card title |
| `text-2xl` | 1.5rem | Section heading |
| `text-3xl` | 1.875rem | Page title |
| `text-4xl+` | 2.25rem+ | Hero / special |

---

## 4. Iconography

- **Library**: Lucide Icons (Shadcn UI default) + Material Symbols Outlined (đã import).
- **Default state**: Outline, color `--muted-foreground`.
- **Active/Hover state**: Filled hoặc chuyển sang `--primary` / White.
- **Size**: 20px–24px cho UI thường, 16px cho inline.

---

## 5. Layout & Spacing

### 5.1 Grid system

| Layout | Cấu trúc | Khi nào |
|--------|----------|---------|
| **3 cột** | Sidebar (256px) — Main — Right Panel | Dashboard, Studio |
| **2 cột** | Sidebar (256px) — Main | Quản lý, Settings |
| **1 cột** | Full width | Watch page, Auth, Landing |

### 5.2 Sidebar

- Width: **256px**, position **fixed**.
- Nền: `--sidebar` (`#0E0E10`).
- Icon: outline → filled khi active.

### 5.3 Top Navigation

- Position: **fixed top**, full width.
- Cho phép **Glassmorphism nhẹ** (xem Section 8).
- Chứa: Search bar, Aura Coins balance, User avatar.

### 5.4 Spacing scale (8px grid)

Tuân thủ hệ thống 8px. Chỉ dùng các giá trị sau:

```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
```

> Không dùng spacing tùy tiện như `p-[13px]`, `mt-[7px]`.

### 5.5 Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| `sm` | ≥640px | Mobile landscape |
| `md` | ≥768px | Tablet — Sidebar collapse thành icon |
| `lg` | ≥1024px | Desktop — Sidebar mở rộng |
| `xl` | ≥1280px | Wide — Right panel xuất hiện |
| `2xl` | ≥1536px | Ultra-wide |

---

## 6. Component Architecture

### 6.1 Buttons

| Variant | Style | Border-radius |
|---------|-------|--------------|
| **Primary** | Nền `#E50914`, text white | `--radius` (~6px) |
| **Secondary** | Nền transparent, viền `#E50914` hoặc `--border` | `--radius` |
| **Ghost** | Nền transparent, không viền, text muted | `--radius` |

**Interaction:**
- Hover: `opacity: 0.9` hoặc `brightness(1.1)`.
- Active: `scale(0.98)`.
- Focus: Ring `--ring` (`#E50914`).

> **KHÔNG** dùng Glass Button (nền blur). Không phù hợp Cinematic Canvas.

### 6.2 Cards & Containers

| Property | Giá trị | Lý do |
|----------|---------|-------|
| Border-radius | `--radius-lg` (~8px) | Align với Cinematic Canvas, không quá bo tròn |
| Border | `1px solid var(--border)` | Tạo ranh giới rõ, không dùng shadow nặng |
| Background | `--card` (`#131313`) | Tách biệt khỏi core background |
| Hover | Inner border glow nhẹ hoặc border sáng hơn | Subtle, không flashy |

> Tránh `rounded-2xl`, `rounded-3xl` cho card. Ưu tiên `rounded-sm`, `rounded-md`, `rounded-lg`.

### 6.3 Inputs

- Nền: `--input` (`#1a1a1a`).
- Border: `1px solid var(--border)`.
- Focus: border chuyển sang `--ring` (`#E50914`).
- Border-radius: `--radius` (~6px).
- Placeholder: `--muted-foreground`.

### 6.4 Video Thumbnails

- Tỉ lệ: **16:9** bắt buộc.
- Overlay: Gradient đen mờ ở cạnh dưới cho text readability (duration, title).
- Border-radius: `--radius-md` (~4.5px).

### 6.5 Avatars

- Shape: Tròn (`rounded-full`).
- Border: `2px solid var(--border)` cho avatar lớn.
- Size chuẩn: 32px (inline), 40px (card), 64px (profile), 96px (hero).

---

## 7. Product-Specific Logic

### 7.1 Content Access Levels

| Level | Badge Color | Mô tả |
|-------|------------|-------|
| **Lv1 (Standard)** | Silver (`#a8b2bd`) | Nội dung miễn phí |
| **Lv2 (Premium)** | Gold (`#d4af37`) | Trả phí hoặc Tier 2 Sub |
| **Lv3 (Exclusive)** | Crimson (`#E50914`) | Xác minh ID hoặc Tier 3 Sub |

### 7.2 Aura Coins (AC)

- Icon: Custom coin symbol với gold glow nhẹ (`#d4af37`).
- Format hiển thị: `[CoinIcon] 50 AC`.
- Luôn nằm trên navbar, visible mọi lúc.

### 7.3 Creator Studio vs Viewer

| Aspect | Viewer | Creator Studio |
|--------|--------|---------------|
| **Focus** | Immersive, ảnh lớn, tiêu thụ | Data-heavy, bảng, biểu đồ |
| **Density** | Thoáng, breathing room | Compact hơn, nhiều info |
| **Palette** | Giống nhau | Giống nhau |
| **Layout** | 1–2 cột | 2–3 cột |

---

## 8. Visual Effects — Glassmorphism Policy

> ⚠️ **Kiểm soát chặt.** Chỉ dùng Glassmorphism cho các element cố định (fixed).

### Được phép

| Element | Style |
|---------|-------|
| **Top Navbar** | `rgba(14, 14, 16, 0.7)` + `backdrop-filter: blur(12px)` |
| **Sidebar** | `rgba(14, 14, 16, 0.8)` + `backdrop-filter: blur(8px)` |
| **Modal overlay** | `rgba(0, 0, 0, 0.6)` + `backdrop-filter: blur(4px)` |

### KHÔNG được phép

- Card thường
- Button
- Input
- Badge
- Dropdown menu
- Tooltip

> Glassmorphism chỉ tạo depth cho navigation layer, **không phải trang trí**.

---

## 9. Motion & Animation

### 9.1 Nguyên tắc

Chỉ animate các thuộc tính **rẻ** (không gây layout thrashing):

```
✅ transform (translate, scale, rotate)
✅ opacity
✅ filter (nhẹ, nếu cần)
❌ width, height, margin, padding, top, left
```

### 9.2 Transition chuẩn

| Loại | Duration | Easing | Dùng cho |
|------|----------|--------|---------|
| **Fast** | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover, focus |
| **Normal** | 300ms | `ease-in-out` | Page transition, modal, dropdown |
| **Slow** | 500ms | `ease-in-out` | Hero animation, onboarding |

### 9.3 Pattern được phép

- Fade-in khi mount.
- Slide-up nhẹ (`translateY(10px) → 0`).
- Scale nhẹ khi hover (`1.02x`) hoặc active (`0.98x`).
- Opacity transition cho hover state.

### 9.4 Pattern CẤM

- `animate-spin` (trừ loading spinner nhỏ).
- `animate-pulse` lạm dụng.
- JavaScript animation cho hiệu ứng đơn giản.
- Motion quá nhiều gây cảm giác template rẻ tiền.

---

## 10. Loading & Empty States

### 10.1 Loading

- Dùng **Skeleton loader** với shimmer effect.
- Skeleton color: `--muted` (`#262626`), shimmer highlight nhẹ hơn.
- Không lạm dụng `animate-pulse`. Ưu tiên shimmer gradient.

### 10.2 Empty state

- Luôn có message rõ ràng, ví dụ: *"Chưa có giao dịch nào."*
- Có thể kèm illustration muted hoặc icon lớn.
- Có CTA nếu user có thể hành động.

### 10.3 Error state

- Message rõ ràng, không expose stack trace.
- Có retry action nếu applicable.
- Style: border `--destructive`, text muted.

---

## 11. Accessibility

- **Contrast**: Text chính trên nền tối phải đạt WCAG AA (≥ 4.5:1).
  - `#FFFFFF` trên `#0E0E10` = **19.5:1** ✅
  - `#A1A1AA` trên `#0E0E10` = **7.5:1** ✅
  - `#E50914` trên `#0E0E10` = **4.6:1** ✅ (vừa đủ AA)
- **Focus ring**: Không bao giờ xóa hoàn toàn. Dùng `--ring` color.
- **Touch target**: Tối thiểu 44×44px cho mobile.
- **Button**: Phải dùng `<button>`, không `<div onClick>`.
- **Image**: Phải có `alt` text.
- **Icon-only button**: Phải có `aria-label`.

---

## 12. CSS Variable Reference (Dark Mode)

Bảng map đầy đủ giữa design token và CSS variable:

```css
/* Core */
--background: #0e0e0e;
--foreground: #ffffff;

/* Card */
--card: #131313;
--card-foreground: #ffffff;

/* Primary (Brand Red) */
--primary: #E50914;
--primary-foreground: #ffffff;

/* Secondary (Gold) */
--secondary: #fbbf24;
--secondary-foreground: #451a03;

/* Muted */
--muted: #262626;
--muted-foreground: #adaaaa;

/* Accent */
--accent: #262626;
--accent-foreground: #ffffff;

/* Destructive */
--destructive: #ff6e84;

/* Border & Input */
--border: #484847;
--input: #1a1a1a;
--ring: #E50914;

/* Border Radius Base */
--radius: 0.35rem; /* ≈ 5.6px */

/* Sidebar */
--sidebar: #0e0e0e;
--sidebar-primary: #E50914;
--sidebar-border: #484847;
```

> Khi code, **luôn dùng CSS variable** (`bg-primary`, `text-muted-foreground`, `border-border`) thay vì hardcode hex.
