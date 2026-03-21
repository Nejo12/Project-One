CREATE TYPE "FulfillmentSubmissionStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUBMITTED', 'FAILED');

ALTER TABLE "Order"
ADD COLUMN "fulfillmentAttemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "fulfillmentSubmissionStatus" "FulfillmentSubmissionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "fulfillmentSubmittedAt" TIMESTAMP(3),
ADD COLUMN "lastFulfillmentError" TEXT,
ADD COLUMN "providerAssetReference" TEXT,
ADD COLUMN "providerName" TEXT,
ADD COLUMN "providerOrderReference" TEXT;

CREATE TABLE "FulfillmentProviderLog" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "providerName" TEXT NOT NULL,
  "requestPayload" JSONB NOT NULL,
  "responsePayload" JSONB NOT NULL,
  "succeeded" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FulfillmentProviderLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_providerOrderReference_key" ON "Order"("providerOrderReference");
CREATE INDEX "Order_userId_fulfillmentSubmissionStatus_createdAt_idx" ON "Order"("userId", "fulfillmentSubmissionStatus", "createdAt");
CREATE INDEX "Order_contactId_idx" ON "Order"("contactId");
CREATE INDEX "FulfillmentProviderLog_orderId_createdAt_idx" ON "FulfillmentProviderLog"("orderId", "createdAt");
CREATE INDEX "FulfillmentProviderLog_providerName_createdAt_idx" ON "FulfillmentProviderLog"("providerName", "createdAt");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FulfillmentProviderLog"
ADD CONSTRAINT "FulfillmentProviderLog_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FulfillmentProviderLog"
ADD CONSTRAINT "FulfillmentProviderLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
