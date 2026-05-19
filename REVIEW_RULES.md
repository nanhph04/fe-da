# Review and Self-Check Rules

Use this file for code review tasks, generated-code audits, and final self-checks for non-trivial code changes.

## 1. Review Scope

Review only the concerns related to the current task.

- UI task: design system, accessibility, responsive layout, loading/empty/error states, motion.
- API task: gateway usage, auth, credentials, refresh flow, error handling, API contract, product rules.
- SSR/rendering task: Server/Client boundary, hydration safety, Suspense/loading, initial data fetching.
- Performance task: bundle size, heavy imports, render cost, images/media, SSE cleanup, request efficiency.
- Refactor task: public API compatibility, import paths, naming, feature boundaries, behavior preservation.

Do not perform a full architecture review for a small isolated fix unless evidence shows wider impact.

## 2. Severity Levels

Classify findings clearly:

1. Critical: security issue, broken build, broken auth, data loss, payment/coin risk, invalid API contract, hydration crash.
2. Major: incorrect architecture boundary, unnecessary page-level Client Component, missing required state, inaccessible core action, serious performance regression.
3. Minor: naming, small duplication, style drift, local maintainability issue.
4. Suggestion: optional improvement outside required scope.

## 3. Architecture Checklist

- Is code placed in the correct feature/shared/app layer?
- Is `page.tsx` thin and route-focused?
- Is complex UI extracted into feature components?
- Are feature public exports used instead of deep imports when available?
- Was a new feature folder created only when justified?
- Were unrelated files left untouched?

## 4. Rendering and Hydration Checklist

- Is SSR/Server Component the default?
- Is `"use client"` only used at the smallest needed leaf?
- Is initial data fetched on the server when possible?
- Are browser APIs excluded from Server Components?
- Is there no direct SSR render of `Date.now()`, `Math.random()`, or uncontrolled locale formatting?
- Is HTML nesting valid?
- Are Suspense/loading boundaries used where appropriate?

## 5. API and Product Checklist

- Are API calls using Native `fetch` or the project wrapper, not Axios?
- Are calls routed through `NEXT_PUBLIC_GATEWAY_URL` or the existing gateway client?
- Are authenticated requests using `credentials: "include"`?
- Does 401 handling refresh once and retry once without infinite loops?
- Are errors surfaced instead of swallowed?
- Are response types explicit and aligned with the API contract?
- Are missing fields reported instead of invented?
- Are money/coin/membership actions using idempotency correctly?
- Are upload flows using presigned direct object-storage upload?
- Are video processing updates using SSE instead of polling?
- Are product flags such as membership/admin restrictions respected?

## 6. UI and Design Checklist

- Does the UI follow `DESIGN.md` Cinematic Canvas rules?
- Is dark mode the default and no unsupported light mode introduced?
- Are primary/accent colors based on design tokens, not hardcoded hex?
- Is purple/violet/fuchsia not used as the primary visual direction?
- Are card/container radii restrained (`rounded-sm`, `rounded-md`, `rounded-lg`) rather than overly rounded?
- Is glassmorphism limited to allowed fixed elements only?
- Are loading, empty, error, and success states represented when data-backed?
- Is motion limited to cheap properties and kept purposeful?

## 7. TypeScript and Component Checklist

- Are props typed?
- Are API responses typed?
- Is `any` avoided?
- Is repeated data extracted and typed when reused?
- Are components focused and named by business meaning?
- Is client state not lifted higher than necessary?
- Are constants and mock data not embedded as long repeated JSX blocks?

## 8. Accessibility and Security Checklist

- Are actions real `<button>` elements?
- Are navigations real `<Link>` elements?
- Do images have `alt` text?
- Do inputs have labels or `aria-label`?
- Do icon-only buttons have `aria-label`?
- Are focus states preserved?
- Do touch targets meet mobile minimums?
- Are tokens/secrets not logged or stored insecurely?
- Is `dangerouslySetInnerHTML` avoided or justified with sanitized data?
- Is auth not bypassed by UI-only checks?

## 9. Performance Checklist

- Is the client bundle kept small?
- Are heavy imports kept out of Client Components unless necessary?
- Are images optimized with `next/image` where appropriate?
- Are large lists using stable keys and reasonable render cost?
- Are stale requests handled for client-side querying?
- Are SSE/EventSource connections cleaned up?
- Are animations limited to transform, opacity, or light filters?

## 10. Final Response Expectations

For code changes, keep the final response concise and include:

```txt
Acting as: <role if relevant>

Changed:
- <path>: <what changed>

Verified:
- <command or reason not run>

Self-check:
- <relevant rule checks only>
```

Rules:

- Do not dump large files already written to disk unless the user asks.
- Reference changed paths clearly.
- Mention assumptions and skipped verification.
- Suggest only natural next steps, such as tests, build, or commit.

## 11. Review Output Template

For explicit review requests, return:

```txt
1. Critical issues
2. Major issues
3. Minor issues
4. Suggested refactor, if needed
5. Verification notes
```

If there are no issues in a category, say so briefly.

## 12. Prompt Template: Review Generated Code

```txt
Acting as: Code Review Engineer.

Review the generated code against project frontend rules.

Check:
- Feature-based architecture.
- Server/Client boundary and hydration safety.
- API gateway, auth, credentials, and API contract.
- Product rules from PRODUCT.md where relevant.
- Design system and accessibility.
- TypeScript types.
- Loading/error/empty/success states.
- Bundle and rendering performance.

Return:
1. Critical issues.
2. Major issues.
3. Minor issues.
4. Suggested refactor if needed.
5. Verification notes.
```

## 13. Prompt Template: Code Directly

```txt
Acting as: Senior Next.js Frontend Architect.

Code directly, no need to ask again.

Follow:
- AGENTS.md routing.
- CORE_RULES.md for architecture/code rules.
- DESIGN.md for UI work.
- PRODUCT.md for business flows.
- PERFORMANCE_RULES.md for rendering/performance-sensitive work.
- REVIEW_RULES.md for final self-check.
```
