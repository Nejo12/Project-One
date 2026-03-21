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

The current MVP-critical order is:

1. `chore(ops): fix production CORS and deployment workflow reliability`
2. `US-4.2: move draft generation to background scheduling`
3. `US-4.3: manage drafts with approve, edit, skip, and snooze`
4. `US-6.0: add order domain and draft-to-order conversion`
5. `US-6.1: implement pricing engine`
6. `US-6.2: integrate Stripe checkout and webhooks`
7. `US-3.3 follow-up: generate immutable printable assets for orders`
8. `US-7.1: submit paid orders to print provider with asset upload`
9. `US-7.2: sync fulfillment status from provider`
10. `US-1.1 follow-up: add provider-backed email verification delivery`
11. `EPIC-5 / US-5.1: lifecycle email notifications`

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
