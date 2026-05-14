# Finance Service API List

Tai lieu nay viet theo goc nhin FE/BFF: goi API nao, gui gi, nhan gi, va backend dang xu ly ra sao theo code hien tai.

## 1. Tong quan

- Base path: `/api`
- Swagger: `/api/docs`
- Validation global:
  - `transform: true`
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
- Hau het route di qua internal gateway guard.
- 3 route duoc skip internal gateway guard:
  - `GET /api`
  - `POST /api/deposits/webhooks/payos`
  - `POST /api/deposits/:depositId/webhook/success`

## 2. Response format

Success response luon duoc boc theo format:

```json
{
  "success": true,
  "code": 200,
  "data": {},
  "mess": "optional"
}
```

Voi endpoint tao moi tra HTTP 201, envelope se co `code: 201`.

Error response:

```json
{
  "success": false,
  "code": 400,
  "mess": "Error message",
  "data": null,
  "errors": ["Error message"],
  "requestId": "1744712345-abc1234",
  "timestamp": "2026-04-15T10:19:05.123Z",
  "path": "/api/..."
}
```

## 3. Header chung

Phan lon API dang nam sau internal gateway, nen request thuong can:

- `x-internal-secret`: bat buoc cho moi route khong duoc skip guard
- `x-user-id`: bat buoc cho route user-specific va admin route
- `x-user-role`: bat buoc cho route admin, gia tri backend dang check la `admin`
- `idempotency-key`: bat buoc cho `POST /api/payments`
- `x-request-id`: optional cho `POST /api/payments`, dung lam trace id cho integration event

Webhook internal deposit success dung header rieng:

- `x-webhook-timestamp`
- `x-webhook-signature`

Neu FE goi thong qua API Gateway/BFF thi gateway thuong se tu gan `x-internal-secret`, `x-user-id`, `x-user-role`.

## 3.1 Health Check

### GET `/api`

- Muc dich: kiem tra finance-service dang chay
- Route dac biet:
  - skip internal gateway guard
- Input:
  - khong co body/query/path param
- Output `data`:

```json
"Hello World!"
```

## 4. Wallet APIs

### 4.1 GET `/api/wallets/me`

- Muc dich: lay vi cua user dang dang nhap
- Headers:
  - `x-user-id` bat buoc
- Input:
  - khong co body
- Output `data`:

```json
{
  "id": "wallet-id",
  "userId": "user-id",
  "type": "user",
  "balance": 1000,
  "frozenBalance": 200,
  "status": "active"
}
```

- Backend xu ly:
  - doc `x-user-id`
  - tim vi theo `userId`
  - neu khong co vi thi tra `404 Wallet not found`

### 4.2 GET `/api/wallets/user/:userId`

- Muc dich: lay vi theo `userId`
- Input:
  - path param: `userId`
- Output: giong `GET /api/wallets/me`
- Backend xu ly:
  - tim vi theo `userId`
  - khong check ownership
  - neu khong co vi thi tra `404`

## 5. Transaction APIs

### 5.1 GET `/api/transactions/me`

- Muc dich: lay danh sach giao dich do user hien tai khoi tao
- Headers:
  - `x-user-id` bat buoc
- Output `data`: mang transaction

```json
[
  {
    "id": "txn-1",
    "type": "deposit",
    "assetType": "money",
    "amount": 10000,
    "status": "completed",
    "fromWalletId": null,
    "toWalletId": "wallet-1",
    "initiatedByUserId": "user-1",
    "referenceId": "deposit-1",
    "description": "Completed deposit TOPUP_10K",
    "failureReason": null,
    "metadata": {
      "packageName": "TOPUP_10K"
    },
    "completedAt": "2026-05-06T10:00:00.000Z",
    "failedAt": null,
    "cancelledAt": null,
    "createdAt": "2026-05-06T09:55:00.000Z",
    "updatedAt": "2026-05-06T10:00:00.000Z"
  }
]
```

- Backend xu ly:
  - lay `x-user-id`
  - query transaction theo `initiatedByUserId`

### 5.2 GET `/api/transactions/reference/:referenceId`

- Muc dich: lay tat ca transaction lien quan den mot `referenceId`
- Input:
  - path param: `referenceId`
- Output: mang transaction
- Backend xu ly:
  - query theo `referenceId`
  - khong check ownership
- Goi y cho FE:
  - dung khi can xem cac but toan sinh ra tu cung 1 nghiep vu nhu payment, deposit, withdrawal

### 5.3 GET `/api/transactions/:transactionId`

- Muc dich: lay chi tiet 1 transaction
- Headers:
  - `x-user-id` bat buoc
- Input:
  - path param: `transactionId`
- Output: 1 transaction
- Backend xu ly:
  - tim transaction theo id
  - kiem tra `initiatedByUserId === x-user-id`
  - neu khong dung owner thi tra `403 You do not own this transaction`

## 6. Deposit APIs

### 6.1 GET `/api/deposits/packages`

- Muc dich: lay danh sach goi nap dang active de FE render man nap tien
- Headers:
  - `x-internal-secret` bat buoc neu goi truc tiep vao service
- Input:
  - khong co body
- Output `data`: mang package

```json
[
  {
    "id": "package-1",
    "code": "TOPUP_500K",
    "name": "Goi 500.000 VND",
    "moneyAmount": 500000,
    "baseCoinAmount": 5000,
    "bonusCoinAmount": 500,
    "totalCoinAmount": 5500,
    "sortOrder": 1,
    "description": "Tang coin"
  }
]
```

- Backend xu ly:
  - chi lay package `isActive = true`
  - khong can login user

### 6.2 POST `/api/deposits`

- Muc dich: tao yeu cau nap tien theo package
- Headers:
  - `x-user-id` bat buoc
- Input body:

```json
{
  "packageId": "package-id"
}
```

- Output `data`:

```json
{
  "id": "deposit-id",
  "walletId": "wallet-id",
  "userId": "user-id",
  "packageId": "package-id",
  "packageCode": "TOPUP_500K",
  "packageName": "Goi 500.000 VND",
  "moneyAmount": 500000,
  "baseCoinAmount": 5000,
  "bonusCoinAmount": 500,
  "totalCoinAmount": 5500,
  "gateway": "payos",
  "status": "pending",
  "paymentCode": "123456789",
  "transferContent": "optional",
  "gatewayTransactionId": null,
  "checkoutUrl": "https://pay.payos.vn/...",
  "description": "Top up via package TOPUP_500K",
  "requestedAt": "2026-05-06T10:00:00.000Z",
  "completedAt": null,
  "failedAt": null,
  "cancelledAt": null
}
```

- Backend xu ly:
  - kiem tra package co ton tai va dang active khong
  - tim vi user, neu chua co thi tu tao vi
  - tao ban ghi deposit `pending`
  - sinh `paymentCode` duy nhat
  - goi PayOS de tao payment link
  - tra `checkoutUrl` cho FE de redirect/mo link thanh toan

### 6.3 POST `/api/deposits/:depositId/webhook/success`

- Muc dich: webhook noi bo de xac nhan deposit thanh cong
- FE: khong goi API nay
- Route dac biet:
  - skip internal gateway guard
  - khong can `x-internal-secret`
  - verify HMAC qua `x-webhook-timestamp` va `x-webhook-signature`
- Input body:

```json
{
  "gatewayTransactionId": "VNPAY_TX_123456",
  "gateway": "vnpay",
  "moneyAmount": 10000,
  "description": "Payment confirmed by webhook"
}
```

- Output: `DepositResponseDto`
- Backend xu ly:
  - verify HMAC signature
  - kiem tra gateway, so tien, transaction id co match deposit khong
  - cong coin vao vi
  - tao transaction `deposit`
  - update deposit sang `completed`

### 6.4 POST `/api/deposits/webhooks/payos`

- Muc dich: webhook PayOS callback truc tiep
- FE: khong goi API nay
- Route dac biet:
  - skip internal gateway guard
  - khong can `x-internal-secret`
- Input body:

```json
{
  "code": "00",
  "desc": "success",
  "success": true,
  "data": {},
  "signature": "sha256-signature"
}
```

- Output `data`:

```json
{
  "received": true,
  "status": "completed",
  "depositId": "deposit-id"
}
```

- Backend xu ly:
  - verify chu ky webhook PayOS trong payment gateway service
  - neu `success !== true` thi khong throw, tra:

```json
{
  "received": true,
  "status": "ignored"
}
```

  - chi xu ly complete khi:
    - `success === true`
    - `code === "00"`
    - neu co `dataCode` thi `dataCode === "00"`
  - tim deposit qua `paymentCode`/`orderCode`
  - check gateway va amount
  - neu webhook duplicate cho deposit da `completed` thi tra thanh cong va khong cong coin lan 2

### 6.5 GET `/api/deposits/admin/packages`

- Muc dich: admin xem tat ca package ke ca inactive
- Headers:
  - `x-user-id` bat buoc
  - `x-user-role=admin` bat buoc
- Output `data`: mang admin package, co them:
  - `isActive`
  - `createdAt`
  - `updatedAt`

- Backend xu ly:
  - check role phai la `admin`
  - neu khong phai admin tra `403 Admin role is required`

### 6.6 POST `/api/deposits/admin/packages`

- Muc dich: admin tao package nap
- Headers:
  - `x-user-id` bat buoc
  - `x-user-role=admin` bat buoc
- Input body:

```json
{
  "code": "TOPUP_500K",
  "name": "Goi 500.000 VND",
  "moneyAmount": 500000,
  "baseCoinAmount": 5000,
  "bonusCoinAmount": 500,
  "sortOrder": 4,
  "isActive": true,
  "description": "Tang them coin cho nguoi dung nap lon"
}
```

- Output: admin package object
- Backend xu ly:
  - check admin role
  - check `code` chua ton tai
  - tao package moi

### 6.7 PATCH `/api/deposits/admin/packages/:packageId`

- Muc dich: admin cap nhat package
- Headers:
  - `x-user-id` bat buoc
  - `x-user-role=admin` bat buoc
- Input:
  - path param: `packageId`
  - body: cac field can update, tat ca optional

```json
{
  "name": "Goi 500.000 VND moi",
  "moneyAmount": 500000,
  "baseCoinAmount": 5000,
  "bonusCoinAmount": 500,
  "sortOrder": 4,
  "isActive": false,
  "description": "Tam khoa de doi campaign moi"
}
```

- Output: admin package object sau update
- Backend xu ly:
  - check admin role
  - tim package theo id
  - update field truyen len

### 6.8 POST `/api/deposits/admin/:depositId/reconcile`

- Muc dich: admin ep backend kiem tra lai trang thai payment PayOS cho 1 deposit pending
- Headers:
  - `x-user-id` bat buoc
  - `x-user-role=admin` bat buoc
- Input:
  - path param: `depositId`
- Output: `DepositResponseDto`
- Backend xu ly:
  - check admin role
  - lock chong reconcile trung
  - neu deposit da `completed` hoac `failed` thi tra trang thai hien tai
  - neu PayOS bao `PAID` thi complete deposit, cong coin
  - neu PayOS bao `EXPIRED` hoac `CANCELLED` thi mark deposit failed

## 7. Withdrawal APIs

### 7.1 POST `/api/withdrawals`

- Muc dich: user tao yeu cau rut coin ra tien mat
- Headers:
  - `x-user-id` bat buoc
- Input body:

```json
{
  "coinAmount": 100,
  "bankInfo": {
    "bankCode": "VCB",
    "bankName": "Vietcombank",
    "accountNumber": "0123456789",
    "accountHolderName": "Nguyen Van A",
    "qrCode": "https://example.com/qr.png"
  },
  "description": "Rut tien thang 4"
}
```

- Output `data`:

```json
{
  "id": "withdrawal-id",
  "walletId": "wallet-id",
  "userId": "user-id",
  "coinAmount": 100,
  "moneyAmount": 10000,
  "exchangeRate": 100,
  "bankInfo": {
    "bankCode": "VCB",
    "bankName": "Vietcombank",
    "accountNumber": "0123456789",
    "accountHolderName": "Nguyen Van A",
    "qrCode": "https://example.com/qr.png"
  },
  "status": "pending",
  "adminNote": null,
  "processedByAdminId": null,
  "transferReference": null,
  "description": "Rut tien thang 4",
  "rejectionReason": null,
  "requestedAt": "2026-05-06T10:00:00.000Z",
  "approvedAt": null,
  "completedAt": null,
  "rejectedAt": null,
  "cancelledAt": null
}
```

- Backend xu ly:
  - check vi user ton tai
  - lay `exchangeRate` tu server config `WITHDRAWAL_EXCHANGE_RATE`
  - tinh `moneyAmount = coinAmount * exchangeRate` tren backend
  - tru coin kha dung khoi vi theo co che freeze/rut
  - tao withdrawal `pending`
  - tao transaction `withdrawal`

- FE luu y:
  - khong gui `moneyAmount` hoac `exchangeRate`
  - request se bi reject neu gui field ngoai DTO do `forbidNonWhitelisted`

### 7.2 GET `/api/withdrawals/me`

- Muc dich: user xem danh sach lenh rut cua minh
- Headers:
  - `x-user-id` bat buoc
- Output: mang withdrawal
- Backend xu ly:
  - lay theo `userId`

### 7.3 GET `/api/withdrawals/:withdrawalId`

- Muc dich: user xem chi tiet lenh rut
- Headers:
  - `x-user-id` bat buoc
- Input:
  - path param: `withdrawalId`
- Output: 1 withdrawal
- Backend xu ly:
  - tim withdrawal
  - chi owner moi xem duoc

### 7.4 POST `/api/withdrawals/:withdrawalId/cancel`

- Muc dich: user huy lenh rut
- Headers:
  - `x-user-id` bat buoc
- Input:
  - path param: `withdrawalId`
- Output: withdrawal sau khi huy
- Backend xu ly:
  - check owner
  - doi status withdrawal sang `cancelled`
  - hoan coin ve vi
  - update transaction sang cancelled

### 7.5 POST `/api/withdrawals/:withdrawalId/approve`

- Muc dich: admin duyet lenh rut
- Headers:
  - `x-user-id` bat buoc
  - `x-user-role=admin` bat buoc
- Input body:

```json
{
  "adminNote": "Da kiem tra thong tin ngan hang"
}
```

- Output: withdrawal sau khi approve
- Backend xu ly:
  - check role `admin`
  - set trang thai `approved`
  - luu `processedByAdminId` va `adminNote`

### 7.6 POST `/api/withdrawals/:withdrawalId/reject`

- Muc dich: admin tu choi lenh rut
- Headers:
  - `x-user-id` bat buoc
  - `x-user-role=admin` bat buoc
- Input body:

```json
{
  "reason": "Thong tin tai khoan khong hop le",
  "adminNote": "Can cap nhat lai ten chu tai khoan"
}
```

- Output: withdrawal sau khi reject
- Backend xu ly:
  - check role `admin`
  - set status `rejected`
  - tra coin ve vi
  - update transaction sang failed

### 7.7 POST `/api/withdrawals/:withdrawalId/complete`

- Muc dich: admin xac nhan da chuyen khoan xong
- Headers:
  - `x-user-id` bat buoc
  - `x-user-role=admin` bat buoc
- Input body:

```json
{
  "transferReference": "BANK-TXN-123",
  "adminNote": "Da chuyen khoan thanh cong"
}
```

- Output: withdrawal sau khi complete
- Backend xu ly:
  - check role `admin`
  - set status `completed`
  - finalize coin deduction trong vi
  - update transaction completed

## 8. Payment APIs

### 8.1 POST `/api/payments`

- Muc dich: user dung coin de thanh toan video hoac membership
- Headers:
  - `x-user-id` bat buoc
  - `idempotency-key` bat buoc
  - `x-request-id` optional

- Input body:

```json
{
  "serviceType": "video",
  "serviceId": "video-123",
  "channelId": "channel-123",
  "channelOwnerId": "channel-owner-1",
  "coinAmount": 100,
  "metadata": {
    "videoTitle": "How to Build a Media System",
    "channelName": "Distributed Media Lab",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/video-123.jpg"
  }
}
```

- `serviceType` hien co:
  - `video`
  - `membership`

- `metadata` la optional. Code hien tai support:
  - `videoTitle`
  - `channelName`
  - `thumbnailUrl`
  - `packageName`

- Output `data`:

```json
{
  "payerWalletId": "wallet-user",
  "channelWalletId": "wallet-channel",
  "systemWalletId": "wallet-system",
  "serviceType": "video",
  "serviceId": "video-123",
  "channelId": "channel-123",
  "channelOwnerId": "channel-owner-1",
  "coinAmount": 100,
  "splitPercent": 80,
  "creatorCoins": 80,
  "systemCoins": 20,
  "transactions": [
    {
      "id": "txn-debit",
      "type": "video_purchase",
      "status": "completed",
      "amount": 100,
      "fromWalletId": "wallet-user",
      "toWalletId": null,
      "referenceId": "video-123"
    },
    {
      "id": "txn-creator",
      "type": "channel_revenue",
      "status": "pending",
      "amount": 80,
      "fromWalletId": null,
      "toWalletId": "wallet-channel",
      "referenceId": "video-123"
    },
    {
      "id": "txn-system",
      "type": "system_revenue",
      "status": "pending",
      "amount": 20,
      "fromWalletId": null,
      "toWalletId": "wallet-system",
      "referenceId": "video-123"
    }
  ]
}
```

- Backend xu ly:
  - validate `idempotency-key`
  - neu cung key va cung request chinh da goi roi thi tra lai response cu
  - request hash hien tinh theo `userId`, `serviceType`, `serviceId`, `channelId`, `channelOwnerId`, `coinAmount`; `metadata` va `x-request-id` khong nam trong hash
  - neu cung key nhung cac field chinh khac thi tra `409`
  - tim vi payer, vi channel owner, vi system
  - neu chua co vi cua channel owner thi backend tu tao
  - tru coin user
  - chia doanh thu giua creator va system theo config
  - revenue cua creator/system duoc ghi vao `frozenBalance`, ledger revenue ban dau la `pending` cho den khi settlement release
  - tao cac transaction ledger
  - day integration event:
    - `video.payment.success`
    - `membership.payment.success`

## 9. Mapping trang thai nghiep vu cho FE

### Deposit status

- `pending`: da tao lenh nap, cho thanh toan hoac cho webhook
- `processing`: PayOS/webhook da ghi nhan dang xu ly
- `completed`: nap thanh cong, coin da cong vi
- `failed`: thanh toan loi, het han, hoac bi huy
- `cancelled`: trang thai huy neu co xu ly huy rieng

### Withdrawal status

- `pending`: user vua tao lenh rut, cho admin xu ly
- `approved`: admin da duyet, cho chuyen khoan
- `processing`: admin dang xu ly chuyen khoan
- `rejected`: admin tu choi, coin da hoan vi
- `completed`: admin da chuyen tien xong
- `cancelled`: user tu huy, coin da hoan vi

### Transaction status

- `pending`: da sinh ledger nhung chua hoan tat, vi du revenue cho creator/system dang bi freeze cho settlement
- `completed`: hoan tat
- `failed`: that bai
- `cancelled`: da huy

### Wallet status/type

- Wallet `status`: `active`, `frozen`, `closed`
- Wallet `type`: `user`, `system_revenue`

### Transaction type/assetType

- `assetType`: `money`, `coin`
- `type` pho bien: `deposit`, `withdrawal`, `video_purchase`, `member_subscription`, `channel_revenue`, `system_revenue`, `refund`, `system_adjustment`

## 10. Loi FE se hay gap

- `400 Bad Request`
  - thieu field body
  - sai kieu du lieu
  - gui field khong nam trong DTO
  - reconcile dang chay do
  - amount hoac gateway khong khop webhook

- `401 Unauthorized`
  - thieu `x-user-id`
  - thieu hoac sai `x-internal-secret`
  - webhook thieu signature
  - webhook timestamp khong hop le

- `403 Forbidden`
  - khong phai owner cua transaction hoac withdrawal
  - API admin nhung role khong phai `admin`

- `404 Not Found`
  - khong tim thay wallet, deposit, withdrawal, transaction, package

- `409 Conflict`
  - `idempotency-key` bi reuse voi payload khac
  - `deposit package code` bi trung

## 11. Goi y tich hop FE

- Man vi:
  - goi `GET /api/wallets/me`

- Man lich su giao dich:
  - goi `GET /api/transactions/me`
  - can drill down thi goi `GET /api/transactions/:transactionId`

- Man nap tien:
  - goi `GET /api/deposits/packages`
  - user chon goi xong goi `POST /api/deposits`
  - redirect user sang `checkoutUrl`

- Man rut tien:
  - goi `POST /api/withdrawals`
  - goi `GET /api/withdrawals/me` de load lich su
  - cho phep user huy bang `POST /api/withdrawals/:withdrawalId/cancel` khi con pending

- Man thanh toan video/membership:
  - goi `POST /api/payments`
  - bat buoc gui `idempotency-key`
  - nen gui lai cung key neu user bam lai cung mot action do lag

## 12. Ghi chu quan trong

- Cac API admin cua `deposits` dang check role `admin`.
- Cac API admin cua `withdrawals` cung dang check role `admin` trong use case.
- `GET /api/transactions/reference/:referenceId` hien khong check ownership, nen khong nen expose truc tiep cho FE public neu chua co tang kiem soat phia gateway/BFF.
- Webhook PayOS co the tra `status: "ignored"` thay vi loi khi payload khong phai success event.
