<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project may use a newer Next.js version with breaking changes. APIs, conventions, and file structure may differ from older knowledge.

Before writing or modifying code, the AI must:

- Read relevant guides in `node_modules/next/dist/docs/` when needed.
- Respect current project structure and conventions.
- Heed deprecation notices.
- Avoid outdated Next.js patterns unless the project already uses them intentionally.

<!-- END:nextjs-agent-rules -->

# Agent Rule Router

`AGENTS.md` is the navigation entry point only. Do not keep full project rules here. Load the smallest relevant rule files for the task, then follow source code conventions.

## Rule Map

| File | Source of truth for | Read when |
|------|---------------------|-----------|
| `CORE_RULES.md` | Architecture, stack, SSR-first, API integration, forms, TypeScript, components, accessibility, security, change safety | Any task that creates or modifies frontend code |
| `PERFORMANCE_RULES.md` | Rendering performance, hydration safety, client bundle, images/media, API efficiency, SSE/upload behavior, animation cost | Performance work, SSR/client boundary work, heavy lists, media/player/upload/SSE, or suspected hydration issues |
| `REVIEW_RULES.md` | Review checklist, self-check rules, severity levels, final response expectations | Code review tasks, generated-code audits, and final self-check for non-trivial changes |
| `DESIGN.md` | Cinematic Canvas design system, colors, typography, spacing, components, motion, loading/error/empty state visuals | UI, visual, layout, motion, theming, responsive, or accessibility-contrast changes |
| `PRODUCT.md` | Product/business context, roles, workflows, video lifecycle, wallet/membership rules, SSE/upload business behavior | Business flow changes, API contract decisions, wallet/membership/video/upload/search/admin behavior |

## Routing Rules

- Start with this file, then open only the relevant linked files.
- For any code change, apply `CORE_RULES.md`; read the specific section needed instead of scanning everything.
- For UI changes, apply `DESIGN.md` in addition to `CORE_RULES.md`.
- For performance, hydration, media, upload, SSE, or bundle work, apply `PERFORMANCE_RULES.md`.
- For product-sensitive flows, apply the relevant section of `PRODUCT.md`; do not invent business rules or API fields.
- For review tasks or substantial generated code, apply `REVIEW_RULES.md`.
- If rules conflict, priority is: explicit user request -> source code/API contract -> `PRODUCT.md` business rules -> `DESIGN.md` visual rules -> `CORE_RULES.md`/`PERFORMANCE_RULES.md`/`REVIEW_RULES.md` -> this router.

## Context Efficiency

- Do not reload full docs when a section is enough.
- Do not scan the whole repo before checking route, feature name, API endpoint, or import chain.
- Expand impact analysis gradually: direct file -> direct imports -> related API/DTO/event -> wider dependencies only with evidence.
- Keep changes minimal and stop when the requested task, relevant verification, and direct self-check are complete.

## Expert Routing

Use explicit role framing only for feature work, medium/large refactors, architecture review, performance optimization, complex API integration, or formal review.

Common roles:

- `Senior Next.js Frontend Architect`
- `Senior UI Engineer`
- `Frontend Performance Engineer`
- `API Integration Engineer`
- `Code Review Engineer`

Small fixes do not need full role switching.

## Next.js Safety

- Treat Server Components and SSR as the default until `CORE_RULES.md` says a Client Component is needed.
- Read `node_modules/next/dist/docs/` when touching APIs that may have changed in the current Next.js version.
- Do not use outdated App Router patterns unless the codebase already uses them intentionally.

## Stop Conditions

Stop when:

- The requested task is complete.
- The main flow works or the relevant static check/build passes.
- No direct issue remains in the touched scope.

Do not continue with unrelated refactors, formatting, renames, or architecture improvements unless explicitly requested.
