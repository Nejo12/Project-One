# Fulfillment API Contract

This slice introduces the first paid-order submission boundary to a print-provider adapter.

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
- `fulfillmentSubmittedAt`
- `fulfillmentAttemptCount`
- `lastFulfillmentError`

Notes:

- this slice stops at provider submission
- provider webhook or polling status sync lands in the next fulfillment slice
- a real provider can replace the sandbox adapter without changing the worker-triggered API contract
