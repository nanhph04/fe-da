IDENTITY SERVICE API LIST - FRONTEND CONTRACT

Last updated: 2026-04-26

Muc dich
========

Tai lieu nay danh cho Frontend/Mobile khi ghep API identity-service qua
api_gateway.

Nguyen tac ghep API cho FE
==========================

1. FE nen goi qua api_gateway, khong goi truc tiep identity-service noi bo.

   Vi du local:

   - Gateway base URL: http://localhost:<GATEWAY_PORT>
   - FE endpoint:      http://localhost:<GATEWAY_PORT>/api/auth/login

2. Public path FE dung qua gateway:

   - Auth:    /api/auth/*
   - Profile: /api/user/*

3. Direct path neu test thang vao identity-service:

   identity-service dang set global prefix: /api/identity

   - Gateway path: /api/auth/login
   - Direct path:  /api/identity/auth/login

   - Gateway path: /api/user/users/profile
   - Direct path:  /api/identity/user/users/profile

4. Auth token strategy hien tai:

   - accessToken nam trong response body cua login/refresh.
   - refresh_token nam trong httpOnly cookie, do backend set.
   - FE khong doc duoc httpOnly cookie bang JavaScript.
   - Khi goi login/refresh/logout, FE can bat credentials de trinh duyet gui/nhan cookie.

5. HTTP client rule:

   - KHONG duoc su dung axios.
   - FE su dung native fetch hoac wrapper noi bo build tren fetch.
   - Moi request can ghep URL tu gateway base URL + public path ben duoi.

   Vi du wrapper fetch:

   ```ts
   const gatewayBaseUrl = "http://localhost:<GATEWAY_PORT>";

   await fetch(`${gatewayBaseUrl}/api/auth/refresh`, {
     method: "POST",
     credentials: "include",
   });
   ```

6. API protected can header:

   Authorization: Bearer <accessToken>

7. Response success chung:

   ```json
   {
     "success": true,
     "code": 200,
     "data": {},
     "mess": "Message"
   }
   ```

8. Response error chung:

   ```json
   {
     "success": false,
     "code": 401,
     "mess": "Invalid access token",
     "data": null,
     "errors": ["Invalid access token"],
     "requestId": "some-request-id",
     "timestamp": "2026-04-17T10:00:00.000Z",
     "path": "/api/auth/change-password"
   }
   ```

9. Validation:

   Backend dung ValidationPipe voi whitelist va forbidNonWhitelisted.
   FE khong nen gui field thua ngoai DTO, neu khong request co the bi 400.


==================================================
1. AUTH APIs
==================================================

1.1) POST /api/auth/register

Muc dich:

- Buoc 1 dang ky tai khoan.
- Backend tao registration session, tao OTP, gui OTP qua email.
- API nay CHUA tao accessToken/refreshToken.

Auth:

- Public.
- Khong can Authorization header.

Body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Field:

- email: string, required, email.
- password: string, required, min 6.

Response:

- HTTP status: 201
- Body:

```json
{
  "success": true,
  "code": 201,
  "mess": "Registration successful",
  "data": {
    "message": "OTP sent to your email. Please verify to complete registration."
  }
}
```

FE flow:

- Sau khi register thanh cong, chuyen user sang man verify-email.
- Can giu lai email va password nguoi dung da nhap de gui tiep len verify-email.


1.2) POST /api/auth/verify-email

Muc dich:

- Buoc 2 xac minh OTP.
- Backend tao account va profile sau khi OTP dung.
- API nay hien tai CHUA tra token, FE can goi login sau khi verify thanh cong.

Auth:

- Public.
- Khong can Authorization header.

Body:

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "123456"
}
```

Field:

- email: string, required, email.
- otp: string, required, 6 ky tu.
- password: string, required, min 6.

Response:

- HTTP status: 200
- Body:

```json
{
  "success": true,
  "code": 200,
  "mess": "Email verified successfully",
  "data": {
    "message": "Registration successful. Your email has been verified."
  }
}
```

FE flow:

- Sau khi verify thanh cong, goi POST /api/auth/login de lay accessToken va
  set refresh_token cookie.


1.3) POST /api/auth/login

Muc dich:

- Dang nhap tai khoan da verify email.
- Backend tra accessToken trong body.
- Backend set refresh_token vao httpOnly cookie.

Auth:

- Public.
- Khong can Authorization header.

Body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Field:

- email: string, required, email.
- password: string, required.

Luu y:

- Controller lay IP tu request bang @Ip().
- FE khong can gui field ip.
- Neu FE gui field ip, backend co the reject do forbidNonWhitelisted tuy theo DTO.

Cookie:

- Set-Cookie: refresh_token=<token>
- httpOnly: true
- secure: true
- sameSite: strict
- maxAge: 3 ngay
- path: lay tu AUTH_COOKIE_PATH.
- .env.example dang de AUTH_COOKIE_PATH=/api/auth.

Response:

- HTTP status: 200
- Body KHONG co refreshToken.

```json
{
  "success": true,
  "code": 200,
  "mess": "Login successful",
  "data": {
    "accessToken": "jwt-access-token",
    "expiresIn": 900
  }
}
```

FE flow:

- Luu accessToken o state/memory hoac storage theo policy cua app.
- Khong tim refreshToken trong body.
- Bat withCredentials/credentials include de browser nhan cookie.


1.4) POST /api/auth/refresh

Muc dich:

- Cap accessToken moi bang refresh_token cookie.
- Backend doc refresh token tu cookie `refresh_token`, khong doc body.
- Backend rotate refresh token va set lai cookie moi.

Auth:

- Public o gateway.
- Khong can Authorization header.

Body:

- Khong gui body.

Cookie request:

- Browser tu gui cookie `refresh_token` neu FE bat credentials.

Response:

- HTTP status: 200
- Set-Cookie: refresh_token=<new-token>
- Body KHONG co refreshToken.

```json
{
  "success": true,
  "code": 200,
  "mess": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-access-token",
    "expiresIn": 900
  }
}
```

FE flow:

- Khi accessToken het han hoac gap 401 do token expired, goi refresh.
- Neu refresh thanh cong, cap nhat accessToken va retry request truoc do.
- Neu refresh that bai, clear local auth state va dieu huong ve login.


1.5) POST /api/auth/resend-otp

Muc dich:

- Gui lai OTP cho luong register hoac forgot password.

Auth:

- Public.
- Khong can Authorization header.

Body:

```json
{
  "email": "user@example.com",
  "type": "register"
}
```

Field:

- email: string, required, email.
- type: "register" | "forgot", required.

Response:

- HTTP status: 200

```json
{
  "success": true,
  "code": 200,
  "mess": "OTP sent successfully",
  "data": {
    "message": "OTP sent successfully"
  }
}
```

Luu y:

- Gia tri `data.message` phu thuoc use case.
- FE nen hien `mess` hoac `data.message`.


1.6) POST /api/auth/forgot-password

Muc dich:

- Yeu cau reset mat khau.
- Backend gui OTP/huong dan reset password qua email.

Auth:

- Public.
- Khong can Authorization header.

Body:

```json
{
  "email": "user@example.com"
}
```

Field:

- email: string, required, email.

Response:

- HTTP status: 200

```json
{
  "success": true,
  "code": 200,
  "mess": "Password reset instructions sent",
  "data": {
    "message": "If the email exists, a reset OTP will be sent"
  }
}
```


1.7) POST /api/auth/reset-password

Muc dich:

- Dat lai mat khau bang OTP.

Auth:

- Public.
- Khong can Authorization header.

Body:

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "new-password"
}
```

Field:

- email: string, required, email.
- otp: string, required, 6 ky tu.
- newPassword: string, required, min 6.

Response:

- HTTP status: 200

```json
{
  "success": true,
  "code": 200,
  "mess": "Password reset successful",
  "data": {
    "message": "Password reset successfully. Please login with your new password."
  }
}
```


1.8) POST /api/auth/change-password

Muc dich:

- Doi mat khau khi user da dang nhap.

Auth:

- Protected.
- Required header:

```http
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "oldPassword": "old-password",
  "newPassword": "new-password"
}
```

Field:

- oldPassword: string, required, min 6.
- newPassword: string, required, min 6.

System fields:

- userId lay tu accessToken da decode, FE khong gui userId.

Response:

- HTTP status: 200

```json
{
  "success": true,
  "code": 200,
  "mess": "Password changed successfully",
  "data": {
    "message": "Password changed successfully"
  }
}
```


1.9) POST /api/auth/logout

Muc dich:

- Dang xuat.
- Backend doc refresh_token tu cookie va revoke session.
- Backend clear cookie refresh_token.

Auth:

- Protected.
- Required header:

```http
Authorization: Bearer <accessToken>
```

Body:

- Khong gui body.

Cookie request:

- Browser tu gui cookie `refresh_token` neu FE bat credentials.

Response:

- HTTP status: 200
- Clear-Cookie: refresh_token voi path lay tu AUTH_COOKIE_PATH.

```json
{
  "success": true,
  "code": 200,
  "mess": "Logout successful",
  "data": {
    "message": "Logout successful"
  }
}
```

FE flow:

- Goi logout voi Authorization header va credentials include.
- Sau do clear accessToken local va dieu huong ve login.


==================================================
2. PROFILE APIs
==================================================

2.1) GET /api/user/users/profile

Muc dich:

- Lay ho so cua user hien tai.

Auth:

- Protected.
- Required header:

```http
Authorization: Bearer <accessToken>
```

Body:

- Khong gui body.

System fields:

- userId lay tu accessToken qua CurrentUserId, FE khong gui userId.

Response:

- HTTP status: 200
- Body CO boc ApiResponse.

```json
{
  "success": true,
  "code": 200,
  "mess": "Profile fetched successfully",
  "data": {
    "userId": "user-id",
    "email": "user@example.com",
    "displayName": "Nguyen Van A",
    "avatarUrl": "https://cdn.example.com/avatars/user-1.png",
    "bio": "I create short-form media content.",
    "phone": 84901234567,
    "gender": "male",
    "birthday": "1998-05-20T00:00:00.000Z",
    "isCreator": false,
    "createdAt": "2026-04-23T00:00:00.000Z",
    "updatedAt": "2026-04-23T00:00:00.000Z"
  }
}
```


2.2) PATCH /api/user/users/profile

Muc dich:

- Cap nhat ho so cua user hien tai.

Auth:

- Protected.
- Required header:

```http
Authorization: Bearer <accessToken>
```

Body:

Tat ca field deu optional, nhung FE chi nen gui field can update.

```json
{
  "displayName": "Nguyen Van A",
  "avatarUrl": "https://cdn.example.com/avatars/user-1.png",
  "bio": "I create short-form media content.",
  "phone": 84901234567,
  "gender": "male",
  "birthday": "1998-05-20"
}
```

Field:

- displayName: string, optional, maxLength 100.
- avatarUrl: string, optional, maxLength 512.
- bio: string, optional.
- phone: number, optional, integer, min 1.
- gender: "male" | "women" | "female", optional.
- birthday: string, optional, ISO date/date-time string.

System fields:

- userId lay tu accessToken qua CurrentUserId, FE khong gui userId.
- birthday duoc controller convert tu string sang Date.

Response:

- HTTP status: 200
- Body CO boc ApiResponse.

```json
{
  "success": true,
  "code": 200,
  "mess": "Profile updated successfully",
  "data": {
    "userId": "user-id",
    "email": "user@example.com",
    "displayName": "Nguyen Van A",
    "avatarUrl": "https://cdn.example.com/avatars/user-1.png",
    "bio": "I create short-form media content.",
    "phone": 84901234567,
    "gender": "male",
    "birthday": "1998-05-20T00:00:00.000Z",
    "isCreator": false,
    "createdAt": "2026-04-23T00:00:00.000Z",
    "updatedAt": "2026-04-23T00:00:00.000Z"
  }
}
```


==================================================
3. PUBLIC ROUTE SUMMARY FOR FE
==================================================

Public, khong can Authorization:

- POST /api/auth/register
- POST /api/auth/verify-email
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/resend-otp
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

Protected, can Authorization Bearer:

- POST /api/auth/change-password
- POST /api/auth/logout
- GET /api/user/users/profile
- PATCH /api/user/users/profile


==================================================
4. FRONTEND AUTH FLOW GOI Y
==================================================

Register flow:

1. POST /api/auth/register
2. User nhap OTP tu email
3. POST /api/auth/verify-email
4. POST /api/auth/login
5. Luu accessToken tu body, refresh_token tu cookie se do browser quan ly

Login flow:

1. POST /api/auth/login voi credentials include
2. Luu data.accessToken
3. Goi protected API voi Authorization Bearer

Refresh flow:

1. POST /api/auth/refresh voi credentials include, khong body
2. Neu success, cap nhat data.accessToken
3. Neu fail, clear auth state va ve login

Logout flow:

1. POST /api/auth/logout voi Authorization Bearer va credentials include
2. Clear accessToken local
