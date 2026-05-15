-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultCycleLength" INTEGER NOT NULL DEFAULT 28,
ADD COLUMN     "defaultPeriodLength" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "onboardedAt" TIMESTAMP(3);
