# Studio Upload Service Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a focused `studioUploadService` for the upload wizard and move upload wizard components off the broad `mediaService` facade.

**Architecture:** `studioUploadService` lives in `features/studio-upload/services` and owns upload-wizard API calls plus presigned/multipart upload helpers. `mediaService` keeps backward-compatible methods by delegating upload-related members to `studioUploadService`.

**Tech Stack:** Next.js App Router, TypeScript, Jest, ESLint, existing `api` wrapper, native `XMLHttpRequest` upload flow.

## Global Constraints

- Do not change backend API paths, request bodies, response checks, upload concurrency, or error messages.
- Do not migrate studio-content draft actions in this step.
- Do not split channel, membership, admin, discovery, or playback services.
- Keep shared upload-related types in `features/watch/services/mediaService.types.ts` for this step.
- Do not add dependencies.

---

### Task 1: Add Studio Upload Service And Update Upload Wizard Callers

**Files:**
- Create: `src/features/studio-upload/services/studioUploadService.ts`
- Modify: `src/features/watch/services/mediaService.ts`
- Modify: `src/features/studio-upload/components/UploadStep1Details.tsx`
- Modify: `src/features/studio-upload/components/UploadStep3Review.tsx`

**Interfaces:**
- Consumes: existing `api`, `createUploadResumableVideoFile`, `uploadPresignedFile`, and upload-related types from `@/features/watch/services/mediaService.types`.
- Produces: `studioUploadService` with `initUpload`, `getPartUrls`, `completePart`, `getUploadStatus`, `completeUpload`, `renewUploadSession`, `submitUpload`, `cancelUpload`, `updateVideoMetadata`, `getMetadataSuggestions`, `uploadPresignedFile`, and `uploadResumableVideoFile`.

- [ ] **Step 1: Create `studioUploadService`**

Create `src/features/studio-upload/services/studioUploadService.ts` with methods copied from existing `mediaService` upload-wizard API calls, wired to `createUploadResumableVideoFile`.

- [ ] **Step 2: Delegate `mediaService` upload methods**

Import `studioUploadService` in `src/features/watch/services/mediaService.ts`. Replace upload-related method implementations with references to `studioUploadService` where possible, keeping the same property names.

- [ ] **Step 3: Update upload wizard components**

In `UploadStep1Details.tsx` and `UploadStep3Review.tsx`, replace `mediaService` imports/calls for upload wizard operations with `studioUploadService`. Keep type imports from `mediaService` only where required.

- [ ] **Step 4: Verify focused behavior**

Run: `npm test -- src/features/studio-upload/services/resumableVideoUpload.test.ts`

Expected: Jest passes the upload helper tests.

- [ ] **Step 5: Verify TypeScript and lint**

Run: `npm run type-check`

Expected: `tsc --noEmit` exits successfully.

Run: `npx eslint "src/features/studio-upload/services/studioUploadService.ts" "src/features/studio-upload/services/resumableVideoUpload.ts" "src/features/studio-upload/components/UploadStep1Details.tsx" "src/features/studio-upload/components/UploadStep3Review.tsx" "src/features/watch/services/mediaService.ts"`

Expected: ESLint exits successfully.

- [ ] **Step 6: Verify full Jest suite**

Run: `npm test`

Expected: All Jest suites pass.
