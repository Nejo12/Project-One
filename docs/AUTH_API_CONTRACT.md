# Auth API Contract

This document defines the first browser-to-API contract for auth flows in the Nest API.

## Goals

- keep the auth boundary explicit before UI implementation starts
- let the web app integrate against stable routes and response shapes
- separate preview-mode bootstrap behavior from production email delivery

## Routes

### `POST /auth/signup`

Creates a pending user account and a verification token record.

Request body:

```json
{
  "email": "user@example.com",
  "password": "strong-password",
  "displayName": "User Name"
}
```

Response:

- `user`
- `nextStep`
- `verification` token preview only when `EMAIL_DELIVERY_MODE=preview`

### `POST /auth/verify-email`

Consumes a verification token, activates the user, and returns a session.

Request body:

```json
{
  "token": "verification-token"
}
```

Response:

- `user`
- `session`

### `POST /auth/login`

Authenticates an active verified user and returns a session.

### `POST /auth/password-reset/request`

Creates a password reset token for an active verified user.

Response is intentionally generic:

- always returns `accepted: true`
- includes a `reset` token preview only when `EMAIL_DELIVERY_MODE=preview`

### `POST /auth/password-reset/confirm`

Consumes a password reset token, updates the password hash, and returns a fresh session.

### `GET /auth/me`

Returns the current session user.

Headers:

```http
Authorization: Bearer <access-token>
```

## Session Strategy

- access tokens are signed with `JWT_SECRET`
- the current implementation uses an HMAC-signed bearer token
- access token TTL is seven days
- only active verified users receive sessions

## Preview-Mode Bootstrap Behavior

When `EMAIL_DELIVERY_MODE=preview`, the API exposes token previews for local development and test integration:

- signup response may include `verification`
- password reset request response may include `reset`

When `EMAIL_DELIVERY_MODE=resend`, the API sends verification and reset emails through Resend and does not expose preview tokens in responses.

These preview fields must not be relied on in production.

## Next Backend Steps

1. add refresh/session revocation strategy if the product needs longer-lived sessions
2. reuse the email delivery boundary for lifecycle mail flows
3. add auth guards around protected domain routes as those modules are introduced
4. connect the web app to these routes with typed client calls
