# Studio Upload Service Boundary Design

## Goal

Move the resumable video upload implementation out of `features/watch` and into `features/studio-upload` without changing runtime behavior or public component APIs.

## Scope

- Move `src/features/watch/services/mediaService.upload.ts` to `src/features/studio-upload/services/resumableVideoUpload.ts`.
- Move its unit test to `src/features/studio-upload/services/resumableVideoUpload.test.ts`.
- Keep `mediaService.uploadResumableVideoFile` available from `src/features/watch/services/mediaService.ts` by importing the moved helpers from the new studio-upload service file.
- Keep upload-related types in `mediaService.types.ts` for now to avoid a wider type-export refactor.

## Non-Goals

- Do not split the full `mediaService` object in this change.
- Do not update studio UI components to import a new `studioUploadService` directly.
- Do not change backend API paths, request bodies, progress behavior, concurrency behavior, or upload cancellation behavior.

## Architecture

`features/studio-upload/services/resumableVideoUpload.ts` owns browser-side upload mechanics: file slicing, multipart presigned URL upload, progress tracking, concurrency, abort handling, and completion registration.

`features/watch/services/mediaService.ts` remains the facade that wires backend API functions into `createUploadResumableVideoFile`. Existing callers continue to use `mediaService` unchanged.

## Data Flow

The data flow stays the same:

1. UI calls `mediaService.initUpload`.
2. UI calls `mediaService.uploadResumableVideoFile`.
3. `mediaService.ts` passes API dependencies into `createUploadResumableVideoFile` from `features/studio-upload`.
4. The upload helper gets status, uploads pending parts, records completed parts, and completes the upload.

## Error Handling

Error behavior remains unchanged. Failed part uploads reject the upload promise, stop scheduling new parts, and prevent `completeUpload` from being called.

## Testing

Move the existing upload tests with the implementation. Keep the same behavioral coverage for session renewal, concurrency limit, failed part scheduling, and progress accounting.

## Verification

Run the moved upload unit test, TypeScript type-check, and ESLint on the moved implementation plus updated imports.
