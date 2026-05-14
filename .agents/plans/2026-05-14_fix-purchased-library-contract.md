# Plan: Fix Purchased Library Contract Between FE and BE

Date: 2026-05-14

## Goal

Fix `/library` purchased video cards navigating to `/watch/undefined` and make the purchased library API contract explicit, stable, and business-correct.

Current issue:
- FE expects `PurchasedVideoResponse.videoId`.
- BE endpoint `GET /api/media/videos/library/purchased` currently returns `VideoListItemResponseDto` with `id`.
- Runtime result: `item.videoId` is `undefined`, so FE navigates to `/watch/undefined`.
- SSR watch metadata then calls `/api/media/videos/undefined/metadata`, causing 404.

## Root Cause

Backend controller uses generic video list DTO for purchased videos:

```ts
result.items.map((row) => this.toVideoListItemDto(row))
```

`toVideoListItemDto()` returns:

```ts
id: video.id
```

Frontend purchased library type expects a purchased-specific response:

```ts
videoId: string;
channelName: string;
priceCoin: number;
purchasedAt: string;
accessStatus: string;
```

But backend does not return those fields.

## Preferred Solution

Implement a dedicated purchased-library API response contract in BE, then align FE to that contract.

Do not make FE guess `id` vs `videoId` long-term. Purchased library is a different business concept from generic discovery video list because it needs purchase metadata like `purchasedAt`.

## Backend Scope

Files to inspect/modify:

- `media_service/src/modules/videos/domain/repositories/video-purchase-unlock.repository.ts`
- `media_service/src/modules/videos/infrastructure/persistence/video-purchase-unlock.repository.ts`
- `media_service/src/modules/videos/application/use-cases/get-purchased-videos.use-case.ts`
- `media_service/src/modules/videos/application/dtos/purchased-videos.response.ts`
- Create or update:
  - `media_service/src/modules/videos/application/dtos/purchased-video-item.response.ts`
  - `media_service/src/modules/videos/presentation/dtos/purchased-video.response.ts`
- `media_service/src/modules/videos/presentation/controllers/videos.controller.ts`
- Tests:
  - `media_service/src/modules/videos/application/use-cases/get-purchased-videos.use-case.spec.ts`
  - `media_service/src/modules/videos/infrastructure/persistence/video-purchase-unlock.repository.spec.ts`
  - `media_service/src/modules/videos/presentation/controllers/videos.controller.spec.ts`

## Backend Implementation Steps

### 1. Create purchased item application DTO

Create a purchased-specific application response:

```ts
export interface PurchasedVideoItemResponse {
  videoId: string;
  channelId: string;
  channelName: string | null;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  categories: string[];
  tags: string[];
  priceCoin: number;
  purchasedAt: Date;
  publishedAt: Date | null;
  viewCount: number;
  accessStatus: "ACTIVE";
}
```

Notes:
- Use `videoId`, not `id`, because this response represents a purchase/unlock item pointing to a video.
- `purchasedAt` should come from `unlock.createdAt`, preferably latest unlock if duplicates exist.
- `channelName` should be joined from channel table if available. If not currently easy, return `null` and let FE fallback gracefully.
- `priceCoin` maps from `video.price`.

### 2. Update repository return type

Change repository contract from returning `VideoEntity[]` to returning purchased DTO items.

Current:

```ts
export interface PurchasedVideosPageResult {
  items: VideoEntity[];
  total: number;
}
```

Preferred:

```ts
export interface PurchasedVideosPageResult {
  items: PurchasedVideoItemResponse[];
  total: number;
}
```

### 3. Query purchased data with unlock metadata

Update `VideoPurchaseUnlockRepository.findPurchasedByUserId()`.

Current query first gets `video.id` and `MAX(unlock.created_at)`, then loads videos separately. That loses purchase metadata in the returned DTO.

Preferred approach:
- Keep the two-step query if needed for pagination.
- Preserve `lastUnlockedAt` in a map:

```ts
const purchasedAtByVideoId = new Map(idRows.map(row => [row.videoId, row.lastUnlockedAt]));
```

- Load videos by ids.
- Map each video into `PurchasedVideoItemResponse`, using `purchasedAtByVideoId`.

If joining channel is available, include channel name. If not, return `channelName: null`.

### 4. Create presentation DTO

Create `PurchasedVideoResponseDto`:

```ts
export class PurchasedVideoResponseDto {
  @ApiProperty()
  videoId!: string;

  @ApiProperty()
  channelId!: string;

  @ApiProperty({ nullable: true })
  channelName!: string | null;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty({ nullable: true })
  durationSeconds!: number | null;

  @ApiProperty({ type: [String] })
  categories!: string[];

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty()
  priceCoin!: number;

  @ApiProperty()
  purchasedAt!: string;

  @ApiProperty({ nullable: true })
  publishedAt!: string | null;

  @ApiProperty()
  viewCount!: number;

  @ApiProperty()
  accessStatus!: "ACTIVE";
}
```

### 5. Update controller endpoint

In `videos.controller.ts`, change `library/purchased` endpoint from generic video list DTO to purchased DTO:

```ts
@ApiSuccessResponse(PurchasedVideoResponseDto, { isArray: true })
async purchased(...): Promise<ApiResponse<PurchasedVideoResponseDto[]>> {
  const result = await this.getPurchasedVideosUseCase.execute(...);

  return ApiResponse.success(
    result.items.map((item) => this.toPurchasedVideoDto(item)),
    undefined,
    result.pagination,
  );
}
```

Add mapper:

```ts
private toPurchasedVideoDto(
  item: PurchasedVideoItemResponse,
): PurchasedVideoResponseDto {
  return {
    videoId: item.videoId,
    channelId: item.channelId,
    channelName: item.channelName,
    title: item.title,
    description: item.description,
    thumbnailUrl: item.thumbnailUrl,
    durationSeconds: item.durationSeconds,
    categories: item.categories,
    tags: item.tags,
    priceCoin: item.priceCoin,
    purchasedAt: item.purchasedAt.toISOString(),
    publishedAt: item.publishedAt?.toISOString() ?? null,
    viewCount: item.viewCount,
    accessStatus: item.accessStatus,
  };
}
```

### 6. Update tests

Update controller tests:
- Expect `videoId`, not `id`.
- Expect `purchasedAt`.
- Expect `priceCoin`.
- Expect `accessStatus`.

Update repository tests:
- Verify `purchasedAt` is derived from `unlock.createdAt`.
- Verify ordering by latest unlock remains stable.
- Verify `total` still counts distinct video ids.

## Frontend Scope

Files to modify:

- `src/features/watch/services/mediaService.ts`
- `src/features/library/components/PurchasedLibrary.tsx`

## Frontend Implementation Steps

### 1. Update `PurchasedVideoResponse`

Update FE type to match BE purchased DTO:

```ts
export interface PurchasedVideoResponse {
  videoId: string;
  channelId: string;
  channelName: string | null;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  categories: string[];
  tags: string[];
  priceCoin: number;
  purchasedAt: string;
  publishedAt: string | null;
  viewCount: number;
  accessStatus: "ACTIVE" | "EXPIRED" | "REVOKED" | string;
}
```

### 2. Update purchased card link

In `PurchasedLibrary.tsx`, use:

```tsx
const videoId = item.videoId;
const itemKey = `${videoId}-${item.purchasedAt}-${index}`;
```

Then:

```tsx
<Link key={itemKey} href={`/watch/${videoId}`}>
```

### 3. Add guard for invalid data

Even with a clean contract, add a safe guard:

```tsx
if (!videoId) {
  return null;
}
```

This prevents `/watch/undefined` if backend or seed data is malformed.

### 4. Render purchased metadata correctly

Use:

```tsx
{item.description || item.channelName || "Video đã mua"}
```

And:

```tsx
{item.channelName || "Kênh chưa rõ"} - {formatDuration(item.durationSeconds)} - Mua ngày {formatDate(item.purchasedAt)}
```

### 5. Verify FE

Run from `fe`:

```txt
npm run type-check
npm run lint
```

Manual test:
- Open `/library`.
- Click a purchased video card.
- URL must be `/watch/<uuid>`.
- No request should hit `/api/media/videos/undefined/metadata`.
- Purchased date should render from `purchasedAt`.

## API Contract Sync

Expected endpoint response:

```json
{
  "success": true,
  "data": [
    {
      "videoId": "81ec05c7-6073-4f24-83a1-a20e8a1a0ca4",
      "channelId": "...",
      "channelName": "Cinema Labs",
      "title": "...",
      "description": "...",
      "thumbnailUrl": "...",
      "durationSeconds": 420,
      "categories": ["film"],
      "tags": ["drama"],
      "priceCoin": 100,
      "purchasedAt": "2026-05-13T18:12:21.259Z",
      "publishedAt": "2026-05-10T10:00:00.000Z",
      "viewCount": 123,
      "accessStatus": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 1
  }
}
```

## Risks

- If `channelName` requires joining another bounded context/service, return `null` first and add channel enrichment later.
- If existing FE screens reuse `PurchasedVideoResponse`, check all references before changing type.
- If duplicate unlock records exist, choose `MAX(unlock.created_at)` as `purchasedAt`.

## Definition of Done

- `/library` purchased video cards never generate `/watch/undefined`.
- FE type matches BE response.
- Backend purchased endpoint has a dedicated DTO.
- Tests updated for new contract.
- FE lint/type-check pass.
- BE relevant tests pass.
