-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterEnum (add BUSINESS to Plan)
ALTER TYPE "Plan" ADD VALUE 'BUSINESS';

-- CreateTable Organization
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrganizationMember
CREATE TABLE "OrganizationMember" (
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("userId","orgId")
);

-- CreateTable CardDailyStats
CREATE TABLE "CardDailyStats" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "taps" INTEGER NOT NULL DEFAULT 0,
    "vcardDownloads" INTEGER NOT NULL DEFAULT 0,
    "passDownloads" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CardDailyStats_pkey" PRIMARY KEY ("id")
);

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "orgId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customLogoUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "themeColor" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CardDailyStats_cardId_date_key" ON "CardDailyStats"("cardId", "date");
CREATE INDEX "CardDailyStats_cardId_idx" ON "CardDailyStats"("cardId");

-- AddForeignKey Organization
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey OrganizationMember
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey User.orgId
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey CardDailyStats
ALTER TABLE "CardDailyStats" ADD CONSTRAINT "CardDailyStats_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
