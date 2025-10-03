-- AlterTable
ALTER TABLE "public"."Template" ADD COLUMN     "n8nWorkflowFilename" TEXT,
ADD COLUMN     "n8nWorkflowId" TEXT,
ADD COLUMN     "sourceType" TEXT NOT NULL DEFAULT 'upload';
