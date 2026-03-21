# Redeemption

Redeemption is a monorepo for an automated physical-mail product:

- users manage contacts and addresses
- users configure moments that should trigger a mailed card
- the system prepares personalized drafts and previews
- users approve and pay
- paid orders are sent to a print/fulfillment provider

## Current State

The project is no longer in scaffold mode. These slices are already implemented:

- repo governance, CI, deploy workflow scaffolding, and contributor standards
- auth, password reset, and sender-profile readiness
- contacts, addresses, and contact-address linking
- template catalog, template editor, and one-photo upload
- storage-backed upload metadata
- server preview rendering
- moments rule creation and draft materialization baseline

The project is not feature-complete yet. The missing business-critical path is:

1. draft review and approval
2. background scheduling
3. order domain
4. pricing and checkout
5. fulfillment
6. lifecycle notifications

## Source Of Truth

Use these files in this order:

1. [`docs/GITHUB_ISSUES_MVP.md`](./docs/GITHUB_ISSUES_MVP.md)
2. [`docs/PRODUCT_PROPOSAL.md`](./docs/PRODUCT_PROPOSAL.md)
3. [`docs/ISSUE_OPERATIONS.md`](./docs/ISSUE_OPERATIONS.md)
4. [`CONTRIBUTING.md`](./CONTRIBUTING.md)

The live GitHub tracker must match the focused execution plan in those documents. If GitHub says one thing and the docs say another, fix the tracker immediately.

## Focused MVP Path

The blunt MVP path from here is:

1. fix deployment truth and production configuration drift
2. move draft generation to background scheduling
3. add draft review, approve, skip, snooze, and re-edit flow
4. add an order domain and draft-to-order conversion
5. implement pricing
6. integrate checkout and payment webhooks
7. generate immutable printable assets for orders
8. submit paid orders to the print provider and track status
9. add lifecycle email delivery

Explicitly deferred from the critical path:

- CSV import
- admin tooling
- advanced address validation
- subscriptions
- AI suggestions
- multi-sender flows
- compliance extras beyond basic placeholders

## Local Development

Use Node `22` from [`.nvmrc`](./.nvmrc).

Start local infrastructure:

```bash
npm run infra:up
```

Apply database migrations:

```bash
npm -w api run db:migrate:deploy
```

Run the app locally:

```bash
npm run dev
```

Run the worker locally:

```bash
npm run dev:worker
```

## Verification

Full repository verification:

```bash
npm run verify
```

Common targeted checks:

```bash
npm -w api test
npm -w api run test:e2e
npm -w web test
npm -w web run build
npm -w worker run build
```

## Delivery Discipline

These rules are mandatory if the goal is to finish the product efficiently:

- keep GitHub issues as the only live execution tracker
- keep one active product issue at a time
- keep one active ops issue at a time
- do not start code without a linked issue
- define acceptance criteria and verification commands before implementation
- treat "done" as merged, verified, and deploy-understood
- defer anything that does not move the path from contact to fulfilled order
