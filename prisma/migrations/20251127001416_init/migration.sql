-- CreateTable
CREATE TABLE "TimelinePhase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "estimatedHours" INTEGER DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelinePhase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimelinePhase" ADD CONSTRAINT "TimelinePhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
