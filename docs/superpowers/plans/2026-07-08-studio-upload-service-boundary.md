# Studio Upload Service Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the resumable upload helper out of `features/watch` and into `features/studio-upload` without changing caller APIs or upload behavior.

**Architecture:** `features/studio-upload/services/resumableVideoUpload.ts` owns browser-side upload mechanics. `features/watch/services/mediaService.ts` remains a facade that wires media API functions into the moved upload helper so existing callers keep using `mediaService.uploadResumableVideoFile`.

**Tech Stack:** Next.js App Router, TypeScript, Jest, ESLint, existing `api` wrapper and native `XMLHttpRequest` upload flow.

## Global Constraints

- Do not change backend API paths, request/response shapes, progress behavior, concurrency behavior, or cancellation behavior.
- Do not split the full `mediaService` object in this change.
- Do not update studio UI components to import a new service directly.
- Keep upload-related types in `src/features/watch/services/mediaService.types.ts` for now.
- Do not add dependencies.

---

### Task 1: Move Resumable Upload Helper To Studio Upload

**Files:**
- Create: `src/features/studio-upload/services/resumableVideoUpload.ts`
- Create: `src/features/studio-upload/services/resumableVideoUpload.test.ts`
- Modify: `src/features/watch/services/mediaService.ts`
- Delete: `src/features/watch/services/mediaService.upload.ts`
- Delete: `src/features/watch/services/mediaService.upload.test.ts`

**Interfaces:**
- Consumes: `CompletePartBody`, `CompletePartResponse`, `CompleteUploadResponse`, `GetPartUrlsResponse`, `RenewUploadSessionResponse`, `UploadRawVideoFileRequest`, `UploadResumableParams`, `UploadStatusResponse` from `@/features/watch/services/mediaService.types`.
- Produces: `createUploadResumableVideoFile(uploadApi: ResumableUploadApi): (params: UploadResumableParams) => Promise<void>` and `uploadPresignedFile(params: UploadRawVideoFileRequest): Promise<void>` from `@/features/studio-upload/services/resumableVideoUpload`.

- [ ] **Step 1: Move the implementation file**

Create `src/features/studio-upload/services/resumableVideoUpload.ts` with the existing implementation from `src/features/watch/services/mediaService.upload.ts`, changing only the type import path from relative watch types to the absolute watch service type module:

```ts
import type { ApiResponse } from "@/shared/api/types";
import type {
  CompletePartBody,
  CompletePartResponse,
  CompleteUploadResponse,
  GetPartUrlsResponse,
  RenewUploadSessionResponse,
  UploadRawVideoFileRequest,
  UploadResumableParams,
  UploadStatusResponse,
} from "@/features/watch/services/mediaService.types";
```

- [ ] **Step 2: Move the test file**

Create `src/features/studio-upload/services/resumableVideoUpload.test.ts` with the existing test body from `src/features/watch/services/mediaService.upload.test.ts`, changing the import to:

```ts
import { createUploadResumableVideoFile } from './resumableVideoUpload';
```

- [ ] **Step 3: Update the media service facade import**

In `src/features/watch/services/mediaService.ts`, replace:

```ts
import { createUploadResumableVideoFile, uploadPresignedFile } from "./mediaService.upload";
```

with:

```ts
import { createUploadResumableVideoFile, uploadPresignedFile } from "@/features/studio-upload/services/resumableVideoUpload";
```

- [ ] **Step 4: Remove old watch upload files**

Delete `src/features/watch/services/mediaService.upload.ts` and `src/features/watch/services/mediaService.upload.test.ts` after the moved files exist.

- [ ] **Step 5: Verify moved test path**

Run: `npm test -- src/features/studio-upload/services/resumableVideoUpload.test.ts`

Expected: Jest passes the 4 upload tests.

- [ ] **Step 6: Verify TypeScript and lint**

Run: `npm run type-check`

Expected: `tsc --noEmit` exits successfully.

Run: `npx eslint "src/features/studio-upload/services/resumableVideoUpload.ts" "src/features/studio-upload/services/resumableVideoUpload.test.ts" "src/features/watch/services/mediaService.ts"`

Expected: ESLint exits successfully.
