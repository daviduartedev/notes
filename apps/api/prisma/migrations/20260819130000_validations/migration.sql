-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('draft', 'requested', 'in_review', 'changes_requested', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "ValidationType" AS ENUM ('prototype', 'staging', 'production', 'feature', 'delivery');

-- CreateTable
CREATE TABLE "Validation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stageId" TEXT,
    "type" "ValidationType" NOT NULL,
    "reviewerUserId" TEXT,
    "requesterUserId" TEXT NOT NULL,
    "environment" TEXT,
    "status" "ValidationStatus" NOT NULL DEFAULT 'draft',
    "requestedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "resultNotes" TEXT,
    "checklistId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Validation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Validation_workspaceId_idx" ON "Validation"("workspaceId");

-- CreateIndex
CREATE INDEX "Validation_projectId_idx" ON "Validation"("projectId");

-- CreateIndex
CREATE INDEX "Validation_workspaceId_status_idx" ON "Validation"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Validation_reviewerUserId_idx" ON "Validation"("reviewerUserId");

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
