# Auth API Contract

This document defines the first browser-to-API contract for auth flows in the Nest API.

## Goals

- keep the auth boundary explicit before UI implementation starts
- let the web app integrate against stable routes and response shapes
- separate temporary bootstrap behavior from long-term production behavior

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
- development-only `verification` token preview until email delivery exists

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
- includes a development-only `reset` token preview until email delivery exists

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

## Development-Only Bootstrap Behavior

Until an email provider is integrated, the API exposes token previews in non-production environments:

- signup response may include `verification`
- password reset request response may include `reset`

These preview fields are for local development and test integration only. They must not be relied on in production.

## Next Backend Steps

1. add refresh/session revocation strategy if the product needs longer-lived sessions
2. integrate email delivery for verification and password reset
3. add auth guards around protected domain routes as those modules are introduced
4. connect the web app to these routes with typed client calls
