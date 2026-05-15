# Admin Content Moderation API Gap Plan

Date: 2026-05-16

## Context

The admin content moderation UI currently has real data for the moderation queue via media-service synthetic reports, but it does not have real API endpoints for administrator actions on violating videos.

Current available API/service:

- `GET /api/media/admin/reports?status=pending&page=1&limit=5`
  - FE service: `adminModerationService.getReports(...)`
  - Purpose: list moderation queue items.
- `GET /api/media/admin/reports/summary`
  - Purpose: dashboard moderation summary.

Current missing capability:

- Admin cannot approve/dismiss/reject/takedown/strike a flagged video through a documented API contract.
- Existing `DELETE /api/media/videos/:id` is owner-only, so FE must not use it for admin takedown.

## Required Backend APIs

### 1. Moderation Detail

```txt
GET /api/media/admin/reports/:id
```

Purpose:

- Load full moderation detail for `/admin/content/[id]`.
- Return video metadata, moderation reason, confidence, flagged timestamps, and current moderation status.

Suggested response data:

```ts
type AdminModerationDetail = {
  id: string;
  targetVideoId: string;
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    handle?: string;
    avatarUrl?: string | null;
  };
  thumbnailUrl: string | null;
  playbackPreviewUrl?: string | null;
  status: "pending" | "approved" | "rejected" | "dismissed" | "taken_down";
  videoStatus: string;
  visibility: string;
  requiredTierLevel: number | null;
  price: number;
  reason: string;
  confidencePercent: number | null;
  priority: "low" | "medium" | "high" | "critical";
  flaggedSegments: Array<{
    startSeconds: number;
    endSeconds: number;
    label: string;
  }>;
  moderationDetails: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
```

### 2. Resolve Moderation Action

Preferred single endpoint:

```txt
POST /api/media/admin/moderation/:videoId/action
```

Suggested body:

```ts
type AdminModerationActionRequest = {
  action: "approve" | "dismiss" | "reject" | "takedown" | "issue_strike";
  reason?: string;
  note?: string;
};
```

Purpose by action:

- `approve`: mark video as safe and allow it to continue/publish if processing is complete.
- `dismiss`: close the report without changing video availability.
- `reject`: mark video as rejected due to policy violation.
- `takedown`: unpublish/hide an already published violating video by admin authority.
- `issue_strike`: apply a creator/channel policy strike linked to the video.

Suggested response data:

```ts
type AdminModerationActionResponse = {
  videoId: string;
  reportId?: string;
  action: "approve" | "dismiss" | "reject" | "takedown" | "issue_strike";
  status: string;
  videoStatus: string;
  visibility: string;
  resolvedAt: string;
  resolvedBy: string;
};
```

### 3. Admin Video Takedown Alternative

If the backend prefers resource-specific endpoints instead of a generic action endpoint:

```txt
POST /api/media/admin/videos/:id/takedown
POST /api/media/admin/videos/:id/approve
POST /api/media/admin/videos/:id/reject
POST /api/media/admin/videos/:id/strike
POST /api/media/admin/reports/:id/dismiss
```

Suggested request body for mutating endpoints:

```ts
type AdminVideoDecisionRequest = {
  reason?: string;
  note?: string;
};
```

## Frontend Integration Plan After API Exists

Files to update:

- `src/features/admin-content/services/adminModerationService.ts`
  - Add `getReportDetail(id)`.
  - Add `runModerationAction(videoId, payload)` or separate endpoint methods.
- `src/features/admin-content/components/ContentModerationDetailFeature.tsx`
  - Replace mock detail with API data.
  - Enable `Takedown Media`, `Issue Strike`, and `Dismiss Report` buttons.
  - Add loading, error, empty/not-found, and success states.
  - Disable buttons while submitting and show clear failure messages.
- `src/features/admin-content/components/ContentReviewQueueFeature.tsx`
  - Refresh queue after action resolution if needed.

## Frontend Guard Until Backend Is Ready

- Keep moderation action buttons disabled or commented out.
- Do not call `DELETE /api/media/videos/:id` for admin moderation, because that endpoint is owner-only in the current contract.
- Keep `/admin/content/review` as read-only queue backed by `GET /api/media/admin/reports`.
