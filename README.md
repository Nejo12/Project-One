# Mail a Moment

Mail a Moment is a monorepo for an automated physical-mail product:

- users manage contacts and addresses
- users configure moments that should trigger a mailed card
- the system prepares personalized drafts and previews
- users approve and pay
- paid orders are sent to a print/fulfillment provider

## Current State

The core MVP order pipeline now exists in code. These slices are already implemented:

- repo governance, CI, deploy workflow scaffolding, and contributor standards
- auth, password reset, and sender-profile readiness
- contacts, addresses, and contact-address linking
- template catalog, template editor, and one-photo upload
- storage-backed upload metadata
- server preview rendering and immutable printable order assets
- background scheduling for due drafts
- draft review, approve, skip, snooze, and re-edit flows
- order conversion, pricing, Stripe checkout, and webhook handling
- fulfillment submission and provider status synchronization
- provider-backed auth email delivery support via Resend-compatible API mode
- lifecycle emails for draft-ready, payment-required, and shipped states

Deployments are currently owned by the providers:

- Vercel native Git deployment for `web`
- Railway native Git deployment for `api` and `worker`

GitHub deploy workflows are kept as manual fallback workflows, not as the default deployment path.

The product is now in launch-hardening mode rather than feature-foundation mode.

Current live truth:

- the production web is still reachable on the Vercel fallback domain
- `mailamoment.com` is the intended public brand and canonical domain
- the GitHub repository slug is still `redeemption` until a deliberate repo rename happens

The remaining business-critical work is:

1. cut over `mailamoment.com` cleanly across Vercel, Railway, and Resend
2. align public-facing brand copy, sender identity, and app metadata to Mail a Moment
3. ship a clean logo/icon/favicon system for launch surfaces
4. run end-to-end production validation and fix launch blockers
5. optionally clean up internal slug drift after the public cutover is stable

## Source Of Truth

Use these files in this order:

1. [`docs/GITHUB_ISSUES_MVP.md`](./docs/GITHUB_ISSUES_MVP.md)
2. [`docs/PRODUCT_PROPOSAL.md`](./docs/PRODUCT_PROPOSAL.md)
3. [`docs/ISSUE_OPERATIONS.md`](./docs/ISSUE_OPERATIONS.md)
4. [`CONTRIBUTING.md`](./CONTRIBUTING.md)

The live GitHub tracker must match the focused execution plan in those documents. If GitHub says one thing and the docs say another, fix the tracker immediately.

## Focused MVP Path

The blunt launch path from here is:

1. cut over `mailamoment.com` across the product stack
2. align public-facing brand copy, metadata, and email subjects to Mail a Moment
3. ship launch-ready logo, icon, and favicon assets
4. run end-to-end production readiness checks and fix any blockers
5. decide whether to rename the repository slug after launch stabilization

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
