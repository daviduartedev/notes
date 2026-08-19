-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('kickoff', 'scope_alignment', 'prototype_review', 'staging_validation', 'production_validation', 'delivery');

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MeetingType" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "participantUserIds" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "decisions" TEXT,
    "nextSteps" TEXT,
    "clientId" TEXT,
    "projectId" TEXT,
    "stageId" TEXT,
    "validationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_workspaceId_idx" ON "Meeting"("workspaceId");

-- CreateIndex
CREATE INDEX "Meeting_projectId_idx" ON "Meeting"("projectId");

-- CreateIndex
CREATE INDEX "Meeting_clientId_idx" ON "Meeting"("clientId");

-- CreateIndex
CREATE INDEX "Meeting_validationId_idx" ON "Meeting"("validationId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_validationId_fkey" FOREIGN KEY ("validationId") REFERENCES "Validation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
