# Global Toast And Locked Channel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable global toast system, then use it to block locked-channel creators from entering Creator Studio while keeping them in viewer mode.

**Architecture:** Add a dependency-free toast provider in `src/shared/components/toast` and mount it once in `AppProviders`. Add a small studio access client component that checks the creator channel status via existing media APIs before navigation, and update the server studio guard to redirect locked creators out of `/studio`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, TailwindCSS, existing `api`/`fetchServerApi` wrappers, no new dependencies.

## Global Constraints

- Do not add packages; the project has no existing toast library and `CORE_RULES.md` says avoid new packages without clear need.
- Keep route files thin and place reusable UI under `src/shared`.
- Server Components remain default; use Client Components only for toast state and click interception.
- Authenticated client API calls must use existing `api` wrapper with `requireAuth: true` and `credentials: include` behavior.
- Locked-channel UX: creator is moved to viewer mode, cannot enter `/studio`, and sees a toast explaining that the channel was locked by admin.
- Do not commit changes unless the user explicitly requests it.

---

## File Structure

- Create `src/shared/components/toast/ToastProvider.tsx`: client provider, `useToast` hook, and viewport renderer.
- Create `src/shared/components/toast/index.ts`: public exports for the toast module.
- Modify `src/shared/providers/app-providers.tsx`: mount `ToastProvider` around the app.
- Create `src/features/studio-access/components/StudioAccessLink.tsx`: client link/button that checks `/api/media/me/channel` before navigating to `/studio` and shows toast on locked status.
- Create `src/features/studio-access/components/StudioRedirectToast.tsx`: reads URL query such as `studioBlocked=channel-locked`, shows toast once, and cleans the URL.
- Create `src/features/studio-access/index.ts`: public exports.
- Modify `src/components/layout/public/PublicHeaderAuthActions.tsx`: use `StudioAccessLink` for creator primary action.
- Modify `src/components/layout/main/TopNav.tsx`: use `StudioAccessLink` for creator studio nav entry.
- Modify `src/features/channel/components/ChannelHero.tsx`: render owner as viewer for locked channels and use `StudioAccessLink` for any owner Studio CTA.
- Modify `src/features/channel/components/ChannelPage.tsx`: pass locked owner state into channel UI if the API can identify it; otherwise preserve fallback behavior.
- Modify `src/shared/auth/server.ts`: extend `requireStudioAccess` to check creator channel status and redirect locked channels to `/channel/{id}?studioBlocked=channel-locked`, fallback `/library?studioBlocked=channel-locked`.

### Task 1: Global Toast Provider

**Files:**
- Create: `E:\doan\distributed_media_system\fe\src\shared\components\toast\ToastProvider.tsx`
- Create: `E:\doan\distributed_media_system\fe\src\shared\components\toast\index.ts`
- Modify: `E:\doan\distributed_media_system\fe\src\shared\providers\app-providers.tsx`

**Interfaces:**
- Produces: `ToastProvider`, `useToast()`, `toast({ title, description, variant, durationMs })`.
- Consumes: React client context only.

- [ ] **Step 1: Write the toast provider**

Create `src/shared/components/toast/ToastProvider.tsx`:

```tsx
"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";

type ToastVariant = "info" | "success" | "warning" | "error";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: number;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DURATION_MS = 4200;

const variantClassName: Record<ToastVariant, string> = {
  info: "border-border bg-card text-foreground",
  success: "border-emerald-500/35 bg-card text-foreground",
  warning: "border-secondary/45 bg-card text-foreground",
  error: "border-destructive/45 bg-card text-foreground",
};

const variantIcon: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: XCircle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts(current => current.filter(toastItem => toastItem.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;

    const nextToast: ToastItem = {
      ...input,
      id,
      variant: input.variant ?? "info",
    };

    setToasts(current => [...current.slice(-3), nextToast]);

    window.setTimeout(() => dismissToast(id), input.durationMs ?? DEFAULT_DURATION_MS);
  }, [dismissToast]);

  const value = useMemo(() => ({ toast, dismissToast }), [dismissToast, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-24 z-[90] flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3" role="region" aria-label="Thông báo">
        {toasts.map(toastItem => {
          const Icon = variantIcon[toastItem.variant];

          return (
            <div
              key={toastItem.id}
              role="status"
              className={`pointer-events-auto overflow-hidden rounded-lg border px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl ${variantClassName[toastItem.variant]}`}
            >
              <div className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-headline text-sm font-black tracking-tight text-foreground">{toastItem.title}</p>
                  {toastItem.description ? (
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{toastItem.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toastItem.id)}
                  className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Đóng thông báo"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
```

- [ ] **Step 2: Export the toast module**

Create `src/shared/components/toast/index.ts`:

```ts
export { ToastProvider, useToast } from "./ToastProvider";
```

- [ ] **Step 3: Mount the provider globally**

Modify `src/shared/providers/app-providers.tsx` so the provider wraps authenticated and route content:

```tsx
import { ToastProvider } from "@/shared/components/toast";
```

Wrap the existing provider body:

```tsx
<Suspense fallback={null}>
  <ToastProvider>
    <AuthProvider>{children}</AuthProvider>
  </ToastProvider>
</Suspense>
```

- [ ] **Step 4: Verify TypeScript**

Run: `npm run type-check`

Expected: exits with code 0 or only reports pre-existing unrelated errors. If toast files produce errors, fix them before moving to Task 2.

### Task 2: Locked Channel Studio Access Blocking

**Files:**
- Create: `E:\doan\distributed_media_system\fe\src\features\studio-access\components\StudioAccessLink.tsx`
- Create: `E:\doan\distributed_media_system\fe\src\features\studio-access\components\StudioRedirectToast.tsx`
- Create: `E:\doan\distributed_media_system\fe\src\features\studio-access\index.ts`
- Modify: `E:\doan\distributed_media_system\fe\src\shared\auth\server.ts`
- Modify: `E:\doan\distributed_media_system\fe\src\shared\providers\app-providers.tsx`
- Modify: `E:\doan\distributed_media_system\fe\src\components\layout\public\PublicHeaderAuthActions.tsx`
- Modify: `E:\doan\distributed_media_system\fe\src\components\layout\main\TopNav.tsx`
- Modify as needed: `E:\doan\distributed_media_system\fe\src\features\channel\components\ChannelHero.tsx`

**Interfaces:**
- Consumes: `useToast()` from Task 1, existing `api.get<MyChannelResponse>("/api/media/me/channel")` contract.
- Produces: `StudioAccessLink` that renders a link-like element and blocks navigation if `channel.status !== "active"`.
- Produces: `StudioRedirectToast` that shows a toast for `studioBlocked=channel-locked` query params.

- [ ] **Step 1: Add a StudioAccessLink client component**

Create `src/features/studio-access/components/StudioAccessLink.tsx`:

```tsx
"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "@/i18n/routing";
import { api, getErrorMessage } from "@/shared/api/client";
import { useToast } from "@/shared/components/toast";
import type { MyChannelResponse } from "@/features/watch/services/mediaService.types";

type StudioAccessLinkProps = {
  href?: string;
  className?: string;
  children: ReactNode;
  ariaCurrent?: "page";
};

const LOCKED_CHANNEL_MESSAGE = "Kênh của bạn đã bị quản trị viên khóa. Bạn không thể vào Creator Studio lúc này.";

function isLockedChannelStatus(status?: string | null) {
  return !!status && status.toLowerCase() !== "active";
}

export function StudioAccessLink({
  href = "/studio",
  className,
  children,
  ariaCurrent,
}: StudioAccessLinkProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    try {
      const response = await api.get<MyChannelResponse>("/api/media/me/channel", {
        requireAuth: true,
        suppressAuthRedirect: true,
      });

      if (isLockedChannelStatus(response.data?.status)) {
        toast({
          title: "Kênh đã bị khóa",
          description: LOCKED_CHANNEL_MESSAGE,
          variant: "warning",
        });
        return;
      }

      router.push(href);
    } catch (error) {
      toast({
        title: "Không thể kiểm tra trạng thái kênh",
        description: getErrorMessage(error, "Vui lòng thử lại sau."),
        variant: "error",
      });
    }
  };

  return (
    <a href={href} aria-current={ariaCurrent} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
```

- [ ] **Step 2: Add redirect toast component**

Create `src/features/studio-access/components/StudioRedirectToast.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "@/i18n/routing";
import { useToast } from "@/shared/components/toast";

const LOCKED_CHANNEL_MESSAGE = "Kênh của bạn đã bị quản trị viên khóa. Bạn đã được chuyển sang giao diện người xem.";

export function StudioRedirectToast() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const blockedReason = searchParams.get("studioBlocked");

  useEffect(() => {
    if (blockedReason !== "channel-locked") {
      return;
    }

    toast({
      title: "Kênh đã bị khóa",
      description: LOCKED_CHANNEL_MESSAGE,
      variant: "warning",
    });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("studioBlocked");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [blockedReason, pathname, router, searchParams, toast]);

  return null;
}
```

- [ ] **Step 3: Export studio access components**

Create `src/features/studio-access/index.ts`:

```ts
export { StudioAccessLink } from "./components/StudioAccessLink";
export { StudioRedirectToast } from "./components/StudioRedirectToast";
```

- [ ] **Step 4: Mount redirect toast globally**

Modify `src/shared/providers/app-providers.tsx`:

```tsx
import { StudioRedirectToast } from "@/features/studio-access";
```

Render it inside `ToastProvider`:

```tsx
<ToastProvider>
  <StudioRedirectToast />
  <AuthProvider>{children}</AuthProvider>
</ToastProvider>
```

- [ ] **Step 5: Use StudioAccessLink in public header**

Modify `src/components/layout/public/PublicHeaderAuthActions.tsx` to import `StudioAccessLink` and render it only for creator action:

```tsx
import { StudioAccessLink } from "@/features/studio-access";
```

Replace the primary action link branch:

```tsx
const PrimaryActionComponent = primaryAction.href === "/studio" ? StudioAccessLink : Link;

<PrimaryActionComponent href={primaryAction.href} className={actionButtonClassName}>
  <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.24)_45%,transparent_68%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  <span className="material-symbols-outlined relative text-[18px]" aria-hidden="true">
    {primaryAction.icon}
  </span>
  <span className="relative">{primaryAction.label}</span>
</PrimaryActionComponent>
```

- [ ] **Step 6: Use StudioAccessLink in main top navigation**

Modify `src/components/layout/main/TopNav.tsx` to import `StudioAccessLink`:

```tsx
import { StudioAccessLink } from "@/features/studio-access";
```

For `roleEntry` rendering, use `StudioAccessLink` when `roleEntry.path === "/studio"`; otherwise keep `Link`:

```tsx
const RoleEntryComponent = roleEntry.path === "/studio" ? StudioAccessLink : Link;

<RoleEntryComponent
  href={roleEntry.path!}
  ariaCurrent={pathname?.startsWith(roleEntry.path!) ? "page" : undefined}
  className={...}
>
  {t(roleEntry.label)}
</RoleEntryComponent>
```

- [ ] **Step 7: Update server studio guard**

Modify `src/shared/auth/server.ts` to fetch creator channel after role checks:

```ts
import { fetchServerApi } from "@/shared/api/server";
```

Add type and helper near `ServerUserProfile`:

```ts
type ServerMyChannel = {
  id: string;
  status: string;
};

function isLockedChannelStatus(status?: string | null) {
  return !!status && status.toLowerCase() !== "active";
}
```

Update `requireStudioAccess` after `canAccessStudio` succeeds:

```ts
  try {
    const channelResponse = await fetchServerApi<ServerMyChannel>("/api/media/me/channel", {
      headers: await getForwardedAuthHeaders(),
      cache: "no-store",
    });

    if (isLockedChannelStatus(channelResponse.data?.status)) {
      const channelId = channelResponse.data?.id;
      const targetPath = channelId
        ? `/channel/${encodeURIComponent(channelId)}?studioBlocked=channel-locked`
        : "/library?studioBlocked=channel-locked";
      redirect(targetPath);
    }
  } catch {
    redirect("/library?studioBlocked=channel-locked");
  }
```

If `fetchServerApi` cannot receive cookies automatically in this code path, add a small local helper in `server.ts` that forwards `Cookie` from `headers()` or `cookies().toString()`.

- [ ] **Step 8: Keep locked owners in viewer mode on channel UI**

Inspect `src/features/channel/components/ChannelHero.tsx`. If it shows owner management CTAs based only on `isOwner`, add an `isLockedOwner?: boolean` prop and treat `isOwner && !isLockedOwner` as the owner-management condition. If it shows a Creator Studio CTA, render `StudioAccessLink` so locked owners get toast instead of navigation.

Expected behavior:

```tsx
const canManageChannel = isOwner && !isLockedOwner;
```

- [ ] **Step 9: Verify behavior and types**

Run: `npm run type-check`

Expected: exits with code 0.

Run: `npm run lint`

Expected: exits with code 0 or only reports pre-existing unrelated lint issues. Fix touched-file lint issues before completion.

Manual checks in browser if dev server is available:

- Locked creator on `/studio`: redirected to `/channel/{channelId}?studioBlocked=channel-locked`, then toast appears and URL query is cleaned.
- Locked creator on viewer channel page clicks `Creator Studio`: stays on page and sees toast.
- Active creator clicks `Creator Studio`: navigates to `/studio`.
- Non-creator primary action still goes to onboarding.

## Self-Review

- Spec coverage: Task 1 adds global toast. Task 2 blocks locked creators from `/studio`, redirects direct studio access to viewer/fallback, and shows toast for both redirect and click attempts.
- Placeholder scan: no TBD/TODO placeholders remain.
- Type consistency: `StudioAccessLink`, `StudioRedirectToast`, `ToastProvider`, and `useToast` names match exports and consumers.
