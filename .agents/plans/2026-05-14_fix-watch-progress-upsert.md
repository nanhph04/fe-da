# Plan: Fix Watch Progress Duplicate Key With Backend Upsert

Date: 2026-05-14

## Goal

Fix `500 duplicate key value violates unique constraint "IDX_video_watch_progress_user_id_video_id"` when persisting playback progress.

Current issue:
- Browser can send multiple progress requests close together for the same `(userId, videoId)`.
- Backend performs read-then-insert.
- Two concurrent requests can both see no existing progress, then both try insert.
- The second insert violates unique index `(user_id, video_id)` and returns 500.

## Root Cause

Current flow in `UpdateVideoProgressUseCase`:

```ts
const existingProgress =
  await this.watchProgressRepository.findByUserIdAndVideoId(userId, videoId);

const progress =
  existingProgress ??
  VideoWatchProgressEntity.create(...);

await this.watchProgressRepository.save(progress);
```

Repository save:

```ts
await this.ormRepository.save({
  id: progress.id,
  userId: progress.userId,
  videoId: progress.videoId,
  ...
});
```

This is not atomic for the unique business key `(userId, videoId)`.

## Preferred Solution

Make progress persistence an atomic upsert on `(user_id, video_id)` in the backend repository.

The progress API is naturally idempotent:
- Same user/video should have one progress row.
- New requests update that row.
- Concurrent first writes should not produce 500.

## Backend Scope

Files to inspect/modify:

- `media_service/src/modules/videos/domain/repositories/video-watch-progress.repository.ts`
- `media_service/src/modules/videos/infrastructure/persistence/video-watch-progress.repository.ts`
- `media_service/src/modules/videos/application/use-cases/update-video-progress.use-case.ts`
- `media_service/src/modules/videos/infrastructure/persistence/video-watch-progress.orm-entity.ts`
- Tests:
  - `media_service/src/modules/videos/application/use-cases/update-video-progress.use-case.spec.ts`
  - Add or update repository test if present for `VideoWatchProgressRepository`.

## Backend Implementation Steps

### 1. Keep use case behavior intact

`UpdateVideoProgressUseCase` can keep checking existing progress to preserve domain logic:

```ts
const existingProgress = await findByUserIdAndVideoId(...);
```

If existing:
- Call `progress.updateProgress(...)`.
- If not updated, return early.

If missing:
- Create new domain progress entity.

Then call repository save.

The repository save will become upsert, so concurrent "missing" creates no longer fail.

### 2. Change repository save to atomic upsert

In `VideoWatchProgressRepository.save()`, replace `ormRepository.save()` with insert-on-conflict-update.

Preferred with TypeORM QueryBuilder:

```ts
await this.ormRepository
  .createQueryBuilder()
  .insert()
  .into(VideoWatchProgressOrmEntity)
  .values({
    id: progress.id,
    userId: progress.userId,
    videoId: progress.videoId,
    channelId: progress.channelId,
    lastPositionSeconds: progress.lastPositionSeconds,
    durationSeconds: progress.durationSeconds,
    lastWatchedAt: progress.lastWatchedAt,
    completedAt: progress.completedAt,
    createdAt: progress.createdAt,
    updatedAt: progress.updatedAt,
  })
  .orUpdate(
    [
      "channel_id",
      "last_position_seconds",
      "duration_seconds",
      "last_watched_at",
      "completed_at",
      "updated_at",
    ],
    ["user_id", "video_id"],
  )
  .execute();
```

Important:
- Do not update `id` on conflict.
- Do not update `created_at` on conflict.
- Update only mutable progress fields.

### 3. Confirm ORM column names

Before implementation, verify `VideoWatchProgressOrmEntity` column names:
- `userId` maps to `user_id`
- `videoId` maps to `video_id`
- `channelId` maps to `channel_id`
- `lastPositionSeconds` maps to `last_position_seconds`
- `durationSeconds` maps to `duration_seconds`
- `lastWatchedAt` maps to `last_watched_at`
- `completedAt` maps to `completed_at`
- `updatedAt` maps to `updated_at`

If TypeORM uses property names in `orUpdate()` for this project/version, adjust syntax according to existing project conventions.

### 4. Consider stale update behavior

Basic upsert fixes 500 but does not fully handle out-of-order requests.

Example:
- Request A saves position `120`.
- Request B, older, arrives later and saves position `100`.
- Resume position can move backward.

Possible policies:

#### Option A: Latest write wins
Use basic upsert.
- Pros: simple, matches user seeking backward.
- Cons: out-of-order network can move progress backward.

#### Option B: Max position wins
Use SQL `GREATEST(existing.last_position_seconds, excluded.last_position_seconds)`.
- Pros: avoids backward movement from stale requests.
- Cons: user intentionally seeking backward will not be reflected.

#### Recommended for now
Use latest write wins via simple upsert.

Reason:
- Current player can save on pause/seek/end.
- If user intentionally seeks backward, saving that position can be valid.
- Main goal is to stop 500 and make API idempotent.
- Add stale-update protection later if UX requires.

### 5. Ensure response remains stable

`UpdateVideoProgressUseCase` returns the domain entity values it attempted to persist:

```ts
return {
  videoId: progress.videoId,
  positionSeconds: progress.lastPositionSeconds,
  completed: progress.isCompleted(),
};
```

This can remain unchanged.

If repository later normalizes with SQL expressions, consider returning saved row from repository in a future refactor. Not needed for this fix.

### 6. Update tests

Add repository-level test if infrastructure tests exist:
- First save creates a row.
- Second save same `userId/videoId` updates row.
- No duplicate row exists.
- `createdAt` remains original if observable.
- `lastPositionSeconds` updates.

Update use-case tests:
- Existing mocked `save()` can remain.
- Add scenario documenting idempotent progress persistence if mock repository supports it.
- Ensure duplicate-key errors are no longer expected anywhere.

### 7. Verify BE

Run from `media_service`:

```txt
npm test -- update-video-progress
```

If repository tests exist:

```txt
npm test -- video-watch-progress
```

If available:

```txt
npm run lint
npm run test
```

Manual test:
- Start FE and media service.
- Play a video.
- Pause/play rapidly.
- Seek then pause.
- Watch network calls to:

```txt
PATCH/POST /api/media/videos/:id/progress
```

- There should be no 500 duplicate key errors.
- Continue Watching still shows one row per video.

## Frontend Scope

FE should not be the primary fix, but can reduce noisy duplicate progress requests.

Files to inspect:
- `src/features/watch/components/cinematic-player/use-cinematic-player.ts`
- `src/features/watch/services/mediaService.ts`

## Optional FE Improvements

### 1. Prevent invalid videoId saves

Before saving:

```ts
if (!videoIdRef.current || videoIdRef.current === "undefined") {
  return;
}
```

This is defensive only. The purchased library contract fix should prevent invalid watch routes.

### 2. Avoid repeated forced saves at the same position

Current logic updates `lastSavedPositionRef.current` before the API call:

```ts
lastSavedPositionRef.current = normalizedTime;
```

This reduces repeated calls locally. Keep this behavior.

For `force = true` pause/end calls, optionally skip if:
- same state,
- same second,
- previous save is in-flight.

But do not rely on frontend throttling to fix backend uniqueness. Backend upsert is required.

### 3. Optional in-flight de-dupe

Add refs:

```ts
const inFlightProgressRef = useRef(false);
const pendingProgressRef = useRef<... | null>(null);
```

But this adds complexity. Not required if backend upsert is implemented.

## API Contract

Progress endpoint should be idempotent for repeated requests:

Request:

```json
{
  "positionSeconds": 120,
  "durationSeconds": 600,
  "state": "paused"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "videoId": "81ec05c7-6073-4f24-83a1-a20e8a1a0ca4",
    "positionSeconds": 120,
    "completed": false
  }
}
```

Repeated/concurrent calls for same user/video must return success, not 500.

## Risks

- TypeORM `orUpdate` syntax can vary by version/database driver. Verify against existing code or TypeORM docs used by project.
- If the project uses snake_case database columns but camelCase entity property names, conflict/update columns must match the correct TypeORM syntax.
- Basic latest-write-wins upsert can move progress backward if requests arrive out of order.
- More advanced SQL expressions may reduce portability but improve correctness.

## Definition of Done

- Rapid progress saves no longer throw duplicate key 500.
- `video_watch_progress` has one row per `(user_id, video_id)`.
- Continue Watching still works.
- Playback resume still works.
- Relevant BE tests pass.
- FE does not need to hide backend errors for this case anymore.
