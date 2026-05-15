# Missing Finance APIs To Add Later

Date: 2026-05-15

## Context

Frontend finance/studio-wallet services were cleaned to only call endpoints confirmed in `api-list-finance-service.md`.

Confirmed usable endpoints kept in FE:

- `GET /api/studio/wallet/me`
- `GET /api/studio/wallet/stats`
- `GET /api/studio/earnings/summary`
- `GET /api/studio/earnings/monthly?year=YYYY&month=M`
- `GET /api/studio/earnings/top-videos?period=monthly&limit=N`
- `POST /api/withdrawals`
- `GET /api/withdrawals/me`
- `GET /api/withdrawals/:withdrawalId`
- `POST /api/withdrawals/:withdrawalId/cancel`
- admin withdrawal actions already present under `/api/withdrawals/:id/approve|reject|complete`

## Product decision

The system does not have saved payment methods:

- Money in: viewer deposits through PayOS checkout links.
- Money out: creator sends a withdrawal request with bank information.
- Admin manually performs the bank transfer and marks the withdrawal approved/rejected/completed.

Therefore FE must not request or model payout/payment methods. Do not add `/api/studio/payout-methods*` or saved payment-method APIs unless the product changes.

## APIs removed from active FE calls

These were previously referenced by FE but are not in the current finance-service API list.

### 1. Withdrawal query APIs

Current real API `GET /api/withdrawals/me` returns an array only, so FE is filtering/paginating client-side.

Useful future endpoints:

- `GET /api/withdrawals/me?status=&page=&limit=&startDate=&endDate=`
- `GET /api/withdrawals/summary`
- `GET /api/withdrawals/:withdrawalId/status`
- `GET /api/withdrawals/amount-limits`
- `GET /api/withdrawals/stats?period=&startDate=&endDate=`

Optional validation endpoint if backend wants pre-submit checks:

- `POST /api/withdrawals/validate`

Do not add payment method or methodId fields to these APIs. Withdrawal request should keep using direct `bankInfo`.

### 2. Withdrawal admin list APIs

Admin payout screens currently need review lists. The current documented admin actions exist, but a documented list/detail contract would help avoid mock data.

Useful future endpoints:

- `GET /api/withdrawals/admin?status=&page=&limit=&userId=&startDate=&endDate=`
- `GET /api/withdrawals/admin/:withdrawalId`

Existing admin action endpoints already documented:

- `POST /api/withdrawals/:withdrawalId/approve`
- `POST /api/withdrawals/:withdrawalId/reject`
- `POST /api/withdrawals/:withdrawalId/complete`

### 3. Revenue analytics APIs

Current finance-service only supports earnings summary/monthly/top-videos. These advanced revenue endpoints were removed from active FE calls.

Suggested endpoints if Creator Studio analytics needs them:

- `GET /api/studio/revenue/summary?period=&startDate=&endDate=`
- `GET /api/studio/revenue/daily?startDate=&endDate=`
- `GET /api/studio/revenue/monthly?year=&months=`
- `GET /api/studio/revenue/top-videos?period=&limit=`
- `GET /api/studio/revenue/trends?interval=&points=&startDate=&endDate=`

Recommendation: do not add all at once. Start with `summary`, `daily/monthly`, and `top-videos` if dashboard charts need real data.

### 4. Expanded earnings APIs

Current confirmed earnings endpoints are `summary`, `monthly`, and `top-videos` only.

Potential future endpoints:

- `GET /api/studio/earnings/video?videoId=&period=&status=`
- `GET /api/studio/earnings/history?period=&status=&page=&limit=`
- `GET /api/studio/earnings/videos?period=&status=`
- `GET /api/studio/earnings/monthly-all?year=`
- `GET /api/studio/earnings/by-status?period=`
- `GET /api/studio/earnings/metrics?period=&startDate=&endDate=`

### 5. Wallet settings/tax/activity APIs

These were referenced by FE service but are not in the current finance-service contract.

Suggested endpoints:

- `PATCH /api/studio/wallet/settings`
- `GET /api/studio/wallet/activity-summary`
- `GET /api/studio/wallet/tax-info`
- `PATCH /api/studio/wallet/tax-info`

Recommendation: tax info may belong to user/profile or compliance service instead of finance-service. Confirm ownership before implementing.

## FE assumptions until APIs exist

- Deposit uses PayOS through `POST /api/deposits` and `checkoutUrl`.
- Withdrawal forms send direct `bankInfo` to `POST /api/withdrawals`.
- FE does not send `moneyAmount` or `exchangeRate`; backend calculates them.
- Withdrawal history uses `GET /api/withdrawals/me` and client-side pagination/filtering.
- There is no saved payment method or payout method UI.
- Revenue analytics service is unavailable until backend exposes a contract.
