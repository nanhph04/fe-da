# Finance Service API List

Tai lieu nay viet theo goc nhin FE: goi API nao, gui gi, nhan gi, backend xu ly ra sao.

## 1. Tong quan

- Base path: `/api`
- Swagger: `/api/docs`
- Success response luon duoc boc theo format:

```json
{
  "success": true,
  "code": 200,
  "data": {},
  "mess": "optional"
}
```

- Error response:

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

## 2. Header chung

Phan lon API dang nam sau internal gateway, nen request thuong can:

- `x-internal-secret`: secret giua gateway va finance-service
- `x-user-id`: id user hien tai
- `x-user-role`: role hien tai, dung cho API admin

Neu FE goi thong qua API Gateway/BFF thi thuong gateway se tu gan cac header nay. FE chi can biet:

- API nao can user login
- API nao can quyen `admin`
- API nao can them `idempotency-key`

## 3. Wallet APIs

### 3.1 GET `/api/wallets/me`

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
  "type": "USER",
  "balance": 1000,
  "frozenBalance": 200,
  "status": "ACTIVE"
}
```

- Backend xu ly:
  - doc `x-user-id`
  - tim vi theo `userId`
  - neu khong co vi thi tra `404 Wallet not found`

### 3.2 GET `/api/wallets/user/:userId`

- Muc dich: lay vi theo `userId`
- Input:
  - path param: `userId`
- Output: giong `GET /wallets/me`
- Backend xu ly:
  - tim vi theo `userId`
  - khong kiem tra ownership
  - neu khong co vi thi tra `404`

## 4. Transaction APIs

### 4.1 GET `/api/transactions/me`

- Muc dich: lay danh sach giao dich do user hien tai khoi tao
- Headers:
  - `x-user-id` bat buoc
- Input:
  - khong co body
- Output `data`: mang transaction

```json
[
  {
    "id": "txn-1",
    "type": "DEPOSIT",
    "assetType": "MONEY",
    "amount": 10000,
    "status": "COMPLETED",
    "fromWalletId": null,
    "toWalletId": "wallet-1",
    "initiatedByUserId": "user-1",
    "referenceId": "deposit-1",
    "description": "Completed deposit TOPUP_10K",
    "failureReason": null,
    "metadata": {},
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

### 4.2 GET `/api/transactions/reference/:referenceId`

- Muc dich: lay tat ca transaction lien quan den mot `referenceId`
- Input:
  - path param: `referenceId`
- Output: mang transaction
- Backend xu ly:
  - query theo `referenceId`
  - khong check ownership
- Goi y cho FE:
  - dung khi can xem cac but toan sinh ra tu cung 1 nghiep vu nhu payment, deposit, withdrawal

### 4.3 GET `/api/transactions/:transactionId`

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

## 5. Deposit APIs

### 5.1 GET `/api/deposits/packages`

- Muc dich: lay danh sach goi nap dang active de FE render man nap tien
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

### 5.2 POST `/api/deposits`

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
  "status": "PENDING",
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
  - tao ban ghi deposit `PENDING`
  - sinh `paymentCode` duy nhat
  - goi PayOS de tao payment link
  - tra `checkoutUrl` cho FE de redirect/mo link thanh toan

- FE can lam gi:
  - goi API nay sau khi user chon goi nap
  - dung `checkoutUrl` de mo cong thanh toan
  - luu `deposit.id` de sau nay poll/tracking neu can

### 5.3 POST `/api/deposits/:depositId/webhook/success`

- Muc dich: endpoint webhook noi bo de xac nhan deposit thanh cong
- FE: khong goi API nay
- Headers:
  - `x-webhook-timestamp`
  - `x-webhook-signature`
- Input body:

```json
{
  "gatewayTransactionId": "VNPAY_TX_123456",
  "gateway": "vnpay",
  "moneyAmount": 10000,
  "description": "Payment confirmed by webhook"
}
```

- Backend xu ly:
  - verify HMAC signature
  - kiem tra gateway, so tien, transaction id co match deposit khong
  - cong coin vao vi
  - tao transaction `DEPOSIT`
  - update deposit sang `COMPLETED`

### 5.4 POST `/api/deposits/webhooks/payos`

- Muc dich: webhook PayOS callback truc tiep
- FE: khong goi API nay
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
  "status": "COMPLETED",
  "depositId": "deposit-id"
}
```

- Backend xu ly:
  - verify chu ky webhook PayOS
  - chi xu ly khi `success = true`, `code = 00`
  - tim deposit qua `paymentCode`
  - neu dung va chua complete thi cong coin vao vi, tao transaction, update deposit
  - neu webhook duplicate thi tra thanh cong nhung khong cong coin lan 2

### 5.5 GET `/api/deposits/admin/packages`

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

### 5.6 POST `/api/deposits/admin/packages`

- Muc dich: admin tao package nap
- Headers:
  - `x-user-id`
  - `x-user-role=admin`
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

### 5.7 PATCH `/api/deposits/admin/packages/:packageId`

- Muc dich: admin cap nhat package
- Headers:
  - `x-user-id`
  - `x-user-role=admin`
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
  - neu co `isActive` thi activate/deactivate package

### 5.8 POST `/api/deposits/admin/:depositId/reconcile`

- Muc dich: admin ep backend kiem tra lai trang thai payment PayOS cho 1 deposit pending
- Headers:
  - `x-user-id`
  - `x-user-role=admin`
- Input:
  - path param: `depositId`
- Output: `DepositResponseDto`
- Backend xu ly:
  - check admin role
  - lock chong reconcile trung
  - neu deposit da `COMPLETED` hoac `FAILED` thi tra trang thai hien tai
  - neu PayOS bao `PAID` thi complete deposit, cong coin
  - neu PayOS bao `EXPIRED` hoac `CANCELLED` thi mark deposit failed

- FE dung khi nao:
  - man admin thay user bao da thanh toan nhung deposit van pending

## 6. Withdrawal APIs

### 6.1 POST `/api/withdrawals`

- Muc dich: user tao yeu cau rut coin ra tien mat
- Headers:
  - `x-user-id` bat buoc
- Input body:

```json
{
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
  "status": "PENDING",
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
  - tru coin kha dung khoi vi theo co che freeze/rut
  - tao withdrawal `PENDING`
  - tao transaction `WITHDRAWAL`

- FE luu y:
  - sau khi tao, coin user khong con dung duoc ngay vi da bi giu cho lenh rut

### 6.2 GET `/api/withdrawals/me`

- Muc dich: user xem danh sach lenh rut cua minh
- Headers:
  - `x-user-id`
- Output: mang withdrawal
- Backend xu ly:
  - lay theo `userId`

### 6.3 GET `/api/withdrawals/:withdrawalId`

- Muc dich: user xem chi tiet lenh rut
- Headers:
  - `x-user-id`
- Input:
  - path param: `withdrawalId`
- Output: 1 withdrawal
- Backend xu ly:
  - tim withdrawal
  - chi owner moi xem duoc

### 6.4 POST `/api/withdrawals/:withdrawalId/cancel`

- Muc dich: user huy lenh rut
- Headers:
  - `x-user-id`
- Input:
  - path param: `withdrawalId`
- Output: withdrawal sau khi huy
- Backend xu ly:
  - check owner
  - doi status withdrawal sang `CANCELLED`
  - hoan coin ve vi
  - update transaction sang cancelled

### 6.5 POST `/api/withdrawals/:withdrawalId/approve`

- Muc dich: admin duyet lenh rut
- Thuc te code hien tai:
  - co `adminId` qua `x-user-id`
  - chua check `x-user-role=admin` o controller/use case
- Input body:

```json
{
  "adminNote": "Da kiem tra thong tin ngan hang"
}
```

- Output: withdrawal sau khi approve
- Backend xu ly:
  - set trang thai `APPROVED`
  - luu `processedByAdminId` va `adminNote`

### 6.6 POST `/api/withdrawals/:withdrawalId/reject`

- Muc dich: admin tu choi lenh rut
- Input body:

```json
{
  "reason": "Thong tin tai khoan khong hop le",
  "adminNote": "Can cap nhat lai ten chu tai khoan"
}
```

- Output: withdrawal sau khi reject
- Backend xu ly:
  - set status `REJECTED`
  - tra coin ve vi
  - update transaction sang failed

### 6.7 POST `/api/withdrawals/:withdrawalId/complete`

- Muc dich: admin xac nhan da chuyen khoan xong
- Input body:

```json
{
  "transferReference": "BANK-TXN-123",
  "adminNote": "Da chuyen khoan thanh cong"
}
```

- Output: withdrawal sau khi complete
- Backend xu ly:
  - set status `COMPLETED`
  - finalize coin deduction trong vi
  - update transaction completed

## 7. Payment APIs

### 7.1 POST `/api/payments`

- Muc dich: user dung coin de thanh toan video hoac membership
- Headers:
  - `x-user-id` bat buoc
  - `idempotency-key` bat buoc
  - `x-request-id` optional, dung trace event

- Input body:

```json
{
  "serviceType": "VIDEO",
  "serviceId": "video-123",
  "channelId": "channel-123",
  "channelOwnerId": "channel-owner-1",
  "coinAmount": 100
}
```

- `serviceType` hien co:
  - `VIDEO`
  - `MEMBERSHIP`

- Output `data`:

```json
{
  "payerWalletId": "wallet-user",
  "channelWalletId": "wallet-channel",
  "systemWalletId": "wallet-system",
  "serviceType": "VIDEO",
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
      "type": "VIDEO_PURCHASE",
      "amount": 100,
      "fromWalletId": "wallet-user",
      "toWalletId": null,
      "referenceId": "video-123"
    },
    {
      "id": "txn-creator",
      "type": "CHANNEL_REVENUE",
      "amount": 80,
      "fromWalletId": null,
      "toWalletId": "wallet-channel",
      "referenceId": "video-123"
    },
    {
      "id": "txn-system",
      "type": "SYSTEM_REVENUE",
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
  - neu cung key va cung payload da goi roi thi tra lai response cu
  - neu cung key nhung payload khac thi tra `409`
  - tim vi payer, vi channel owner, vi system
  - tru coin user
  - chia doanh thu giua creator va system theo config
  - tao cac transaction ledger
  - day integration event `video.payment.success` hoac `membership.payment.success`

- FE luu y:
  - luon tao `idempotency-key` moi cho moi action bam thanh toan
  - neu user bam lai do lag, FE nen gui lai cung key de tranh tru tien 2 lan

## 8. Mapping trang thai nghiep vu cho FE

### Deposit status

- `PENDING`: da tao lenh nap, cho thanh toan hoac cho webhook
- `COMPLETED`: nap thanh cong, coin da cong vi
- `FAILED`: thanh toan loi/het han/bi huy
- `CANCELLED`: trang thai huy neu co xu ly huy rieng

### Withdrawal status

- `PENDING`: user vua tao lenh rut, cho admin xu ly
- `APPROVED`: admin da duyet, cho chuyen khoan
- `REJECTED`: admin tu choi, coin da hoan vi
- `COMPLETED`: admin da chuyen tien xong
- `CANCELLED`: user tu huy, coin da hoan vi

### Transaction status

- `PENDING`: da sinh ledger nhung chua hoan tat
- `COMPLETED`: hoan tat
- `FAILED`: that bai
- `CANCELLED`: da huy

## 9. Loi FE se hay gap

- `400 Bad Request`
  - thieu field body
  - sai kieu du lieu
  - reconcile dang chay do
  - amount/gateway khong khop webhook

- `401 Unauthorized`
  - thieu `x-user-id`
  - thieu hoac sai `x-internal-secret`
  - webhook thieu signature

- `403 Forbidden`
  - khong phai owner cua transaction/withdrawal
  - API admin nhung role khong phai `admin`

- `404 Not Found`
  - khong tim thay wallet, deposit, withdrawal, transaction, package

- `409 Conflict`
  - `idempotency-key` bi reuse voi payload khac
  - `deposit package code` bi trung

## 10. Goi y tich hop FE

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

## 11. Ghi chu quan trong

- Cac API admin cua `deposits` da check role `admin`.
- Cac API admin cua `withdrawals` hien tai chua check `x-user-role=admin` trong code. FE van nen xem day la API admin, nhung backend hien chua khoa cung bang role.
- `GET /api/transactions/reference/:referenceId` hien khong check ownership, nen neu dung cho FE public thi can ra soat them o backend.
