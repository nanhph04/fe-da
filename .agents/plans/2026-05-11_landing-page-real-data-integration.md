# Plan: Ghép dữ liệu thật cho trang /landing

- **Ngày viết:** 2026-05-11
- **Trạng thái:** 📋 Chờ duyệt
- **Liên quan:** Feature `home`, Service `publicMediaService`, `mediaService`

---

## Mục tiêu

Thay toàn bộ dữ liệu mock trên trang `/landing` bằng API thật từ **Media Service**. Giữ nguyên visual/layout hiện tại (Cinematic Canvas). Trang này là **public** (guest), không yêu cầu auth.

---

## 1. Hiện trạng — Kiểm kê mock data

### File chính: `src/features/home/components/LandingPage.tsx`

| Biến mock | Dòng | Nội dung | Vấn đề |
|-----------|------|----------|--------|
| `featuredContent` | L5–9 | Hero banner — title "Midnight Cinema", ảnh Unsplash | Hoàn toàn giả |
| `trendingContent` | L11–18 | 6 video — title/creator/views/duration hardcode | Hoàn toàn giả |
| `newReleases` | L20–27 | 6 video — tương tự | Hoàn toàn giả |
| `forYouContent` | L29–36 | 6 item — views kiểu "Based on watch history" | Giả + không hợp lệ cho guest |

### Các component con

| Component | File | Mock? | Ghi chú |
|-----------|------|-------|---------|
| `HeroSection` | `HeroSection.tsx` | Nhận props từ parent mock | Button "Watch Now" / "Add to Watchlist" không có link |
| `MediaRow` | `MediaRow.tsx` | Nhận props từ parent mock | `"use client"` — scroll behavior, OK |
| `MediaCard` | `MediaCard.tsx` | Props: `title, creator, views(string), imageUrl, duration` | Không có `videoId`, không link `/watch/:id`, views là string |
| `TopNavHome` | `TopNavHome.tsx` | Không mock | Server Component wrapper, OK |

**Kết luận:** 0% dữ liệu thật. 100% cần thay.

---

## 2. Service đã có sẵn

### ✅ Dùng được ngay (SSR — server-only)

| Function | File | API Endpoint | Cached? |
|----------|------|-------------|---------|
| `getLatestVideosCached(limit)` | `publicMediaService.ts` | `GET /api/media/videos/discovery/latest?limit=` | ✅ `"use cache"` — `cacheLife("minutes")` |

### ✅ Dùng được ngay (Client-side)

| Function | File | API Endpoint |
|----------|------|-------------|
| `mediaService.getLatestVideos({ limit })` | `mediaService.ts` | `GET /api/media/videos/discovery/latest` |
| `mediaService.getVideosByCategory(slug, { page, limit })` | `mediaService.ts` | `GET /api/media/videos/discovery/by-category` |
| `mediaService.getCategories()` | `mediaService.ts` | `GET /api/media/categories` |

### ❌ Cần tạo mới (SSR cached)

| Function cần tạo | Lý do |
|-------------------|-------|
| `getCategoriesCached()` | Landing page là SSR, cần cached fetch cho categories |
| `getVideosByCategoryCached(slug, limit)` | Landing page cần video theo category ở server side |

### ⚠️ Không dùng được cho landing (yêu cầu auth)

| Function | Lý do không dùng |
|----------|------------------|
| `mediaService.getSubscribedVideos()` | Cần `x-user-id` — guest không có |
| `mediaService.getContinueWatching()` | Cần `x-user-id` — guest không có |

---

## 3. Mapping: Mock → API thật

| Section UI | Mock hiện tại | → API thật | Render strategy |
|------------|--------------|-----------|-----------------|
| **Hero Section** | `featuredContent` — ảnh Unsplash, title/subtitle giả | Video đầu tiên từ `getLatestVideosCached(1)` — dùng `thumbnailUrl` làm background, `title` + `description` làm nội dung | **SSR** |
| **"Trending Now"** | `trendingContent` — 6 item giả | Rename thành **"Mới phát hành"**. Dùng `getLatestVideosCached(12)`, lấy 6 video đầu (bỏ video hero nếu trùng) | **SSR** |
| **"New Releases"** | `newReleases` — 6 item giả | Thay bằng **video theo category**. Fetch category đầu tiên từ `getCategoriesCached()`, rồi `getVideosByCategoryCached(slug, 6)` | **SSR** |
| **"Recommended for You"** | `forYouContent` — giả hoàn toàn | Thay bằng **"Khám phá theo thể loại"** — hiển thị danh sách category dạng chips/tags + link đến `/category/[slug]` | **SSR** |

---

## 4. Quyết định cần xác nhận

> ⚠️ **Q1 — Hero Video:** Dùng video mới nhất có `thumbnailUrl` làm hero. Nếu không có video → fallback về static hero hiện tại. **OK?**

> ⚠️ **Q2 — Section "Recommended":** Thay bằng "Khám phá theo thể loại" hiển thị category chips. Vì trang public không có auth, không thể cá nhân hóa. **Chọn phương án nào?**
> - **(A)** "Khám phá theo thể loại" — category chips/tags ← Gợi ý
> - **(B)** Video theo category thứ 2 (nếu có)
> - **(C)** Bỏ section này

> ⚠️ **Q3 — Empty state:** Khi backend chưa có video nào, fallback toàn bộ về static hero + thông báo "Chưa có nội dung". Có cần design riêng không?

---

## 5. Chi tiết thay đổi theo file

### 5.1 [MODIFY] `src/features/watch/services/publicMediaService.ts`

**Thêm 2 SSR cached functions:**

```typescript
// Categories public cached
export async function getCategoriesCached() {
  "use cache";
  cacheLife("hours");
  cacheTag("media:categories");
  return fetchPublicApi<CategoryPublic[]>("/api/media/categories");
}

// Videos by category cached
export async function getVideosByCategoryCached(category: string, limit = 6) {
  "use cache";
  cacheLife("minutes");
  cacheTag("media:category-videos", `media:category:${category}`);
  return fetchPublicApi<PublicDiscoveryVideo[]>(
    `/api/media/videos/discovery/by-category?category=${category}&limit=${limit}`
  );
}
```

**Thêm type:**
```typescript
export interface CategoryPublic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active";
  createdAt: string;
  updatedAt: string;
}
```

---

### 5.2 [MODIFY] `src/app/landing/page.tsx`

**Từ:**
```tsx
import { LandingPage } from "@/features/home/components/LandingPage";
export default function LandingRoute() {
  return <LandingPage />;
}
```

**Thành:** Async Server Component fetch data rồi truyền props:
```tsx
import { LandingPage } from "@/features/home/components/LandingPage";
import {
  getLatestVideosCached,
  getCategoriesCached,
  getVideosByCategoryCached,
} from "@/features/watch/services/publicMediaService";

export default async function LandingRoute() {
  // Fetch song song
  const [latestRes, categoriesRes] = await Promise.all([
    getLatestVideosCached(13).catch(() => null),
    getCategoriesCached().catch(() => null),
  ]);

  const latestVideos = latestRes?.success ? (latestRes.data ?? []) : [];
  const categories = categoriesRes?.success ? (categoriesRes.data ?? []) : [];

  // Fetch video theo category đầu tiên (nếu có)
  let categoryVideos = [];
  let categoryName = "";
  if (categories.length > 0) {
    const firstCat = categories[0];
    categoryName = firstCat.name;
    const catRes = await getVideosByCategoryCached(firstCat.slug, 6).catch(() => null);
    categoryVideos = catRes?.success ? (catRes.data ?? []) : [];
  }

  return (
    <LandingPage
      latestVideos={latestVideos}
      categories={categories}
      categoryVideos={categoryVideos}
      categoryName={categoryName}
    />
  );
}
```

---

### 5.3 [MODIFY] `src/features/home/components/LandingPage.tsx`

- **Xóa** toàn bộ mock data (L5–36)
- **Thêm** props interface nhận data từ server:
  ```typescript
  interface LandingPageProps {
    latestVideos: PublicDiscoveryVideo[];
    categories: CategoryPublic[];
    categoryVideos: PublicDiscoveryVideo[];
    categoryName: string;
  }
  ```
- **Hero:** `latestVideos[0]` → `thumbnailUrl` làm background, `title` + `description` làm nội dung. Fallback static nếu rỗng.
- **Row 1 "Mới phát hành":** `latestVideos.slice(1, 7)` → map sang `MediaCard` props
- **Row 2 "{categoryName}":** `categoryVideos` → map sang `MediaCard` props
- **Row 3 "Khám phá theo thể loại":** `categories` → render category chips với Link đến `/category/[slug]`

---

### 5.4 [MODIFY] `src/features/home/components/MediaCard.tsx`

Cập nhật để hỗ trợ cả data thật:

| Prop hiện tại | Vấn đề | Sửa thành |
|---|---|---|
| `views: string` | API trả `viewCount: number` | Giữ `views: string`, format ở parent trước khi truyền |
| `imageUrl: string` | API trả `thumbnailUrl: string \| null` | Giữ `imageUrl`, fallback ở parent |
| `duration?: string` | API trả `durationSeconds: number \| null` | Giữ `duration`, format ở parent |
| *(thiếu)* | Không có link đến video | Thêm `href?: string` — wrap trong `Link` nếu có |

**Thêm:**
- Prop `href?: string` — nếu có, wrap card trong `<Link href={href}>`
- Giữ nguyên visual, chỉ thêm tính năng navigate

---

### 5.5 [MODIFY] `src/features/home/components/HeroSection.tsx`

- Thêm optional prop `videoId?: string` → "Watch Now" button trở thành `<Link href={/watch/${videoId}}>` thay vì `<button>` vô nghĩa
- Thêm fallback: nếu không có `imageUrl`, dùng gradient background thay vì ảnh trống

---

### 5.6 [MODIFY] `src/features/home/components/MediaRow.tsx`

- Không đổi logic scroll
- Thêm optional prop `viewAllHref?: string` cho link "View All" ở header row

---

### 5.7 [NEW] `src/features/home/utils/format.ts` *(optional)*

Helper functions:
```typescript
// Format seconds → "1:45:30" hoặc "52:18"
export function formatDuration(seconds: number | null): string;

// Format view count → "2.4M", "890K", "1,234"
export function formatViewCount(count: number): string;
```

---

## 6. Thứ tự thực hiện

1. **Tạo SSR services** — `getCategoriesCached()`, `getVideosByCategoryCached()`, type `CategoryPublic` trong `publicMediaService.ts`
2. **Tạo format utils** — `formatDuration()`, `formatViewCount()`
3. **Cập nhật `MediaCard`** — thêm `href` prop, wrap `Link`
4. **Cập nhật `HeroSection`** — thêm `videoId`, link "Watch Now"
5. **Cập nhật `LandingPage`** — xóa mock, nhận props, map data thật → component
6. **Cập nhật `page.tsx`** — async fetch + truyền props
7. **Test & verify**

---

## 7. Lưu ý quan trọng

> ⚠️ **Trang `/landing` là PUBLIC** — không có auth context. Tuyệt đối không gọi API yêu cầu `x-user-id`.

> ⚠️ **SSR-first** — Tất cả data fetch ở Server Component. `MediaRow` vẫn là `"use client"` cho scroll behavior — đây là đúng kiến trúc.

> ⚠️ **Không đụng visual/layout** — Chỉ thay data source. Giữ nguyên className, color, spacing, animation.

> ⚠️ **Fallback graceful** — Nếu backend offline hoặc chưa có video, trang vẫn render được (hero static + thông báo).

---

## 8. Verification Plan

### Build & Runtime
- `npm run build` — verify SSR compile, không lỗi import server-only
- `npm run dev` → mở `/landing` — verify hiển thị data thật

### Functional
- Video card click → navigate đến `/watch/:id`
- Hero "Watch Now" → navigate đến `/watch/:id` của video hero
- Category chips → navigate đến `/category/:slug`
- Thumbnail hiển thị đúng từ backend (không còn Unsplash)
- View count format đúng (K, M)
- Duration format đúng (mm:ss, h:mm:ss)

### Edge cases
- Backend offline → fallback UI, không crash
- Chưa có video nào → hero static + thông báo
- Chưa có category nào → ẩn section category
- Video không có thumbnail → fallback placeholder image

### Responsive
- Desktop 1440px, Tablet 768px, Mobile 375px — scroll behavior vẫn hoạt động

---

## 9. Kết quả mong đợi

- Trang `/landing` hiển thị video thật từ Media Service
- 0 mock data còn lại trong component
- SSR cached — load nhanh, SEO friendly
- Fallback graceful khi không có data
- Navigate đúng đến `/watch/:id` và `/category/:slug`
