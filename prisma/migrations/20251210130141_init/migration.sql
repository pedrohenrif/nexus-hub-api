-- AlterTable
ALTER TABLE "ServerEnvironment" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isOnPremise" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "ram" TEXT,
ADD COLUMN     "storage" TEXT,
ADD COLUMN     "vCPU" TEXT;
