# Lifecycle Email Contract

This document defines the first lifecycle email triggers that build on the shared email delivery layer.

## Current Scope

The current implementation sends one-time lifecycle emails for:

- draft ready for review
- payment required after draft-to-order conversion
- order shipped after provider status sync

These emails are deduplicated per business event through a persisted notification log.

## Trigger Rules

### Draft ready

Trigger:

- a scheduled draft is materialized into `READY_FOR_REVIEW`

Dedupe key:

- `draft_ready:<draftId>`

### Payment required

Trigger:

- an approved draft is converted into an order with `status = AWAITING_PAYMENT`

Dedupe key:

- `payment_required:<orderId>`

### Order shipped

Trigger:

- provider status sync reaches `SHIPPED`

Dedupe key:

- `order_shipped:<orderId>`

## Delivery Modes

- `EMAIL_DELIVERY_MODE=preview`
  - lifecycle emails are processed through the shared mailer but not sent to a real provider
- `EMAIL_DELIVERY_MODE=resend`
  - lifecycle emails are sent through Resend

## Current Limitations

- no customer-facing resend UI yet
- no dedicated retry queue beyond re-triggering a previously failed notification
- no delivered or fulfillment-failed lifecycle emails yet
