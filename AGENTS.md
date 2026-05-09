<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project may use a newer Next.js version with breaking changes. APIs, conventions, and file structure may differ from older knowledge.

Before writing or modifying code, the AI must:

- Read relevant guides in `node_modules/next/dist/docs/` when needed.
- Respect current project structure and conventions.
- Heed deprecation notices.
- Avoid outdated Next.js patterns unless the project already uses them intentionally.

<!-- END:nextjs-agent-rules -->

# Frontend Development Rules & Standards

Dự án này tuân thủ nghiêm ngặt các quy tắc Frontend dưới đây. AI và developer không được tự ý phá vỡ kiến trúc, style, rendering strategy hoặc API contract.

## ⚠️ Mandatory Context Files

> **BẮT BUỘC ĐỌC** trước khi code bất kỳ feature nào. Đây là các tài liệu nền tảng:

| File | Vai trò | Khi nào đọc |
|------|---------|-------------|
| **`PRODUCT.md`** | Business spec, user roles, workflows, vòng đời dữ liệu, quy tắc nghiệp vụ | Trước khi code **bất kỳ feature nào** — để hiểu domain, luồng dữ liệu, và các edge case nghiệp vụ |
| **`DESIGN.md`** | Design system, bảng màu, typography, component specs, CSS variable mapping | Trước khi tạo/sửa **bất kỳ UI component nào** — để đảm bảo visual consistency |
| **`AGENTS.md`** (file này) | Quy tắc kỹ thuật frontend, kiến trúc, rendering, API integration | Luôn tuân thủ |

### Quy tắc sử dụng

- **PRODUCT.md** là nguồn sự thật duy nhất cho **nghiệp vụ**. Không bịa luồng nghiệp vụ. Nếu thiếu thông tin, hỏi lại.
- **DESIGN.md** là nguồn sự thật duy nhất cho **visual**. Luôn dùng CSS variable, không hardcode hex.
- Khi có xung đột giữa 3 file, ưu tiên: `PRODUCT.md` (nghiệp vụ) > `AGENTS.md` (kỹ thuật) > `DESIGN.md` (visual).

---

## 1. Expert Routing

Trước khi xử lý task, AI phải xác định vai trò chuyên gia phù hợp.

Ví dụ:

```txt
Acting as: Senior Next.js Frontend Architect
```

Một số role thường dùng:

- `Senior Next.js Frontend Architect`
- `Senior UI Engineer`
- `Frontend Performance Engineer`
- `API Integration Engineer`
- `Code Review Engineer`

Nếu task có nhiều phần, AI có thể ghi rõ:

```txt
Acting as: Senior Next.js Frontend Architect + API Integration Engineer
```

---

## 2. Kiến trúc thư mục

Dự án sử dụng **Feature-based Architecture / Feature-Sliced Design style**.

Không gom code bừa bãi vào global bucket.

### Cấu trúc khuyến nghị

```txt
src/
  app/
    <route>/
      page.tsx
      loading.tsx
      error.tsx
      not-found.tsx

  features/
    <feature-name>/
      components/
      constants/
      hooks/
      services/
      types/
      utils/
      index.ts

  shared/
    components/
    ui/
    lib/
    utils/
    types/
    config/
```

### Quy tắc

- `src/app` chỉ dùng cho routing, layout cấp route, metadata, loading/error boundary.
- Không nhét UI phức tạp trực tiếp vào `page.tsx`.
- `page.tsx` nên import component chính từ feature.
- Code theo nghiệp vụ đặt trong `src/features/<feature-name>`.
- Component dùng chung thật sự mới đặt vào `src/shared`.
- Không tạo `src/components` làm nơi chứa mọi thứ.
- Không import sâu lung tung nếu feature đã có `index.ts`.
- Không tạo feature mới nếu logic thực chất thuộc feature đã có.

Ví dụ đúng:

```tsx
// src/app/wallet/page.tsx
import { WalletPage } from "@/features/wallet";

export default function Page() {
  return <WalletPage />;
}
```

Ví dụ tránh:

```tsx
// Sai: nhét toàn bộ UI vào page.tsx
export default function Page() {
  return (
    <div>
      {/* 500 dòng JSX */}
    </div>
  );
}
```

---

## 3. Công nghệ cốt lõi

Dự án sử dụng:

- Next.js App Router
- TypeScript
- TailwindCSS
- Shadcn UI
- Native `fetch`

### Bắt buộc

- Không dùng JavaScript thuần nếu có thể dùng TypeScript.
- Không dùng `any` nếu không thật sự cần.
- Không dùng Axios.
- Không dùng thư viện UI ngoài nếu Shadcn UI hoặc component nội bộ đã đủ, nếu cần thư viện icon có thể hỏi ý kiến trước khi dùng.
- Ưu tiên dùng thư viện icon đã có sẵn trong project trước khi thêm mới.
- Icon library mặc định hiện tại của project là `lucide-react` theo cấu hình `components.json` (`iconLibrary: "lucide"`).
- Với UI hoặc component mới, mặc định dùng icon từ `lucide-react` để đồng bộ với Shadcn UI và codebase hiện tại.
- Không tạo UI mới bằng icon dạng text/font thủ công nếu cùng nhu cầu đã có thể giải quyết bằng `lucide-react`.
- Chỉ dùng icon package khác khi `lucide-react` không đáp ứng được và phải nêu rõ lý do.
- Không tự thêm package mới khi chưa có lý do rõ ràng.
- Không tự ý thay đổi config lớn như `next.config`, `tsconfig`, Tailwind config nếu task không yêu cầu.

---

## 4. Rendering Strategy: SSR-first

Dự án lấy **SSR / Server Components làm mặc định**.

### Server Component mặc định dùng cho

- Page chính.
- Layout.
- Header, Footer, Sidebar nếu không có tương tác client.
- Trang chi tiết video.
- Trang danh sách có dữ liệu khởi tạo từ server.
- Component chỉ render UI từ props.
- SEO-critical content.

### Client Component chỉ dùng khi cần

Chỉ thêm `"use client"` nếu component có:

- `useState`
- `useEffect`
- `useRef` phụ thuộc browser behavior
- `onClick`, `onChange`, `onSubmit`
- browser API như `window`, `document`, `localStorage`
- form interactive
- modal/dropdown/tab cần state client
- upload file phía client
- player controls phía client

### Quy tắc quan trọng

- Không đặt `"use client"` ở `page.tsx` nếu có thể tránh.
- Đẩy `"use client"` xuống leaf component thấp nhất.
- Server Component fetch dữ liệu rồi truyền props xuống Client Component.
- Không dùng `useEffect` chỉ để fetch dữ liệu ban đầu nếu có thể fetch ở Server Component.
- Dùng `<Suspense fallback={<Loading />}>` cho loading UI khi phù hợp.

Ví dụ đúng:

```tsx
// Server Component
import { VideoList } from "@/features/video";

export default async function Page() {
  const videos = await getVideos();

  return <VideoList videos={videos} />;
}
```

```tsx
// Client leaf component
"use client";

export function LikeButton() {
  return <button onClick={() => {}}>Like</button>;
}
```

---

## 5. Form Handling

Với Next.js App Router:

- Ưu tiên `next/form` cho form `GET`, ví dụ search/filter.
- Với form tương tác phức tạp, có thể dùng Client Component.
- Không dùng form client chỉ vì có input nếu có thể xử lý bằng search params.
- Validate dữ liệu rõ ràng trước khi gọi API.

Ví dụ search/filter nên ưu tiên:

```tsx
import Form from "next/form";

export function SearchForm() {
  return (
    <Form action="/search">
      <input name="q" />
      <button type="submit">Search</button>
    </Form>
  );
}
```

---

## 6. Data Fetching & API Integration

### Nguyên tắc

- Tuyệt đối không dùng Axios.
- Gọi API qua Native `fetch` hoặc wrapper của project.
- API phải đi qua API Gateway.
- Gateway base URL lấy từ:

```txt
NEXT_PUBLIC_GATEWAY_URL
```

### Auth flow

- `accessToken` nằm trong response body.
- Frontend lưu `accessToken` trong memory/context/state phù hợp.
- `refresh_token` là `httpOnly cookie`.
- Khi gọi API cần auth, phải dùng:

```ts
credentials: "include"
```

### 401 handling

Fetch wrapper phải có luồng xử lý:

1. Request API với access token hiện tại.
2. Nếu nhận 401:
   - gọi refresh endpoint.
   - nếu refresh thành công, retry request cũ.
   - nếu refresh thất bại, chuyển user về login hoặc trả lỗi auth rõ ràng.
3. Không tạo vòng lặp refresh vô hạn.

### Quy tắc

- Không gọi API trực tiếp từ component lung tung nếu project đã có `apiClient`.
- Không hardcode URL backend.
- Không bỏ qua lỗi API.
- Không swallow error im lặng.
- Không expose refresh token ra JavaScript.
- Không gọi service nội bộ trực tiếp từ frontend, chỉ gọi qua API Gateway.

Ví dụ đúng:

```ts
const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
```

Ví dụ sai:

```ts
fetch("http://localhost:3001/api/videos");
```

---

## 7. UI Style: Cinematic Canvas

> 📖 **Tài liệu đầy đủ:** Xem `DESIGN.md` — Single Source of Truth cho toàn bộ design system.

Phong cách giao diện của dự án là **Cinematic Canvas** ("The Velvet Gallery").

### Nguyên tắc nhanh (Quick Guards)

- Dark mode mặc định. Chưa hỗ trợ light mode.
- Primary: `#E50914`. Secondary (Gold): `#f59e0b`.
- Font: **Manrope** (heading) + **Inter** (body).
- Spacing: Grid 8px. Không `p-[13px]` tùy tiện.
- Border-radius: Ưu tiên `rounded-sm`, `rounded-md`, `rounded-lg`. Hạn chế `rounded-2xl` trở lên.
- Luôn dùng CSS variable (`bg-primary`, `text-muted-foreground`) thay vì hardcode hex.

### Cấm tuyệt đối

```txt
❌ Màu tím/violet/purple/fuchsia làm primary
❌ Glassmorphism trên card, button, input, badge, dropdown, tooltip
❌ Gradient loè loẹt
❌ rounded-2xl, rounded-3xl cho card/container
```

### Glassmorphism — Chỉ dùng có kiểm soát

Chỉ được phép trên **element cố định (fixed)**:

| Element | Cho phép |
|---------|----------|
| Top Navbar | ✅ `backdrop-filter: blur(12px)` |
| Sidebar | ✅ `backdrop-filter: blur(8px)` |
| Modal overlay | ✅ `backdrop-filter: blur(4px)` |
| Mọi thứ khác | ❌ Không |

> Chi tiết bảng màu, typography scale, component specs, CSS variable mapping → **`DESIGN.md`** Section 2–6, 12.

---

## 8. Animation & Motion

> 📖 **Chi tiết đầy đủ:** `DESIGN.md` — Section 9.

### Quy tắc cốt lõi

Chỉ animate thuộc tính **rẻ** (không gây layout thrashing):

```txt
✅ transform, opacity, filter (nhẹ)
❌ width, height, margin, padding, top, left
```

### Được dùng

- CSS transition (`ease-in-out`, 300ms).
- Hover/focus state nhẹ: `hover:opacity-90`, `hover:-translate-y-0.5`.
- Fade-in, slide-up nhẹ khi mount.
- Scale nhẹ: hover `1.02x`, active `0.98x`.

### Cấm

- JavaScript animation cho hiệu ứng đơn giản.
- Lạm dụng `animate-spin`, `animate-pulse`.
- Motion quá nhiều → UI giống template rẻ tiền.

---

## 9. Shadcn UI Rules

- Dùng Shadcn UI cho primitive/component phổ biến.
- Không tự viết lại Button/Input/Dialog nếu project đã có Shadcn UI tương ứng.
- Với icon trong component/UI mới, mặc định dùng `lucide-react`.
- Có thể custom `className` để khớp Cinematic Canvas.
- Không biến Shadcn UI thành giao diện generic mặc định.
- Không lạm dụng component nếu HTML đơn giản hơn.

Ví dụ:

```tsx
import { Button } from "@/shared/ui/button";
```

Hoặc theo alias hiện tại của project.

Nếu alias thực tế khác, phải theo cấu trúc project đang có.

---

## 10. Convert HTML sang Next.js

Khi convert HTML tĩnh sang Next.js:

### Bắt buộc làm trước

AI phải phân tích HTML và đề xuất:

1. Feature name.
2. Route.
3. Component tree.
4. File tree.
5. Component nào là Server Component.
6. Component nào là Client Component.
7. Dữ liệu nào cần tách sang constants.
8. Asset nào cần bổ sung.

### Quy tắc convert

- Không copy toàn bộ HTML vào một component lớn.
- Không nhét toàn bộ UI vào `page.tsx`.
- Section lớn phải tách component riêng.
- Card/list/table/menu lặp lại phải map từ array.
- Inline style chuyển sang TailwindCSS nếu có thể.
- Style phức tạp có thể chuyển sang CSS module nếu Tailwind không phù hợp.
- Script DOM thuần phải chuyển sang React state/ref/effect đúng cách.
- Không dùng `document.querySelector` nếu có thể thay bằng state/ref.
- Không tự thêm API call nếu HTML gốc chỉ là UI tĩnh.
- Giữ visual giống HTML gốc nhất có thể.
- Không đổi text, spacing, màu sắc, layout nếu không có lý do.
- Nếu HTML dùng màu tím/violet, phải chuyển sang tone hợp rule trừ khi người dùng yêu cầu giữ nguyên.
- Nếu thiếu ảnh/icon/font, ghi chú rõ cần đặt asset ở đâu.

### Cấu trúc convert gợi ý

```txt
src/
  app/
    <route>/
      page.tsx

  features/
    <feature-name>/
      components/
        <FeaturePage>.tsx
        <SectionA>.tsx
        <SectionB>.tsx
      constants/
        <feature>.mock.ts
      types/
        <feature>.types.ts
      index.ts
```

Ví dụ:

```txt
src/
  app/
    wallet/
      page.tsx

  features/
    wallet/
      components/
        WalletPage.tsx
        WalletBalanceCard.tsx
        DepositPackages.tsx
        TransactionHistory.tsx
      constants/
        wallet.mock.ts
      types/
        wallet.types.ts
      index.ts
```

---

## 11. TypeScript Rules

- Không dùng `any` nếu có thể tránh.
- Ưu tiên type/interface rõ ràng cho props.
- Props của component phải được type.
- API response phải có type.
- Dữ liệu mock/constants nên có type.
- Không để object lớn không type nếu được dùng nhiều nơi.
- Không dùng enum nếu union type đủ đơn giản, trừ khi project đang dùng enum thống nhất.

Ví dụ:

```ts
export type DepositPackage = {
  id: string;
  name: string;
  price: number;
  bonusPercent: number;
};
```

---

## 12. Component Rules

### Component nên

- Nhỏ, rõ nhiệm vụ.
- Có tên theo nghiệp vụ.
- Nhận props rõ ràng.
- Tách data khỏi UI nếu dữ liệu lặp.
- Dùng composition thay vì nhồi logic.

### Component không nên

- Vượt quá lớn nếu có thể tách section.
- Vừa fetch, vừa xử lý state, vừa render nhiều layout phức tạp.
- Dùng `"use client"` khi chỉ render props.
- Chứa nhiều magic number không giải thích.
- Chứa mock data hardcode trong JSX nếu list dài.

Ví dụ đúng:

```tsx
type PackageCardProps = {
  title: string;
  price: number;
  bonus: string;
};

export function PackageCard({ title, price, bonus }: PackageCardProps) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{price}</p>
      <span>{bonus}</span>
    </article>
  );
}
```

---

## 13. Naming Conventions

### File/folder

- Feature folder: kebab-case hoặc theo convention hiện tại.
- Component file: PascalCase.
- Types file: `<feature>.types.ts`.
- Constants file: `<feature>.constants.ts` hoặc `<feature>.mock.ts`.
- Service file: `<feature>.service.ts`.

Ví dụ:

```txt
features/
  studio-wallet/
    components/
      StudioWalletPage.tsx
      RevenueSummaryCard.tsx
    constants/
      studio-wallet.mock.ts
    types/
      studio-wallet.types.ts
```

### Component

- Component dùng PascalCase.
- Hook bắt đầu bằng `use`.
- Function xử lý API/service đặt tên rõ nghĩa.

---

## 14. Error, Loading, Empty State

> 📖 **Chi tiết visual specs:** `DESIGN.md` — Section 10.

Mỗi UI có dữ liệu **phải** xử lý đủ 4 trạng thái:

1. **Loading** — Skeleton shimmer (không lạm dụng `animate-pulse`). Dùng `<Suspense>` khi phù hợp.
2. **Empty** — Message rõ ràng + CTA nếu user có thể hành động. Ví dụ: *"Chưa có giao dịch nào."*
3. **Error** — Message rõ, không expose stack trace. Có retry action nếu applicable.
4. **Success** — Render data bình thường.

Không bao giờ render màn hình trắng khi lỗi.

---

## 15. Accessibility

> 📖 **Contrast ratios & chi tiết:** `DESIGN.md` — Section 11.

- `<button>` cho action, không `<div onClick>`.
- `<Link>` cho navigation.
- `<img>` phải có `alt`.
- `<input>` phải có `<label>` hoặc `aria-label`.
- Icon-only button phải có `aria-label`.
- Focus state không được xóa hoàn toàn — dùng `--ring` (`#E50914`).
- Contrast tối thiểu WCAG AA (≥ 4.5:1). Kiểm tra với nền `#0E0E10`.
- Touch target tối thiểu 44×44px cho mobile.

---

## 16. Image & Asset Rules

- Dùng `next/image` khi phù hợp.
- Asset nội bộ đặt trong `public/` hoặc theo convention project.
- Không hotlink ảnh không rõ nguồn nếu không cần.
- Nếu HTML gốc có ảnh thiếu file, AI phải ghi chú.
- Không tự thay ảnh quan trọng bằng ảnh random.
- Icon nên dùng thư viện đang có trong project, hoặc Shadcn/Lucide nếu project đã dùng.

---

## 17. Security Rules

- Không expose token nhạy cảm.
- Không lưu refresh token vào `localStorage` hoặc `sessionStorage`.
- Không hardcode secret trong frontend.
- Không log access token hoặc refresh token.
- Không render HTML thô bằng `dangerouslySetInnerHTML` nếu không cần.
- Nếu bắt buộc dùng `dangerouslySetInnerHTML`, phải nêu rõ lý do và nguồn dữ liệu đã sanitize.
- Không tin dữ liệu từ client.
- Không bypass auth check bằng UI-only logic.

---

## 18. API Contract Sync

Khi UI cần field không có trong API contract, AI phải báo rõ.

Ví dụ:

```txt
UI cần field `creator.avatarUrl`, nhưng API hiện tại chưa thấy field này.
Cần chọn một trong hai hướng:
1. Backend bổ sung field.
2. Frontend dùng fallback avatar.
```

Không tự bịa field API như thật.

Không tự đổi response shape nếu chưa được xác nhận.

---

## 19. Socratic Gate

Trước khi code tính năng mới hoặc refactor lớn, AI phải tạo plan trước.

Plan có thể là:

- Markdown trong câu trả lời.
- Hoặc file `implementation_plan.md` nếu người dùng yêu cầu.

Plan phải gồm:

1. Mục tiêu.
2. File sẽ tạo/sửa.
3. Component/server-client boundary.
4. API/data cần dùng.
5. Rủi ro hoặc điểm cần xác nhận.

### Ngoại lệ

Nếu người dùng nói rõ:

```txt
code luôn
sửa trực tiếp
generate luôn
không cần hỏi lại
```

AI được phép triển khai ngay, nhưng vẫn phải tự kiểm tra rule trước khi kết thúc.

### Không hỏi thừa

Không hỏi lại những gì người dùng đã cung cấp.

Nếu thiếu thông tin nhỏ, AI có thể tự chọn phương án hợp lý và ghi rõ assumption.

---

## 20. Output Format Bắt Buộc Khi AI Code

Khi tạo hoặc sửa code, AI phải trả lời theo format:

```txt
Acting as: <role>

Plan:
- ...

File tree:
- ...

Code:
- <path>
  ```tsx
  ...
  ```

Self-check:
- ...
```

### Code by file

Mỗi file phải có path rõ ràng.

Ví dụ:

```tsx
// src/features/wallet/components/WalletPage.tsx
export function WalletPage() {
  return <main>Wallet</main>;
}
```

### Không được

- Trả code không ghi path.
- Trộn nhiều file vào một block không rõ ràng.
- Bỏ qua `index.ts` nếu feature cần public export.
- Viết code xong mà không tự check rule.

---

## 21. Final Self-Check

Trước khi kết thúc task code, AI phải tự kiểm tra:

```txt
Self-check:
- Không dùng Axios.
- Không hardcode backend URL.
- Không lạm dụng "use client".
- page.tsx vẫn là Server Component nếu có thể.
- Component lớn đã được tách nhỏ hợp lý.
- Data lặp đã được tách sang constants.
- Props và API response đã có type.
- Không dùng tím/violet làm màu chủ đạo.
- Màu sắc dùng CSS variable (bg-primary) thay vì hardcode hex.
- Animation chỉ dùng transform/opacity nếu có.
- Glassmorphism chỉ trên navbar/sidebar/modal overlay.
- Border-radius không vượt quá rounded-lg cho card.
- Font heading dùng Manrope, body dùng Inter.
- Fetch auth có credentials: "include" khi cần.
- API đi qua NEXT_PUBLIC_GATEWAY_URL.
- Không tạo global component nếu không thật sự shared.
- Tuân thủ DESIGN.md cho mọi visual decision.
```

Nếu có rule bị vi phạm vì lý do bắt buộc, AI phải ghi rõ lý do.

---

## 22. Review Code Rules

Khi review code, AI phải kiểm tra:

**Kiến trúc:**
- Kiến trúc feature-based có đúng không.
- Có component nào quá lớn không.
- Có lạm dụng Client Component không.
- Có fetch trong `useEffect` không cần thiết không.

**API & Data:**
- Có dùng Axios không.
- Có hardcode URL không.
- Có field API bịa không.

**Hydration & SSR:**
- Có lỗi hydration tiềm ẩn không.
- Có dùng `Date.now()`, `Math.random()`, locale date trực tiếp khi SSR không.
- Có nested HTML sai không.

**Design (theo DESIGN.md):**
- Có animation gây layout thrashing không.
- Có màu tím/violet làm primary không.
- Có dùng CSS variable thay vì hardcode hex không.
- Glassmorphism chỉ trên navbar/sidebar/modal không.
- Border-radius có vượt quá `rounded-lg` cho card không.
- Font heading (Manrope) và body (Inter) có đúng không.
- Có accessibility cơ bản không (contrast, aria-label, focus ring).

---

## 23. Hydration Safety

Tránh các nguyên nhân gây hydration mismatch:

- Không render `Date.now()` trực tiếp trong SSR.
- Không render `Math.random()` trực tiếp trong SSR.
- Không format date theo locale khác nhau giữa server/client nếu chưa kiểm soát.
- Không dùng `window`, `document`, `localStorage` trong Server Component.
- Không branch UI bằng `typeof window !== "undefined"` trong render nếu gây mismatch.
- Không viết HTML nesting sai.
- Không để extension/browser-only state ảnh hưởng initial render.

Nếu cần dữ liệu client-only, tách thành Client Component và render fallback an toàn.

---

## 24. Performance Rules

- Tránh bundle client quá lớn.
- Không biến cả page thành Client Component.
- Không import thư viện nặng vào component client nếu không cần.
- Dùng dynamic import khi component nặng và không cần SSR.
- Dữ liệu mock lớn không đặt trong component render.
- Không tạo function/object mới quá nhiều trong list lớn nếu có thể tránh.
- Tối ưu image bằng `next/image` khi phù hợp.

---

## 25. Git & Change Safety

Khi sửa code:

- Không sửa file ngoài phạm vi task nếu không cần.
- Không format toàn bộ project nếu task chỉ sửa một feature.
- Không đổi convention project đang dùng.
- Không xoá code cũ nếu chưa chắc không dùng.
- Với refactor lớn, nên giữ compatibility tạm thời nếu có thể.
- Nếu đổi public API của feature, phải ghi rõ ảnh hưởng.

---

# Prompt mẫu: Convert HTML sang Next.js

Dùng prompt này khi muốn AI convert file HTML:

```txt
Acting as: Senior Next.js Frontend Architect.

Đọc kỹ frontend rules của project trước khi làm.

Tôi có một file HTML giao diện tĩnh. Hãy convert sang Next.js App Router + TypeScript + TailwindCSS + Shadcn UI theo feature-based architecture.

Yêu cầu:
- Tuân thủ tuyệt đối frontend rules.
- Không dùng Axios.
- SSR-first.
- Không lạm dụng "use client".
- Không dùng màu tím/violet làm màu chủ đạo.
- Không gom toàn bộ UI vào page.tsx.
- Không tạo global components nếu không thật sự shared.
- Giữ giao diện giống HTML gốc nhất có thể.

Feature name: <điền tên feature>

Route mong muốn:
src/app/<route>/page.tsx

Trước tiên hãy:
1. Phân tích HTML.
2. Đề xuất file tree.
3. Chỉ rõ component nào là Server Component.
4. Chỉ rõ component nào là Client Component.
5. Chỉ rõ data nào nên tách constants.
6. Chỉ rõ asset nào cần bổ sung.
7. Sau khi có plan, generate code từng file.

HTML:
```html
<!-- Dán HTML vào đây -->
```
```

---

# Prompt mẫu: Review code sau khi AI generate

```txt
Acting as: Code Review Engineer.

Review phần code vừa generate theo frontend rules của project.

Kiểm tra:
- Có đúng feature-based architecture không?
- Có lạm dụng "use client" không?
- page.tsx có bị biến thành Client Component không?
- Có dùng Axios không?
- Có hardcode backend URL không?
- Có vi phạm màu tím/violet không?
- Có component nào quá lớn không?
- Có data lặp hardcode trong JSX không?
- Có lỗi hydration tiềm ẩn không?
- Có animation gây layout thrashing không?
- Có thiếu type không?
- Có thiếu loading/error/empty state không?

Trả về:
1. Các lỗi nghiêm trọng.
2. Các điểm nên cải thiện.
3. Bản refactor đề xuất nếu cần.
```

---

# Prompt mẫu: Code luôn không hỏi lại

```txt
Acting as: Senior Next.js Frontend Architect.

Code luôn, không cần hỏi lại.

Tuân thủ frontend rules:
- Next.js App Router + TypeScript.
- TailwindCSS + Shadcn UI.
- Feature-based architecture.
- SSR-first.
- Không Axios.
- Không lạm dụng "use client".
- Không dùng tím/violet làm primary.
- API đi qua NEXT_PUBLIC_GATEWAY_URL nếu có gọi API.
- Fetch auth phải có credentials: "include".

Output:
- File tree.
- Code từng file.
- Self-check cuối cùng.
```
