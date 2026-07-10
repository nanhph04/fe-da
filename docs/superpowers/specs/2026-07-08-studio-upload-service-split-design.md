# Studio Upload Service Split Design

## Goal

Make the studio upload flow easier to understand by moving upload-wizard API calls out of the broad `features/watch/services/mediaService.ts` facade and into a focused `features/studio-upload/services/studioUploadService.ts`.

## Scope

- Add `studioUploadService` under `src/features/studio-upload/services/`.
- Include the API functions used by the studio upload wizard: `initUpload`, multipart status/part/complete helpers, `submitUpload`, `cancelUpload`, `updateVideoMetadata`, `getMetadataSuggestions`, `uploadPresignedFile`, and `uploadResumableVideoFile`.
- Update `UploadStep1Details.tsx` and `UploadStep3Review.tsx` to use `studioUploadService` instead of `mediaService`.
- Keep `mediaService` compatibility methods for existing callers outside the upload wizard.
- Keep shared upload-related types in `features/watch/services/mediaService.types.ts` for this step to avoid widening the refactor.

## Non-Goals

- Do not migrate studio-content draft actions in this step.
- Do not split channel, membership, admin, discovery, or playback services.
- Do not change backend API paths, request bodies, response checks, upload concurrency, or error messages.

## Architecture

`studioUploadService` becomes the direct service boundary for the upload wizard. It owns wiring backend upload endpoints into `createUploadResumableVideoFile` and exposes direct helper methods for thumbnail upload and upload submission.

`mediaService` remains as a legacy facade and delegates upload-related methods to `studioUploadService`. This keeps existing callers stable while allowing upload components to depend on the correct feature service.

## Testing

Existing upload helper tests remain under `studio-upload/services`. Verification should cover the moved service imports, TypeScript, ESLint, the upload helper test, and the full Jest suite when feasible.
