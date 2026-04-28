-- Required for case-insensitive email column type used by User.email
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "WorkflowRunStatus" AS ENUM ('pending', 'running', 'success', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "StepRunStatus" AS ENUM ('pending', 'running', 'success', 'failed', 'skipped', 'cancelled');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "name" VARCHAR(200),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "key" VARCHAR(120) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'draft',
    "latestVersionId" UUID,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowVersion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "workflowId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "dag" JSONB NOT NULL,
    "inputSchema" JSONB,
    "outputSchema" JSONB,
    "changelog" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "workflowId" UUID NOT NULL,
    "workflowVersionId" UUID NOT NULL,
    "triggeredByUserId" UUID,
    "status" "WorkflowRunStatus" NOT NULL DEFAULT 'pending',
    "executionMode" VARCHAR(30) NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "logs" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMPTZ(6),
    "finishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepRun" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "workflowRunId" UUID NOT NULL,
    "stepId" VARCHAR(120) NOT NULL,
    "stepType" VARCHAR(30) NOT NULL,
    "status" "StepRunStatus" NOT NULL DEFAULT 'pending',
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "input" JSONB,
    "output" JSONB,
    "logs" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMPTZ(6),
    "finishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StepRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_latestVersionId_key" ON "Workflow"("latestVersionId");

-- CreateIndex
CREATE INDEX "Workflow_tenantId_status_idx" ON "Workflow"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Workflow_tenantId_createdAt_idx" ON "Workflow"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_tenantId_key_key" ON "Workflow"("tenantId", "key");

-- CreateIndex
CREATE INDEX "WorkflowVersion_tenantId_workflowId_createdAt_idx" ON "WorkflowVersion"("tenantId", "workflowId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowVersion_tenantId_isPublished_idx" ON "WorkflowVersion"("tenantId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowVersion_workflowId_versionNumber_key" ON "WorkflowVersion"("workflowId", "versionNumber");

-- CreateIndex
CREATE INDEX "WorkflowRun_tenantId_workflowId_createdAt_idx" ON "WorkflowRun"("tenantId", "workflowId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowRun_tenantId_status_createdAt_idx" ON "WorkflowRun"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowRun_workflowVersionId_idx" ON "WorkflowRun"("workflowVersionId");

-- CreateIndex
CREATE INDEX "StepRun_tenantId_workflowRunId_idx" ON "StepRun"("tenantId", "workflowRunId");

-- CreateIndex
CREATE INDEX "StepRun_tenantId_stepId_idx" ON "StepRun"("tenantId", "stepId");

-- CreateIndex
CREATE INDEX "StepRun_workflowRunId_status_idx" ON "StepRun"("workflowRunId", "status");

-- CreateIndex
CREATE INDEX "StepRun_workflowRunId_stepId_attempt_idx" ON "StepRun"("workflowRunId", "stepId", "attempt");

-- CreateIndex
CREATE UNIQUE INDEX "StepRun_workflowRunId_stepId_attempt_key" ON "StepRun"("workflowRunId", "stepId", "attempt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "WorkflowVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowVersion" ADD CONSTRAINT "WorkflowVersion_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowVersion" ADD CONSTRAINT "WorkflowVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowVersion" ADD CONSTRAINT "WorkflowVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowVersionId_fkey" FOREIGN KEY ("workflowVersionId") REFERENCES "WorkflowVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_triggeredByUserId_fkey" FOREIGN KEY ("triggeredByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepRun" ADD CONSTRAINT "StepRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepRun" ADD CONSTRAINT "StepRun_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
