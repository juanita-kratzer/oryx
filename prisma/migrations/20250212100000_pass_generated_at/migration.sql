-- AlterTable
ALTER TABLE "Pass" ADD COLUMN IF NOT EXISTS "generatedAt" TIMESTAMP(3);

-- Backfill: set generatedAt = createdAt for existing rows
UPDATE "Pass" SET "generatedAt" = "createdAt" WHERE "generatedAt" IS NULL;
