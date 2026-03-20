# Issue Seed Summary

The repository now includes a seed file and helper script for creating the first GitHub issues.

## Included In The Seed

- all product epics from the MVP backlog
- phase-0 setup issues needed before implementation accelerates
- initial phase-1 backend foundation issues

## Files

- issue creation guide: [`docs/ISSUE_OPERATIONS.md`](./ISSUE_OPERATIONS.md)
- issue seed data: [`scripts/github/issue-seed.json`](../scripts/github/issue-seed.json)
- creation script: [`scripts/github/create-issues.mjs`](../scripts/github/create-issues.mjs)

## Commands

Preview the issue plan:

```bash
npm run issues:seed
```

Create the issues on GitHub:

```bash
npm run issues:seed:apply
```

## Action Required From You

To create the issues on GitHub, you still need to:

1. Install and authenticate `gh`.
2. Confirm labels and milestones already exist in the repository.
3. Run `npm run issues:seed:apply`.

The repo-side preparation is complete even if those external GitHub actions have not been performed yet.
