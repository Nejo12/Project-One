-- CreateEnum
CREATE TYPE "StoredObjectKind" AS ENUM ('PHOTO_UPLOAD', 'RENDER_ARTIFACT');

-- CreateTable
CREATE TABLE "StoredObject" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "kind" "StoredObjectKind" NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "originalFilename" TEXT,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoredObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoredObject_objectKey_key" ON "StoredObject"("objectKey");

-- CreateIndex
CREATE INDEX "StoredObject_userId_kind_createdAt_idx" ON "StoredObject"("userId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "StoredObject_kind_createdAt_idx" ON "StoredObject"("kind", "createdAt");

-- AddForeignKey
ALTER TABLE "StoredObject" ADD CONSTRAINT "StoredObject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
