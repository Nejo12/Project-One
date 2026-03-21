ALTER TYPE "OrderStatus" ADD VALUE 'FULFILLMENT_FAILED';

CREATE TYPE "ProviderFulfillmentStatus" AS ENUM (
  'QUEUED',
  'IN_PRODUCTION',
  'SHIPPED',
  'DELIVERED',
  'FAILED'
);

ALTER TABLE "Order"
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "fulfillmentStatusSyncedAt" TIMESTAMP(3),
ADD COLUMN "providerFulfillmentStatus" "ProviderFulfillmentStatus",
ADD COLUMN "shipmentTrackingNumber" TEXT,
ADD COLUMN "shipmentTrackingUrl" TEXT;

CREATE INDEX "Order_userId_providerFulfillmentStatus_createdAt_idx"
ON "Order"("userId", "providerFulfillmentStatus", "createdAt");
