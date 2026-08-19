-- AlterTable
ALTER TABLE "WorkflowTemplate" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- Existing SaaS seed becomes the workspace default
UPDATE "WorkflowTemplate" SET "isDefault" = true WHERE "key" = 'saas_delivery';
