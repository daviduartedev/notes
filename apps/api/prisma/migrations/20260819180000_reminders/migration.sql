-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('scheduled', 'due', 'done', 'snoozed', 'cancelled');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('internal');

-- CreateEnum
CREATE TYPE "ReminderSubjectType" AS ENUM ('project', 'client');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN "lastInteractionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "lastInteractionAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "subjectType" "ReminderSubjectType" NOT NULL,
    "subjectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "channel" "ReminderChannel" NOT NULL DEFAULT 'internal',
    "policyKey" TEXT,
    "status" "ReminderStatus" NOT NULL DEFAULT 'scheduled',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "snoozedUntil" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "draftMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_workspaceId_idx" ON "Reminder"("workspaceId");

-- CreateIndex
CREATE INDEX "Reminder_workspaceId_status_idx" ON "Reminder"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Reminder_projectId_idx" ON "Reminder"("projectId");

-- CreateIndex
CREATE INDEX "Reminder_clientId_idx" ON "Reminder"("clientId");

-- CreateIndex
CREATE INDEX "Reminder_policyKey_idx" ON "Reminder"("policyKey");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
