CREATE TYPE "EmailNotificationKind" AS ENUM ('DRAFT_READY', 'PAYMENT_REQUIRED', 'ORDER_SHIPPED');

CREATE TYPE "EmailNotificationStatus" AS ENUM ('PROCESSING', 'SENT', 'FAILED');

CREATE TABLE "EmailNotificationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "EmailNotificationKind" NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "deliveryStatus" "EmailNotificationStatus" NOT NULL DEFAULT 'PROCESSING',
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailNotificationEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailNotificationEvent_dedupeKey_key" ON "EmailNotificationEvent"("dedupeKey");
CREATE INDEX "EmailNotificationEvent_userId_kind_createdAt_idx" ON "EmailNotificationEvent"("userId", "kind", "createdAt");
CREATE INDEX "EmailNotificationEvent_resourceId_kind_idx" ON "EmailNotificationEvent"("resourceId", "kind");

ALTER TABLE "EmailNotificationEvent" ADD CONSTRAINT "EmailNotificationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
