# ADR 0003: API Uses Prisma With PostgreSQL

## Status

Accepted

## Context

The API needs a deterministic persistence foundation before domain modules like auth, contacts, and orders can be implemented. The repository already standardizes on typed workflows, migration-backed changes, and explicit local infrastructure.

## Decision

The API will use Prisma as its ORM and migration tool, backed by PostgreSQL.

The initial schema boundary covers:

- `User`
- `SenderProfile`
- `EmailVerificationToken`
- `PasswordResetToken`

This boundary is intentionally narrow. It supports the first auth and onboarding work without prematurely modeling later product domains.

## Consequences

Positive:

- typed database client generated from the schema
- migration history committed in the repository
- straightforward local Postgres workflow for development and CI expansion later

Negative:

- Prisma becomes a concrete infrastructure choice that would require migration effort to replace
- future schema changes should be disciplined so the early auth model does not become a dumping ground for unrelated concerns
