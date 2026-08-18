-- CreateEnum
CREATE TYPE "StagePhase" AS ENUM ('commercial', 'design', 'development');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('pending', 'in_progress', 'waiting', 'blocked', 'completed', 'skipped');

-- CreateTable
CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageTemplate" (
    "id" TEXT NOT NULL,
    "workflowTemplateId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "phase" "StagePhase" NOT NULL,
    "order" INTEGER NOT NULL,
    "allowedNextKeys" JSONB NOT NULL,
    "entryCriteria" TEXT NOT NULL,
    "exitCriteria" TEXT NOT NULL,

    CONSTRAINT "StageTemplate_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "workflowTemplateId" TEXT,
ADD COLUMN "currentStageId" TEXT;

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stageTemplateId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "phase" "StagePhase" NOT NULL,
    "order" INTEGER NOT NULL,
    "allowedNextKeys" JSONB NOT NULL,
    "entryCriteria" TEXT NOT NULL,
    "exitCriteria" TEXT NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplate_workspaceId_key_key" ON "WorkflowTemplate"("workspaceId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "StageTemplate_workflowTemplateId_key_key" ON "StageTemplate"("workflowTemplateId", "key");

-- CreateIndex
CREATE INDEX "StageTemplate_workflowTemplateId_order_idx" ON "StageTemplate"("workflowTemplateId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Project_currentStageId_key" ON "Project"("currentStageId");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_projectId_key_key" ON "Stage"("projectId", "key");

-- CreateIndex
CREATE INDEX "Stage_workspaceId_projectId_idx" ON "Stage"("workspaceId", "projectId");

-- AddForeignKey
ALTER TABLE "WorkflowTemplate" ADD CONSTRAINT "WorkflowTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTemplate" ADD CONSTRAINT "StageTemplate_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "WorkflowTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "WorkflowTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
