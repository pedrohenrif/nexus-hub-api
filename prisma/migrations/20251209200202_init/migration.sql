-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerEnvironment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "accessId" TEXT NOT NULL,
    "accessPassword" TEXT,
    "hasFixedIp" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "serverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerEnvironment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServerEnvironment" ADD CONSTRAINT "ServerEnvironment_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
