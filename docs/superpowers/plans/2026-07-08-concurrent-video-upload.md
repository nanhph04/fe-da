# Concurrent Video Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change resumable raw video upload from sequential part upload to bounded concurrent part upload.

**Architecture:** Keep the existing resumable upload API and backend contract. Replace the frontend sequential loop in `createUploadResumableVideoFile` with a small worker pool that uploads pending parts concurrently, tracks per-part progress safely, and calls `completeUpload` only after all workers succeed.

**Tech Stack:** TypeScript, Jest, browser `XMLHttpRequest`, existing frontend API service layer.

## Global Constraints

- Do not stream media through the Node.js backend; upload media directly to object storage with presigned URLs.
- Do not add packages.
- Preserve resumable upload behavior by calling `getUploadStatus` before uploading pending parts.
- Preserve existing backend API contract.
- Default upload concurrency is 4 and must be bounded.
- Progress must not exceed 100 and must not double-count bytes from parallel XHR progress events.

---

### Task 1: Add Failing Concurrency Tests

**Files:**
- Modify: `src/features/watch/services/mediaService.upload.test.ts`

**Interfaces:**
- Consumes: `createUploadResumableVideoFile(uploadApi)` from `src/features/watch/services/mediaService.upload.ts`
- Produces: Tests that require concurrent uploading and safe progress updates.

- [ ] **Step 1: Replace the existing mock XHR with a controllable mock**

```ts
const pendingRequests: MockXMLHttpRequest[] = [];

class MockXMLHttpRequest {
  status = 200;
  upload: { onprogress?: (event: ProgressEvent) => void } = {};
  onload?: () => void;
  onerror?: () => void;
  onabort?: () => void;

  open = jest.fn();
  setRequestHeader = jest.fn();
  getResponseHeader = jest.fn(() => `"etag-${pendingRequests.length + 1}"`);
  abort = jest.fn(() => {
    this.onabort?.();
  });
  send = jest.fn(() => {
    pendingRequests.push(this);
  });

  progress(loaded: number, total: number): void {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded,
      total,
    } as ProgressEvent);
  }

  succeed(etag = `etag-${pendingRequests.indexOf(this) + 1}`): void {
    this.getResponseHeader = jest.fn(() => `"${etag}"`);
    this.onload?.();
  }
}
```

- [ ] **Step 2: Add a test that proves concurrency is bounded and greater than 1**

```ts
it('uploads pending parts concurrently up to the configured concurrency', async () => {
  const uploadApi = createUploadApi({ totalParts: 5 });
  const upload = createUploadResumableVideoFile(uploadApi);

  const uploadPromise = upload({
    videoId: 'video-1',
    uploadId: 'upload-1',
    file: new File([
      new Uint8Array(1024),
      new Uint8Array(1024),
      new Uint8Array(1024),
      new Uint8Array(1024),
      new Uint8Array(1024),
    ], 'video.mp4'),
    partSizeBytes: 1024,
    concurrency: 3,
  });

  await Promise.resolve();
  await Promise.resolve();

  expect(pendingRequests).toHaveLength(3);
  expect(uploadApi.getPartUrls).toHaveBeenNthCalledWith(1, 'video-1', 'upload-1', [1]);
  expect(uploadApi.getPartUrls).toHaveBeenNthCalledWith(2, 'video-1', 'upload-1', [2]);
  expect(uploadApi.getPartUrls).toHaveBeenNthCalledWith(3, 'video-1', 'upload-1', [3]);

  pendingRequests[0].progress(1024, 1024);
  pendingRequests[0].succeed('etag-1');
  await Promise.resolve();
  await Promise.resolve();

  expect(pendingRequests).toHaveLength(4);
  expect(uploadApi.getPartUrls).toHaveBeenNthCalledWith(4, 'video-1', 'upload-1', [4]);

  for (let index = 1; index < pendingRequests.length; index += 1) {
    const request = pendingRequests[index];
    request.progress(1024, 1024);
    request.succeed();
    await Promise.resolve();
  }

  await uploadPromise;
  expect(uploadApi.completeUpload).toHaveBeenCalledWith('video-1', 'upload-1');
});
```

- [ ] **Step 3: Add a test for progress without double-counting parallel XHR events**

```ts
it('tracks progress from parallel parts without double-counting loaded bytes', async () => {
  const onProgress = jest.fn();
  const uploadApi = createUploadApi({ totalParts: 2 });
  const upload = createUploadResumableVideoFile(uploadApi);

  const uploadPromise = upload({
    videoId: 'video-1',
    uploadId: 'upload-1',
    file: new File([new Uint8Array(1024), new Uint8Array(1024)], 'video.mp4'),
    partSizeBytes: 1024,
    concurrency: 2,
    onProgress,
  });

  await Promise.resolve();
  await Promise.resolve();

  pendingRequests[0].progress(512, 1024);
  pendingRequests[1].progress(512, 1024);
  pendingRequests[0].progress(1024, 1024);

  expect(onProgress).toHaveBeenLastCalledWith(75);

  pendingRequests[0].succeed('etag-1');
  pendingRequests[1].progress(1024, 1024);
  pendingRequests[1].succeed('etag-2');

  await uploadPromise;
  expect(onProgress).toHaveBeenLastCalledWith(100);
});
```

- [ ] **Step 4: Run test to verify failure**

Run: `npm test -- src/features/watch/services/mediaService.upload.test.ts`

Expected: FAIL because `concurrency` is not typed and implementation is sequential.

---

### Task 2: Implement Bounded Concurrent Upload

**Files:**
- Modify: `src/features/watch/services/mediaService.types.ts`
- Modify: `src/features/watch/services/mediaService.upload.ts`
- Test: `src/features/watch/services/mediaService.upload.test.ts`

**Interfaces:**
- Consumes: Existing upload API methods `getUploadStatus`, `getPartUrls`, `completePart`, `completeUpload`, `renewUploadSession`.
- Produces: `UploadResumableParams.concurrency?: number` and concurrent `uploadResumableVideoFile` behavior.

- [ ] **Step 1: Add optional concurrency to upload params**

```ts
export interface UploadResumableParams {
  videoId: string;
  uploadId: string;
  file: File;
  partSizeBytes: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
  renewBeforeExpiryMs?: number;
  concurrency?: number;
}
```

- [ ] **Step 2: Add constants and safe concurrency normalization**

```ts
const DEFAULT_UPLOAD_CONCURRENCY = 4;

const normalizeConcurrency = (value?: number) => {
  if (!Number.isFinite(value) || !value || value < 1) {
    return DEFAULT_UPLOAD_CONCURRENCY;
  }

  return Math.floor(value);
};
```

- [ ] **Step 3: Replace sequential upload loop with worker pool**

```ts
const activePartLoadedBytes = new Map<number, number>();

const uploadOnePart = async (partNumber: number) => {
  if (signal?.aborted) {
    throw createAbortError();
  }

  await renewIfNeeded();
  const urlRes = await uploadApi.getPartUrls(videoId, uploadId, [partNumber]);
  if (!urlRes.success || !urlRes.data?.parts?.length) {
    throw new Error(urlRes.message || `Failed to get upload URL for part ${partNumber}`);
  }

  const partInfo = urlRes.data.parts.find(part => part.partNumber === partNumber);
  if (!partInfo) {
    throw new Error(`Upload URL for part ${partNumber} not found in response`);
  }

  const startByte = (partNumber - 1) * partSizeBytes;
  const endByte = Math.min(partNumber * partSizeBytes, fileSize);
  const chunk = file.slice(startByte, endByte);

  const etag = await uploadChunk({
    uploadUrl: partInfo.uploadUrl,
    chunk,
    partNumber,
    signal,
    onProgress: loadedBytes => {
      activePartLoadedBytes.set(partNumber, loadedBytes);
      updateProgress();
    },
  });

  activePartLoadedBytes.delete(partNumber);
  uploadedBytes += chunk.size;
  updateProgress();

  await renewIfNeeded();
  const completedRes = await uploadApi.completePart(videoId, uploadId, partNumber, {
    etag,
    sizeBytes: chunk.size,
  });

  if (!completedRes.success) {
    throw new Error(completedRes.message || `Failed to register completion of part ${partNumber}`);
  }
};

let nextPartIndex = 0;
let hasUploadFailed = false;
const workerCount = Math.min(normalizeConcurrency(concurrency), partsToUpload.length);
const workers = Array.from({ length: workerCount }, async () => {
  while (!hasUploadFailed && nextPartIndex < partsToUpload.length) {
    const partNumber = partsToUpload[nextPartIndex];
    nextPartIndex += 1;
    try {
      await uploadOnePart(partNumber);
    } catch (err) {
      hasUploadFailed = true;
      throw err;
    }
  }
});

await Promise.all(workers);
```

- [ ] **Step 4: Run focused tests**

Run: `npm test -- src/features/watch/services/mediaService.upload.test.ts`

Expected: PASS.

---

### Task 3: Verify Type Safety

**Files:**
- Verify: `src/features/watch/services/mediaService.upload.ts`
- Verify: `src/features/watch/services/mediaService.types.ts`

**Interfaces:**
- Consumes: completed Task 2 implementation.
- Produces: verified TypeScript compatibility.

- [ ] **Step 1: Run type-check**

Run: `npm run type-check`

Expected: PASS with no TypeScript errors.

- [ ] **Step 2: If type-check fails, fix only upload-related type errors**

Keep edits limited to `mediaService.upload.ts`, `mediaService.types.ts`, and upload tests.

---

## Self-Review

- Spec coverage: plan covers FE-only concurrency, backend contract preservation, resume, progress, bounded worker count, and verification.
- Placeholder scan: no placeholders remain.
- Type consistency: `concurrency?: number` is added to `UploadResumableParams` and consumed in `createUploadResumableVideoFile`.
