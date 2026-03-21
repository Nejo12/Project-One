# Issue Operations

This document defines how the backlog in [`docs/GITHUB_ISSUES_MVP.md`](./GITHUB_ISSUES_MVP.md) should be turned into tracked GitHub issues.

## Current Rule

The repository is past initial bootstrap. The live GitHub tracker should now be managed as an execution board, not as a passive copy of every planning idea.

Use this blunt rule:

- keep only the issues that move the product toward a real MVP order flow
- close delivered slices quickly
- defer non-critical ideas instead of keeping them open
- treat GitHub as the single live execution tracker

## Goals

- Create issues in a predictable order.
- Seed epics and foundational tasks first.
- Keep milestones and labels aligned with the repository setup docs.
- Avoid manually retyping issue content from planning documents.

## Creation Order

Create issues in this order:

1. Create labels and milestones from [`docs/GITHUB_REPOSITORY_SETUP.md`](./GITHUB_REPOSITORY_SETUP.md).
2. Seed the epic issues.
3. Seed phase-0 and phase-1 implementation tasks.
4. Create detailed user stories only when the team is ready to work on the corresponding phase.

This keeps the tracker useful without flooding the repository with low-signal issues too early.

## Focused Execution Order

The current launch-critical order is:

1. `EPIC: Launch Mail a Moment on the production domain`
2. `US: cut over mailamoment.com across Vercel, Railway, and Resend`
3. `US: align public-facing brand copy, metadata, and email subjects`
4. `US: ship launch-ready logo, icon, and favicon assets`
5. `US: run end-to-end production readiness validation`
6. `chore: optionally rename repo/package slugs after the public cutover is stable`

Anything outside that path should be treated as deferred unless it blocks delivery.

## Seed Data

The repository includes an issue seed file at [`scripts/github/issue-seed.json`](../scripts/github/issue-seed.json).

It currently contains:

- all major product epics
- initial phase-0 setup issues
- initial phase-1 foundational implementation issues

## Scripts

Dry run the issue plan:

```bash
npm run issues:seed
```

Preview the full GitHub bootstrap plan:

```bash
npm run github:bootstrap
```

Create the issues on GitHub:

```bash
npm run issues:seed:apply
```

Create labels, milestones, and issues in the correct order:

```bash
npm run github:bootstrap:apply
```

By default the script:

- reads [`scripts/github/issue-seed.json`](../scripts/github/issue-seed.json)
- prints the issue plan in dry-run mode
- requires `gh` only when `--apply` is used
- validates that referenced labels and milestones already exist before creating issues
- skips issues that already exist by exact title

## Required External Setup

Before applying the seed:

1. Install and authenticate the GitHub CLI.
2. Confirm the repo remote points to the correct GitHub repository.
3. Create the labels and milestones first, or use `npm run github:bootstrap:apply`.

## Maintenance Rules

- Update the seed file when epic titles or milestone names change.
- Keep the seed focused on epics and near-term implementation issues.
- Do not add every future subtask to the seed file up front.
- Keep issue bodies short, actionable, and linked back to the planning documents when needed.
- Keep at most one active product issue and one active ops issue at a time.
- Every implementation issue must include acceptance criteria, explicit out-of-scope notes, and verification commands.
- If an issue becomes larger than one focused delivery slice, split it before implementation drifts.
- Close completed feature-delivery issues quickly once the code is merged and verified so the tracker reflects the actual remaining launch work.
