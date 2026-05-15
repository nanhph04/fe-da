# Admin Dashboard API Plan

Date: 2026-05-15

## Context

The `/admin` dashboard currently renders mostly static mock metrics. The frontend can only replace mock values with real data when the API contract is documented and available through the API Gateway (`NEXT_PUBLIC_GATEWAY_URL`) using the existing auth flow.

This plan lists the APIs needed to make the admin command center fully real without inventing fields or endpoints in the frontend.

## Confirmed APIs already usable

These endpoints are documented or already used by the codebase and can support partial dashboard data today:

- `GET /api/deposits/admin/packages`
  - Purpose: admin views all coin deposit packages, including inactive packages.
  - Dashboard use: finance configuration health, active package count, total configured coin supply by packages.

- `GET /api/media/admin/categories?q=...`
  - Purpose: admin views/searches all categories, including inactive/deleted.
  - Dashboard use: taxonomy health, active/inactive category counts.

- `GET /api/media/admin/tags?q=...`
  - Purpose: admin views/searches all tags, including inactive/pending/deleted.
  - Dashboard use: taxonomy health, pending tag count.

- `POST /api/withdrawals/:withdrawalId/approve`
- `POST /api/withdrawals/:withdrawalId/reject`
- `POST /api/withdrawals/:withdrawalId/complete`
  - Purpose: admin actions on withdrawal requests.
  - Dashboard limitation: actions exist, but there is no confirmed admin list/summary endpoint to count pending payouts.

## Required new APIs for a fully real `/admin` dashboard

### 1. Admin overview summary

`GET /api/admin/overview`

Purpose: return a single aggregated snapshot for top-level dashboard cards.

Recommended response:

```json
{
  "success": true,
  "code": 200,
  "data": {
    "users": {
      "total": 1240000,
      "active30d": 980000,
      "growth30dPercent": 12.4
    },
    "creators": {
      "total": 42800,
      "active30d": 12000,
      "uploadingNow": 128
    },
    "moderation": {
      "pendingReports": 156,
      "pendingManualReviewVideos": 38,
      "autoFlaggedVideos": 118
    },
    "payouts": {
      "pendingCount": 12,
      "pendingCoinAmount": 2400000,
      "pendingMoneyAmount": 240000000
    },
    "verifications": {
      "pendingCount": 45,
      "priorityCount": 14,
      "averageReviewHours": 4.2
    },
    "updatedAt": "2026-05-15T00:00:00.000Z"
  },
  "mess": "OK"
}
```

Notes:

- This endpoint is optional if backend prefers service-specific summary endpoints below.
- Values must be calculated server-side to avoid expensive frontend fan-out.
- Gateway/auth should set `x-user-id` and `x-user-role=admin`; frontend should not send role manually.

### 2. User/admin summary

`GET /api/user/admin/users/summary`

Purpose: support total users and active user growth metrics.

Response fields needed:

- `totalUsers` number
- `activeUsers30d` number
- `newUsers30d` number
- `growth30dPercent` number | null
- `flaggedUsers` number
- `lockedUsers` number

### 3. Creator/channel summary

`GET /api/media/admin/channels/summary`

Purpose: support active creator and channel health metrics.

Response fields needed:

- `totalChannels` number
- `activeCreators30d` number
- `eligibleForMembership` number
- `membershipClosedByAdmin` number
- `uploadingNow` number

### 4. Moderation reports summary and list

`GET /api/media/admin/reports/summary`

Purpose: provide accurate pending moderation counts.

Response fields needed:

- `pendingReports` number
- `pendingManualReviewVideos` number
- `autoFlaggedVideos` number
- `rejectedLast30d` number
- `averageResolutionHours` number | null

`GET /api/media/admin/reports?status=pending&page=1&limit=5`

Purpose: render the dashboard activity/priority list and content review queue with real items.

Minimal item fields:

- `id` string
- `targetVideoId` string
- `title` string
- `reporterLabel` string
- `reason` string
- `confidencePercent` number | null
- `createdAt` ISO string
- `priority` `low | medium | high | critical`

### 5. Admin withdrawal list and summary

`GET /api/withdrawals/admin/summary`

Purpose: support pending payout card without downloading all withdrawals.

Response fields needed:

- `pendingCount` number
- `pendingCoinAmount` number
- `pendingMoneyAmount` number
- `approvedCount` number
- `processingCount` number
- `completed30dMoneyAmount` number

`GET /api/withdrawals/admin?status=pending&page=1&limit=5`

Purpose: support payout management and dashboard priority actions.

Minimal item fields should match existing `Withdrawal` shape plus owner display fields if possible:

- `id` string
- `userId` string
- `userDisplayName` string | null
- `coinAmount` number
- `moneyAmount` number
- `status` string
- `bankInfo` object
- `requestedAt` ISO string

### 6. Creator verification summary and list

`GET /api/user/admin/creator-verifications/summary`

Purpose: support verification queue counts.

Response fields needed:

- `pendingCount` number
- `priorityCount` number
- `averageReviewHours` number | null
- `resolved30d` number

`GET /api/user/admin/creator-verifications?status=pending&page=1&limit=5`

Minimal item fields:

- `id` string
- `creatorUserId` string
- `creatorName` string
- `channelName` string | null
- `followers` number | null
- `status` string
- `createdAt` ISO string
- `priority` boolean

### 7. Admin activity log

`GET /api/admin/activity?limit=20`

Purpose: replace the mocked real-time activity log.

Minimal item fields:

- `id` string
- `type` `auth | upload | moderation | payout | system | user | category`
- `severity` `info | success | warning | error`
- `message` string
- `actorLabel` string | null
- `targetLabel` string | null
- `createdAt` ISO string

Optional SSE endpoint for live updates:

`GET /api/admin/activity/stream`

- Event format should match existing SSE parser expectations: named event + JSON `data` payload.
- Use this later only if backend supports it; do not poll.

## Frontend behavior until APIs exist

- Do not display hardcoded dashboard numbers as if they are real.
- Show real data only for confirmed endpoints.
- For missing contracts, render a clear unavailable state and link to the related admin page.
- Keep all API calls through the existing `api` wrapper with `requireAuth: true`.
- Do not send `x-user-role` from frontend manually; gateway/auth should derive it.
- Do not add Axios.

## Implementation priority

1. Add `GET /api/admin/overview` if backend can aggregate cheaply.
2. If not, add service-specific summaries: user, channel, moderation, withdrawal, verification.
3. Add list endpoints for dashboard priority panels.
4. Add activity log endpoint.
5. Add SSE activity stream only after snapshot endpoints are stable.
