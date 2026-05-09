# CLAUDE-RULES.md

File này cung cấp hướng dẫn tổng hợp cho AI khi làm việc với dự án này, kết hợp kiến trúc hiện có và quy tắc phát triển.

## Tổng quan dự án

Đây là một nền tảng video chia sẻ với tính năng:
- Upload video (Studio Upload)
- Xem video (Watch)
- Ví điện tử & thanh toán (Wallet)
- Membership (Gói thành viên)
- Admin Dashboard
- Discovery & Library

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (linting is required for commits)

### Testing
- No test framework is currently configured in this project.

## Kiến trúc thư mục (Bắt buộc tuân thủ)

### Feature-Sliced Design (FSD)
- **Tất cả code phải tổ chức theo tính năng** trong `src/features/`
- Mỗi feature có cấu trúc:
  ```
  src/features/{feature-name}/
  ├── components/     # Components riêng của feature
  ├── services/       # API calls, business logic
  ├── context/       # React contexts (nếu cần)
  ├── types/         # TypeScript interfaces
  └── index.ts       # Export chính
  ```
- **Cấm** nhét components vào `src/components/` trừ khi là Shared UI/Shadcn

### Các features hiện có:
- `auth` - Authentication
- `studio-upload` - Upload video (3-step wizard)
- `watch` - Video player + comments + related
- `wallet` - Payment methods, top-up, transactions
- `membership` - Membership tiers, checkout
- `admin` - Dashboard quản lý
- `library` - Personal video collection
- `discovery` - Content discovery

## Công nghệ & Quy tắc (Bắt buộc)

### Core Stack
- **Framework**: Next.js 16.2.3 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + Shadcn UI
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: Native `fetch` API + custom wrapper

### QUY TẮC CỨC ĐỘNG

#### 1. Render Strategy
- **SSR là mặc định**: Server components render static data
- CSR chỉ khi cần: Interactive elements (forms, buttons)
- **Dùng `<Suspense>`** thay vì `useEffect` cho loading
- **Cấm** `"use client"` ở root level (page.tsx)

#### 2. API Integration
- **TUYỆT ĐỐI KHÔNG DÙNG AXIOS**
- Luôn qua API Gateway: `NEXT_PUBLIC_GATEWAY_URL`
- JWT authentication với auto-refresh
- `refresh_token` là httpOnly cookie

#### 3. Design System (Phong cách "Cinematic Canvas")
- **Dark mode** cao cấp, tránh "Generic AI"
- **Màu cấm**: Tím/Violet (#8d00e6, #cf96ff)
- **Màu cho phép**: Crimson, Gold, Matte Black, Ivory
- **Typography**: Manrope (headings) + Inter (body)
- **Edges**: Bo nhẹ (`rounded-sm`/`rounded-md`), hạn chế glassmorphism
- **Spacing**: 8px grid với breathing room

#### 4. Animations
- **Chỉ dùng CSS transitions** (`transition-all duration-300 ease-in-out`)
- **Cấm** JS cho animations đơn giản
- **Chỉ animate**: `transform`, `opacity`
- **Cấm animate**: `width`, `height`, `margin`, `padding`

#### 5. Form Handling
- React Hook Form + Zod validation
- Ưu tiên `<Form>` từ `next/form` cho GET requests

## Quy tắc phát triển

### 1. Luôn check existing code trước khi viết mới
- Theo dõi patterns hiện có trong features
- Không viết code trùng lặp

### 2. Tính năng mới phải:
- Đặt trong `src/features/{new-feature}/`
- Tuân thủ FSD structure
- Sử dụng components từ Shadcn UI khi có thể

### 3. Khi làm việc với features hiện có:
- Studio Upload: 3-step wizard (details → monetization → review)
- Watch: CinematicPlayer, CommentsSection, CreatorSection
- Wallet: CheckoutFeature, PaymentMethods, TopUpPackages
- Membership: MembershipTiers, JoinMembershipFeature
- Admin: Dashboard with tabs (users, content, finance, payouts)

### 4. Performance
- Sử dụng Next.js caching
- Lazy loading components khi cần
- Ảnh phải được optimize

## Environment Variables

```bash
NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000  # API Gateway
NEXT_REVALIDATE_SECRET=your-secret-here         # Cache revalidation
```

## Các file quan trọng

- `src/shared/utils/apiClient.ts` - API client với auth handling
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - Global styles
- `tailwind.config.ts` - Tailwind configuration
- `next.config.ts` - Next.js configuration

## Checklist trước khi commit

- [ ] Đã lint code (`npm run lint`)
- [ ] Code tuân thủ FSD
- [ ] Không dùng axios
- [ ] SSR cho static data
- [ ] Design system đúng (Crimson/Gold/Black/Ivory)
- [ ] No violet/purple colors
- [ ] Components được optimize
- [ ] Đã test functionality

## Lưu ý quan trọng

- Đây là dự án thực tế, không phải demo
- Code phải production-ready
- Tương thích với backend đã có
- UX/UI phải cao cấp, không "generic AI"
- Always assume users are using the app in production