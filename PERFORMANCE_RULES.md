# Performance, Rendering, and Hydration Rules

Use this file when work touches performance, SSR/client boundaries, media playback, uploads, SSE, large lists, images, data-fetching efficiency, or hydration safety.

## 1. SSR and Client Boundary

- Keep pages and layouts as Server Components by default.
- Do not turn an entire page into a Client Component for one interactive widget.
- Move `"use client"` to the smallest component that needs browser state or events.
- Fetch initial data on the server when possible.
- Pass typed serializable props from Server Components to Client Components.
- Use dynamic import for heavy client-only components that do not need SSR.

## 2. Hydration Safety

Avoid hydration mismatches:

- Do not render `Date.now()` directly during SSR.
- Do not render `Math.random()` directly during SSR.
- Do not format dates with uncontrolled locale/timezone differences between server and client.
- Do not access `window`, `document`, or `localStorage` in Server Components.
- Do not branch rendered markup with `typeof window !== "undefined"` if it changes the initial HTML.
- Do not create invalid HTML nesting.
- Do not let browser extensions or client-only state affect the initial render.

If data is client-only, isolate it in a Client Component and render a stable fallback first.

## 3. Client Bundle Discipline

- Avoid large dependencies in Client Components.
- Prefer existing lightweight utilities over new packages.
- Do not import server-only modules into client files.
- Do not place large mock data inside render functions.
- Keep client state local to the smallest needed subtree.
- Split rarely used heavy UI with dynamic import when appropriate.

## 4. Data Fetching Performance

- Do not use `useEffect` for initial page data when a Server Component can fetch it.
- Do not duplicate the same fetch across sibling components when data can be loaded once and passed down.
- Use project fetch wrappers when they exist so auth, refresh, and error handling stay consistent.
- Normalize errors and render user-safe fallback states.
- For search/filter UI, prefer URL/search params and `next/form` for GET flows.
- Debounce high-frequency client queries when immediate server navigation is not appropriate.
- Cancel or ignore stale client requests to prevent race-condition UI bugs.

## 5. API Efficiency and Product Constraints

- Do not poll with `setInterval` for video processing state; use SSE as required by `PRODUCT.md`.
- Close `EventSource` connections on unmount or route change.
- For transactional money/coin/membership actions, reuse the same `Idempotency-Key` for retries of the same user action.
- Do not generate `Idempotency-Key` for GET requests.
- Disable or lock action buttons immediately during pending transactional requests.
- Do not call view-count APIs before the product-defined watch threshold.

## 6. Media, Upload, and Player Rules

- Upload media directly to object storage with a presigned URL; do not stream media through the Node.js backend.
- Keep upload controls and player controls as client leaf components.
- Use HLS/adaptive playback behavior according to the existing player implementation.
- Use `next/image` for thumbnails and static media when appropriate.
- Preserve 16:9 thumbnail ratios from `DESIGN.md`.
- Lazy-load below-the-fold media when it does not hurt UX.

## 7. Lists and Rendering Cost

- Use stable keys from data IDs, not array indexes, when list ordering can change.
- Avoid creating unnecessary objects/functions inside very large list renders.
- Extract repeated card data/constants outside render when reused.
- Consider pagination, infinite loading, or virtualization only when the data volume justifies it.
- Do not add memoization everywhere; use it for measured or obvious expensive subtrees.

## 8. Animation Performance

Animate cheap properties only:

```txt
Allowed: transform, opacity, light filter usage
Avoid: width, height, margin, padding, top, left
```

Rules:

- Prefer CSS transitions for simple hover/focus/mount motion.
- Do not use JavaScript animation for simple UI effects.
- Avoid overusing `animate-spin` and `animate-pulse`.
- Keep motion subtle and purposeful according to `DESIGN.md`.

## 9. Verification

Use the smallest relevant verification:

- Type-related change: run typecheck if available.
- Rendering or build-risk change: run the relevant build/check command.
- Performance/hydration fix: verify the route and any changed server/client boundary.
- If a command cannot be run, state why and provide manual verification steps.

Stop after the relevant checks pass; do not continue with unrelated optimization.
