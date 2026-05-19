# Core Frontend Rules

This file contains the default engineering rules for frontend code. Use it for any task that creates or modifies application code.

## 1. Core Stack

The project uses:

- Next.js App Router
- TypeScript
- TailwindCSS
- Shadcn UI
- Native `fetch`

Mandatory rules:

- Do not use plain JavaScript when TypeScript is possible.
- Do not use `any` unless there is no safer type and the reason is clear.
- Do not use Axios.
- Do not add packages without a clear need.
- Prefer existing internal components and Shadcn UI primitives before creating new primitives.
- Use `lucide-react` for new icons by default; only use another icon package if Lucide cannot cover the need.
- Do not change `next.config`, `tsconfig`, Tailwind config, or major tooling unless the task requires it.

## 2. Feature-Based Architecture

The project follows Feature-based Architecture / Feature-Sliced Design style.

Recommended structure:

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

Rules:

- `src/app` is for routing, route-level layout, metadata, loading/error boundaries, and thin page composition.
- Do not put complex UI directly in `page.tsx`.
- A page should import the main feature component from `src/features/<feature-name>` when the UI is non-trivial.
- Put business-specific code in `src/features/<feature-name>`.
- Put truly reusable code in `src/shared`.
- Do not create `src/components` as a global dumping ground.
- Do not deep import from a feature if the feature already exposes an `index.ts` public API.
- Do not create a new feature when the logic belongs to an existing feature.

Preferred page pattern:

```tsx
import { WalletPage } from "@/features/wallet";

export default function Page() {
  return <WalletPage />;
}
```

## 3. Naming Conventions

- Feature folder: kebab-case or the current convention in the target feature.
- Component file: PascalCase.
- Types file: `<feature>.types.ts`.
- Constants file: `<feature>.constants.ts` or `<feature>.mock.ts`.
- Service file: `<feature>.service.ts`.
- Component names: PascalCase.
- Hooks: start with `use`.
- API/service functions: name by business action, not implementation detail.

Example:

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

## 4. SSR-First Rendering Strategy

Server Components are the default.

Use Server Components for:

- Pages and layouts.
- Header, footer, sidebar, and static shells without client interaction.
- Video detail and list pages with server-loaded initial data.
- Components that only render UI from props.
- SEO-critical content.

Use Client Components only when the component needs:

- `useState`, `useEffect`, or browser-dependent `useRef`.
- Event handlers such as `onClick`, `onChange`, or `onSubmit`.
- Browser APIs such as `window`, `document`, or `localStorage`.
- Interactive forms, modals, dropdowns, tabs, upload controls, or player controls.

Rules:

- Do not put `"use client"` in `page.tsx` unless there is no reasonable alternative.
- Push `"use client"` down to the smallest leaf component.
- Fetch initial data in Server Components when possible, then pass typed props to Client Components.
- Do not use `useEffect` only to fetch initial page data if the server can fetch it.
- Use `<Suspense fallback={...}>` where streaming/loading UI is appropriate.

## 5. Forms

- Prefer `next/form` for GET forms such as search and filters.
- Use Client Components for genuinely interactive forms.
- Do not make a form client-side only because it has an input.
- Validate input before calling APIs.

Example:

```tsx
import Form from "next/form";

export function SearchForm() {
  return (
    <Form action="/search">
      <input name="q" aria-label="Search" />
      <button type="submit">Search</button>
    </Form>
  );
}
```

## 6. API Integration

- All frontend API calls must go through the API Gateway.
- Gateway base URL comes from `NEXT_PUBLIC_GATEWAY_URL`.
- Use Native `fetch` or the project's existing API client/wrapper.
- Do not hardcode backend URLs.
- Do not call internal services directly from the frontend.
- Do not swallow API errors silently.
- Do not invent response fields. If UI needs a missing field, report the contract gap and provide a safe fallback option.

Auth rules:

- `accessToken` is returned in the response body and should be stored only in memory/context/state as appropriate.
- `refresh_token` is an `httpOnly` cookie and must never be exposed to JavaScript.
- Authenticated requests must include `credentials: "include"`.
- On 401: refresh once, retry the original request once, and fail with a clear auth error if refresh fails.
- Do not create infinite refresh loops.

Transactional rules:

- For money/coin/membership operations, follow `PRODUCT.md` idempotency rules.
- Do not generate `Idempotency-Key` for read-only GET requests.

## 7. TypeScript Rules

- Props must be typed.
- API responses must be typed.
- Shared constants/mock data should be typed when reused.
- Avoid large untyped objects.
- Prefer simple union types over enums unless the project already uses enums consistently.

Example:

```ts
export type DepositPackage = {
  id: string;
  name: string;
  price: number;
  bonusPercent: number;
};
```

## 8. Component Rules

Components should:

- Be small and focused.
- Have business-meaningful names.
- Receive explicit typed props.
- Separate repeated data from JSX.
- Use composition instead of mixing too many responsibilities.

Components should not:

- Fetch, manage state, and render a large layout all in one place.
- Use `"use client"` when they only render props.
- Contain long repeated mock lists directly inside JSX.
- Contain arbitrary magic numbers without a clear reason.

## 9. Loading, Empty, Error, Success States

Any UI backed by data should account for:

1. Loading: skeleton or relevant fallback.
2. Empty: clear message and CTA if the user can act.
3. Error: user-safe message, no stack trace, retry if applicable.
4. Success: normal data rendering.

Do not render a blank page on data failure.

Use `DESIGN.md` for visual specs of skeletons, empty states, and error states.

## 10. Accessibility

- Use `<button>` for actions, not clickable `<div>`.
- Use `<Link>` for navigation.
- Images need meaningful `alt` text unless decorative.
- Inputs need a `<label>` or `aria-label`.
- Icon-only buttons need `aria-label`.
- Do not remove focus states; use the project ring token.
- Maintain WCAG AA contrast.
- Touch targets should be at least 44x44px on mobile.

## 11. Image and Asset Rules

- Use `next/image` when appropriate.
- Keep internal assets in `public/` or the existing project convention.
- Do not hotlink unclear external images unless the task requires it.
- Do not replace important assets with random images.
- If source HTML references a missing image asset, note it clearly.

## 12. Security Rules

- Do not expose access tokens, refresh tokens, or secrets.
- Do not store refresh tokens in `localStorage` or `sessionStorage`.
- Do not log tokens.
- Do not hardcode secrets in frontend code.
- Do not use `dangerouslySetInnerHTML` unless required; if required, explain why and ensure the data is sanitized.
- Do not trust client data.
- Do not rely on UI-only auth checks for security.

## 13. API Contract Sync

When a UI needs a field that is not present in the API contract, state the gap clearly.

Example:

```txt
UI needs `creator.avatarUrl`, but the API contract does not show that field.
Options:
1. Backend adds the field.
2. Frontend uses a fallback avatar.
```

Never silently change or invent the response shape.

## 14. Planning Gate

A plan is required for:

- New features.
- Medium/large refactors.
- API contract changes.
- Rendering strategy changes.
- Architecture changes.

Small isolated fixes may be implemented directly.

A plan should cover:

1. Goal.
2. Files to create or modify.
3. Server/client boundary.
4. API/data involved.
5. Risks or confirmation points.

If the user says `code luôn`, `sửa trực tiếp`, `generate luôn`, or `không cần hỏi lại`, implement directly but still self-check relevant rules before finishing.

## 15. Git and Change Safety

- Do not edit unrelated files.
- Do not format the whole project for a scoped task.
- Do not change established conventions without reason.
- Do not delete code unless you are sure it is unused or the task requires it.
- Keep compatibility when possible during refactors.
- If changing a public feature API, report the impact.
- Never revert user changes unless explicitly requested.

## 16. Source of Truth

- Source code is the source of truth.
- Docs are navigation and context, not a replacement for reading relevant code.
- If docs and code disagree, inspect the code path and keep the change minimal.
