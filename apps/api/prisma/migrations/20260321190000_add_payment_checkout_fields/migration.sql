CREATE TYPE "ShippingType" AS ENUM ('STANDARD', 'PRIORITY');

CREATE TYPE "ShippingZone" AS ENUM ('DOMESTIC', 'INTERNATIONAL');

ALTER TABLE "Order"
ADD COLUMN "shippingType" "ShippingType",
ADD COLUMN "shippingZone" "ShippingZone",
ADD COLUMN "currency" TEXT,
ADD COLUMN "subtotalCents" INTEGER,
ADD COLUMN "taxCents" INTEGER,
ADD COLUMN "totalCents" INTEGER,
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "lastPaymentError" TEXT;

CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key"
ON "Order"("stripeCheckoutSessionId");

CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key"
ON "Order"("stripePaymentIntentId");

CREATE TABLE "PaymentWebhookEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "stripeEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentWebhookEvent_stripeEventId_key"
ON "PaymentWebhookEvent"("stripeEventId");

CREATE INDEX "PaymentWebhookEvent_eventType_processedAt_idx"
ON "PaymentWebhookEvent"("eventType", "processedAt");

ALTER TABLE "PaymentWebhookEvent"
ADD CONSTRAINT "PaymentWebhookEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
