-- CreateEnum
CREATE TYPE "CpaQualificationRule" AS ENUM ('DEPOSIT_ONLY', 'DEPOSIT_AND_ACTIVITY');

-- AlterTable
ALTER TABLE "Indication" ADD COLUMN     "betCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstDepositAmount" DECIMAL(12,2),
ADD COLUMN     "firstDepositAt" TIMESTAMP(3),
ADD COLUMN     "totalGgr" DECIMAL(12,2) NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "activeCpaRule" "CpaQualificationRule" NOT NULL DEFAULT 'DEPOSIT_AND_ACTIVITY',
    "cpaMinimumDeposit" DECIMAL(12,2) NOT NULL DEFAULT 30.00,
    "cpaActivityBetCount" INTEGER NOT NULL DEFAULT 10,
    "cpaActivityMinGgr" DECIMAL(12,2) NOT NULL DEFAULT 20.00,
    "cpaCommissionAmount" DECIMAL(12,2) NOT NULL DEFAULT 50.00,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_id_key" ON "SystemSettings"("id");
