# Issue Operations

This document defines how the backlog in [`docs/GITHUB_ISSUES_MVP.md`](./GITHUB_ISSUES_MVP.md) should be turned into tracked GitHub issues.

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

Create the issues on GitHub:

```bash
npm run issues:seed:apply
```

By default the script:

- reads [`scripts/github/issue-seed.json`](../scripts/github/issue-seed.json)
- prints the issue plan in dry-run mode
- requires `gh` only when `--apply` is used
- skips issues that already exist by exact title

## Required External Setup

Before applying the seed:

1. Install and authenticate the GitHub CLI.
2. Confirm the repo remote points to the correct GitHub repository.
3. Create the labels and milestones first.

## Maintenance Rules

- Update the seed file when epic titles or milestone names change.
- Keep the seed focused on epics and near-term implementation issues.
- Do not add every future subtask to the seed file up front.
- Keep issue bodies short, actionable, and linked back to the planning documents when needed.
