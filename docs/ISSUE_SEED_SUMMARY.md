# Issue Seed Summary

The repository now includes a seed file and helper script for creating the first GitHub issues.

It also includes tracked label and milestone seeds so the GitHub backlog can be bootstrapped in the correct order.

## Included In The Seed

- all product epics from the MVP backlog
- phase-0 setup issues needed before implementation accelerates
- initial phase-1 backend foundation issues

## Files

- issue creation guide: [`docs/ISSUE_OPERATIONS.md`](./ISSUE_OPERATIONS.md)
- label seed data: [`scripts/github/label-seed.json`](../scripts/github/label-seed.json)
- milestone seed data: [`scripts/github/milestone-seed.json`](../scripts/github/milestone-seed.json)
- issue seed data: [`scripts/github/issue-seed.json`](../scripts/github/issue-seed.json)
- label sync script: [`scripts/github/sync-labels.mjs`](../scripts/github/sync-labels.mjs)
- milestone sync script: [`scripts/github/sync-milestones.mjs`](../scripts/github/sync-milestones.mjs)
- creation script: [`scripts/github/create-issues.mjs`](../scripts/github/create-issues.mjs)

## Commands

Preview the issue plan:

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

Apply labels, milestones, and issues in order:

```bash
npm run github:bootstrap:apply
```

## Action Required From You

To create the issues on GitHub, you still need to:

1. Install and authenticate `gh`.
2. Run `npm run github:bootstrap:apply`, or apply labels and milestones before issues.

The repo-side preparation is complete even if those external GitHub actions have not been performed yet.
