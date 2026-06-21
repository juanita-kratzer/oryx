-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firebaseUid" TEXT;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Card_externalId_key" ON "Card"("externalId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "BusinessCardExchange" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "notes" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'public_landing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessCardExchange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BusinessCardExchange_ownerId_createdAt_idx" ON "BusinessCardExchange"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BusinessCardExchange_cardId_createdAt_idx" ON "BusinessCardExchange"("cardId", "createdAt" DESC);

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "BusinessCardExchange" ADD CONSTRAINT "BusinessCardExchange_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusinessCardExchange" ADD CONSTRAINT "BusinessCardExchange_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
