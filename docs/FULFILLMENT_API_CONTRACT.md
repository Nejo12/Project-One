# Fulfillment API Contract

This slice covers paid-order provider submission plus provider-status polling.

Current behavior:

- only paid orders with `printableAssetStatus = READY` are eligible
- worker-triggered internal processing claims eligible orders in batches
- successful submission moves the order to:
  - `status = FULFILLMENT_PENDING`
  - `fulfillmentSubmissionStatus = SUBMITTED`
- failed submission moves the order to:
  - `fulfillmentSubmissionStatus = FAILED`
  - `lastFulfillmentError = ...`
- provider request/response logs are persisted in redacted form
- submitted orders are polled by the worker through an internal sync endpoint
- provider status updates map to internal order lifecycle:
  - `QUEUED` or `IN_PRODUCTION` -> `FULFILLMENT_PENDING`
  - `SHIPPED` -> `FULFILLMENT_PENDING` with tracking data
  - `DELIVERED` -> `FULFILLED`
  - `FAILED` -> `FULFILLMENT_FAILED`
- the first `SHIPPED` state now also triggers a one-time lifecycle email with tracking data when available

Current provider mode:

- `PRINT_PROVIDER_MODE=sandbox`
- the sandbox adapter simulates:
  - provider order creation
  - printable asset handoff
  - provider reference assignment

Stored order fields now include:

- `providerName`
- `providerOrderReference`
- `providerAssetReference`
- `providerFulfillmentStatus`
- `fulfillmentStatusSyncedAt`
- `shipmentTrackingNumber`
- `shipmentTrackingUrl`
- `deliveredAt`
- `fulfillmentSubmittedAt`
- `fulfillmentAttemptCount`
- `lastFulfillmentError`

Notes:

- this MVP uses polling rather than provider webhooks
- the sandbox provider simulates a progression from queued -> in production -> shipped -> delivered
- a real provider can replace the sandbox adapter without changing the worker-triggered API contract
