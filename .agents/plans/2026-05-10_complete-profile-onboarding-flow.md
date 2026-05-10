# Complete Profile Onboarding Flow

> **Mục tiêu:** Chèn bước "Hoàn thiện hồ sơ" (`/onboarding/profile`) vào luồng sau đăng nhập, bắt buộc user phải có `displayName` trước khi vào app chính.

## 1. Bối cảnh & Vấn đề

### Luồng hiện tại

```
Register → Verify OTP → Auto Login → /library
Login (bình thường)   → /library
```

- Register chỉ thu thập `email` + `password`.
- Sau verify + auto-login, user vào `/library` với profile trống hoàn toàn (không displayName, không avatar, không bio).
- Trải nghiệm kém: comment/interaction hiện tên null, avatar trống.

### Luồng mới đề xuất

```
Register → Verify OTP → Auto Login ─┐
Login (bình thường)                  ├─→ fetchProfile() → displayName null? 
                                     │     YES → /onboarding/profile
                                     │     NO  → /library (hoặc trang trước đó)
                                     └─────────────────────────────────────────
```

---

## 2. Phân tích API Backend

### API đã có sẵn — KHÔNG cần sửa backend

| Nhu cầu | API | Response field |
|---------|-----|----------------|
| Lấy profile | `GET /api/user/users/profile` | `displayName`, `avatarUrl`, `bio`, `phone`, `gender`, `birthday` |
| Cập nhật profile | `PATCH /api/user/users/profile` | Trả về profile đã cập nhật |

### Cách derive flag "profile chưa hoàn thiện"

Backend không trả flag `profileCompleted` riêng, nhưng **không cần**. Khi user mới tạo tài khoản, các field optional sẽ là `null`:

```json
{
  "displayName": null,
  "avatarUrl": null,
  "bio": null
}
```

**Quy tắc FE:**

```ts
const isProfileIncomplete = !user.displayName;
```

`displayName` được chọn làm tiêu chí bắt buộc tối thiểu vì:
- Là identity cốt lõi hiển thị ở mọi nơi (comment, channel, membership).
- Các field khác (avatar, bio, phone) có thể bổ sung sau.

---

## 3. Thiết kế kỹ thuật

### 3.1 Điểm chặn (Guard) — Centralized trong `AuthContext`

Thay vì scatter logic redirect ở từng form, tập trung helper `getPostAuthRedirect` trong `AuthContext`:

```ts
// Trong AuthContext hoặc utility riêng
function getPostAuthRedirect(user: UserProfile): string {
  if (!user.displayName) return "/onboarding/profile";
  return "/library";
}
```

### 3.2 Các file cần sửa

#### A. Feature `auth` — Redirect logic

| File | Thay đổi | Chi tiết |
|------|----------|----------|
| `src/features/auth/context/AuthContext.tsx` | Thêm helper `isProfileIncomplete` + `getPostAuthRedirect()` | Export helper để các form dùng chung |
| `src/features/auth/components/VerifyOTPForm.tsx` | Dòng 73: thay `router.push("/library")` | Gọi `getPostAuthRedirect(profile)` để quyết định redirect |
| `src/features/auth/components/LoginForm.tsx` | Dòng 44: thay `router.push("/library")` | Tương tự — sau `setAuthData()`, kiểm tra profile rồi redirect |

#### B. Feature `onboarding` — Kết nối API thật

| File | Thay đổi | Chi tiết |
|------|----------|----------|
| `src/features/onboarding/components/CompleteProfileFeature.tsx` | Kết nối `authService.updateProfile()` | Thay mock `setTimeout` bằng API thật. Sau save thành công → `fetchProfile()` → `router.push("/library")` |

#### C. Route guard (optional nhưng khuyến nghị)

| File | Thay đổi | Chi tiết |
|------|----------|----------|
| `src/app/(main)/layout.tsx` | Thêm guard component | Nếu user đã login nhưng `displayName` null → redirect `/onboarding/profile`. Ngăn user bypass bằng cách gõ URL trực tiếp |

---

## 4. Chi tiết Implementation

### Phase 1: AuthContext — Thêm helper

**File:** `src/features/auth/context/AuthContext.tsx`

**Thay đổi:**

1. Thêm computed property `isProfileIncomplete` vào context value:

```ts
interface AuthContextProps {
  // ... existing
  isProfileIncomplete: boolean;
  getPostAuthRedirect: () => string;
}
```

2. Implement:

```ts
const isProfileIncomplete = !!user && !user.displayName;

const getPostAuthRedirect = () => {
  if (!user) return "/login";
  if (!user.displayName) return "/onboarding/profile";
  return "/library";
};
```

3. Thêm vào Provider value.

---

### Phase 2: VerifyOTPForm — Smart redirect sau register

**File:** `src/features/auth/components/VerifyOTPForm.tsx`

**Dòng 70-73 hiện tại:**

```ts
if (loginRes.success && loginRes.data?.accessToken) {
  sessionStorage.removeItem("pendingVerify");
  await setAuthData(loginRes.data.accessToken);
  router.push("/library");  // ← Sửa dòng này
}
```

**Sửa thành:**

```ts
if (loginRes.success && loginRes.data?.accessToken) {
  sessionStorage.removeItem("pendingVerify");
  const profile = await setAuthData(loginRes.data.accessToken);
  // Redirect dựa trên trạng thái profile
  const redirectTo = profile && !profile.displayName 
    ? "/onboarding/profile" 
    : "/library";
  router.push(redirectTo);
}
```

> **Lưu ý:** `setAuthData()` hiện tại đã return `UserProfile | null` (xem AuthContext dòng 55-62), nên ta dùng trực tiếp return value.

---

### Phase 3: LoginForm — Smart redirect sau login

**File:** `src/features/auth/components/LoginForm.tsx`

**Dòng 42-44 hiện tại:**

```ts
if (res.success && res.data?.accessToken) {
  await setAuthData(res.data.accessToken);
  router.push("/library");  // ← Sửa dòng này
}
```

**Sửa thành:**

```ts
if (res.success && res.data?.accessToken) {
  const profile = await setAuthData(res.data.accessToken);
  const redirectTo = profile && !profile.displayName 
    ? "/onboarding/profile" 
    : "/library";
  router.push(redirectTo);
}
```

---

### Phase 4: CompleteProfileFeature — Kết nối API thật

**File:** `src/features/onboarding/components/CompleteProfileFeature.tsx`

**Thay đổi chính:**

1. Import `useAuth` và `authService`.
2. Thay `useState` form state bằng `react-hook-form` + `zod` validation (consistent với auth forms).
3. Submit handler gọi `authService.updateProfile()` thay vì mock `setTimeout`.
4. Sau save thành công → `fetchProfile()` (refresh AuthContext) → `router.push("/library")`.
5. "Skip for now" → set displayName mặc định (từ email prefix) hoặc redirect thẳng `/library` (tùy yêu cầu nghiệp vụ).

**Logic submit mới:**

```ts
const { fetchProfile } = useAuth();
const router = useRouter();

const handleSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  try {
    const res = await authService.updateProfile({
      displayName: data.displayName,
      bio: data.bio || undefined,
      phone: data.phone ? Number(data.phone) : undefined,
      birthday: data.birthday || undefined,
    });
    if (res.success) {
      await fetchProfile(); // Refresh AuthContext
      router.push("/library");
    }
  } catch (err) {
    setServerError(getErrorMessage(err, "Failed to update profile"));
  } finally {
    setIsSubmitting(false);
  }
};
```

**"Skip for now" decision:**

| Option | Hành vi | Hệ quả |
|--------|---------|---------|
| A. Cho skip tự do | `router.push("/library")` | User vào app với displayName null. Cần handle null displayName ở mọi nơi hiển thị |
| B. Bắt buộc displayName | Disable nút Skip, chỉ cho submit khi có displayName | UX chặt hơn nhưng đảm bảo data integrity |
| **C. Skip = set default** (khuyến nghị) | Set `displayName` = email prefix (phần trước @) rồi redirect | User vẫn có identity tạm, có thể sửa sau ở profile page |

> ⚠️ **Cần xác nhận:** Bạn muốn chọn option nào cho nút "Skip"?

---

### Phase 5: Route Guard (main layout)

**File:** `src/app/(main)/layout.tsx`

Thêm Client Component wrapper để guard:

```tsx
// src/components/guards/ProfileGuard.tsx
"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user && !user.displayName) {
      router.replace("/onboarding/profile");
    }
  }, [isAuthenticated, user, isLoading, router, pathname]);

  return <>{children}</>;
}
```

**Cập nhật `(main)/layout.tsx`:**

```tsx
import { ProfileGuard } from "@/components/guards/ProfileGuard";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="...">
      <TopNav />
      <SideNav />
      <ProfileGuard>
        {children}
      </ProfileGuard>
      <MobileNav />
    </div>
  );
}
```

> **Lưu ý:** Guard chỉ redirect khi user `isAuthenticated` mà `displayName` null. Guest vẫn xem landing/public bình thường.

---

## 5. Edge Cases & Xử lý

| Case | Xử lý |
|------|--------|
| User gõ `/library` trực tiếp khi chưa có displayName | `ProfileGuard` redirect về `/onboarding/profile` |
| User refresh trang `/onboarding/profile` | `CompleteProfileFeature` kiểm tra auth, nếu chưa login → redirect `/login` |
| User đã có displayName nhưng vào `/onboarding/profile` | Cho phép — user có thể muốn cập nhật thêm info. Hoặc redirect về `/library` nếu muốn chặt hơn |
| User login trên thiết bị mới, profile đã hoàn thiện | `getPostAuthRedirect` → `/library` (bình thường) |
| API updateProfile thất bại | Hiện error message, giữ nguyên trang, cho retry |
| Network error khi fetchProfile sau login | Fallback: redirect `/library` (graceful degradation) |

---

## 6. File Tree tổng kết

```
src/
  features/
    auth/
      context/
        AuthContext.tsx            ← [MODIFY] Thêm isProfileIncomplete, getPostAuthRedirect
      components/
        LoginForm.tsx              ← [MODIFY] Smart redirect dòng 44
        VerifyOTPForm.tsx          ← [MODIFY] Smart redirect dòng 73
    onboarding/
      components/
        CompleteProfileFeature.tsx  ← [MODIFY] Kết nối API thật
  components/
    guards/
      ProfileGuard.tsx             ← [NEW] Route guard component
  app/
    (main)/
      layout.tsx                   ← [MODIFY] Wrap children với ProfileGuard
```

---

## 7. Verification Plan

### Automated Tests

- [ ] Unit test `getPostAuthRedirect`: displayName null → `/onboarding/profile`, có displayName → `/library`
- [ ] Unit test `ProfileGuard`: mock user với displayName null → verify router.replace được gọi

### Manual Testing

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Register mới → Verify OTP → Auto login | Redirect `/onboarding/profile` |
| 2 | Điền displayName → Save | Redirect `/library` |
| 3 | Login lại (đã có displayName) | Redirect `/library` trực tiếp |
| 4 | Login lại (chưa có displayName, ví dụ skip lần trước) | Redirect `/onboarding/profile` |
| 5 | Gõ URL `/library` trực tiếp khi chưa có displayName | Guard redirect về `/onboarding/profile` |
| 6 | Nhấn "Skip for now" | Tùy option chọn (A/B/C ở Phase 4) |

---

## 8. Open Questions

> [!IMPORTANT]
> **Q1:** Nút "Skip for now" xử lý thế nào?
> - **(A)** Cho skip tự do, user vào app với displayName null
> - **(B)** Bắt buộc displayName, disable/ẩn nút Skip
> - **(C)** Skip = tự set displayName = email prefix (phần trước @), redirect /library
>
> Khuyến nghị: **Option C** — đảm bảo mọi user luôn có displayName mà không gây friction.

> [!IMPORTANT]
> **Q2:** Khi user đã hoàn thiện profile rồi nhưng chủ động vào `/onboarding/profile`, cho phép edit hay redirect về `/library`?
>
> Khuyến nghị: **Cho phép edit** — user có thể muốn đổi displayName/avatar sau.

> [!IMPORTANT]
> **Q3:** Guard có áp dụng cho cả route `/studio/*` không? (Creator cũng cần displayName trước khi upload video)
>
> Khuyến nghị: **Có** — thêm `ProfileGuard` vào cả `studio/layout.tsx`. Creator cần identity rõ ràng.

---

## 9. Thứ tự thực hiện

| Bước | Task | Độ phức tạp | Phụ thuộc |
|------|------|-------------|-----------|
| 1 | Thêm helper vào `AuthContext` | Thấp | — |
| 2 | Sửa redirect trong `VerifyOTPForm` | Thấp | Bước 1 |
| 3 | Sửa redirect trong `LoginForm` | Thấp | Bước 1 |
| 4 | Kết nối API thật cho `CompleteProfileFeature` | Trung bình | Bước 1 |
| 5 | Tạo `ProfileGuard` + cập nhật layout | Thấp | Bước 1 |
| 6 | Test manual toàn luồng | — | Bước 2-5 |
