-- CreateEnum
CREATE TYPE "BlockerStatus" AS ENUM ('open', 'resolved', 'cancelled');

-- CreateEnum
CREATE TYPE "BlockerAssigneeKind" AS ENUM ('internal', 'client');

-- CreateTable
CREATE TABLE "Blocker" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assigneeKind" "BlockerAssigneeKind" NOT NULL,
    "assigneeUserId" TEXT,
    "blocksStageId" TEXT,
    "blocksProject" BOOLEAN NOT NULL DEFAULT false,
    "status" "BlockerStatus" NOT NULL DEFAULT 'open',
    "dueDate" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "sourceMeetingId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blocker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Blocker_workspaceId_idx" ON "Blocker"("workspaceId");

-- CreateIndex
CREATE INDEX "Blocker_projectId_idx" ON "Blocker"("projectId");

-- CreateIndex
CREATE INDEX "Blocker_workspaceId_status_idx" ON "Blocker"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Blocker_assigneeUserId_idx" ON "Blocker"("assigneeUserId");

-- AddForeignKey
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_blocksStageId_fkey" FOREIGN KEY ("blocksStageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
