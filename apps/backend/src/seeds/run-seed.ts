import "dotenv/config";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { seedWorkflowRecords } from "../modules/workflows/seeds/workflow.seed-data";

type SeedTenantRecord = {
  id: string;
  slug: string;
  name: string;
};

type SeedUserRecord = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
};

const seedTenantRecords: SeedTenantRecord[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "sevima-sandbox",
    name: "Sevima Sandbox",
  },
];

const seedUserRecords: SeedUserRecord[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    tenantId: "00000000-0000-0000-0000-000000000001",
    email: "admin@sevima-sandbox.local",
    name: "Sandbox Admin",
  },
];

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function seedTenants(): Promise<void> {
  for (const tenant of seedTenantRecords) {
    await prisma.tenant.upsert({
      where: { id: tenant.id },
      update: {
        slug: tenant.slug,
        name: tenant.name,
      },
      create: tenant,
    });
  }
}

async function seedUsers(): Promise<void> {
  for (const user of seedUserRecords) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
      },
      create: user,
    });
  }
}

async function seedWorkflows(): Promise<void> {
  for (const workflow of seedWorkflowRecords) {
    await prisma.workflow.upsert({
      where: { id: workflow.workflowId },
      update: {
        tenantId: workflow.tenantId,
        key: workflow.key,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        createdByUserId: workflow.createdByUserId,
      },
      create: {
        id: workflow.workflowId,
        tenantId: workflow.tenantId,
        key: workflow.key,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        createdByUserId: workflow.createdByUserId,
      },
    });

    await prisma.workflowVersion.upsert({
      where: { id: workflow.workflowVersionId },
      update: {
        tenantId: workflow.tenantId,
        workflowId: workflow.workflowId,
        versionNumber: 1,
        dag: toJsonValue(workflow.definition),
        isPublished: workflow.status === "active",
        createdByUserId: workflow.createdByUserId,
      },
      create: {
        id: workflow.workflowVersionId,
        tenantId: workflow.tenantId,
        workflowId: workflow.workflowId,
        versionNumber: 1,
        dag: toJsonValue(workflow.definition),
        isPublished: workflow.status === "active",
        createdByUserId: workflow.createdByUserId,
      },
    });

    await prisma.workflow.update({
      where: { id: workflow.workflowId },
      data: {
        latestVersionId: workflow.workflowVersionId,
      },
    });
  }
}

async function seedWorkflowRuns(): Promise<void> {
  for (const workflow of seedWorkflowRecords) {
    await prisma.workflowRun.upsert({
      where: { id: workflow.workflowRunId },
      update: {
        tenantId: workflow.tenantId,
        workflowId: workflow.workflowId,
        workflowVersionId: workflow.workflowVersionId,
        triggeredByUserId: workflow.createdByUserId,
        status: "success",
        executionMode: workflow.executionMode,
        input: toJsonValue({}),
        output: toJsonValue(workflow.runResult),
        logs: toJsonValue({
          seeded: true,
        }),
        startedAt: new Date("2026-01-01T09:00:00.000Z"),
        finishedAt: new Date("2026-01-01T09:05:00.000Z"),
      },
      create: {
        id: workflow.workflowRunId,
        tenantId: workflow.tenantId,
        workflowId: workflow.workflowId,
        workflowVersionId: workflow.workflowVersionId,
        triggeredByUserId: workflow.createdByUserId,
        status: "success",
        executionMode: workflow.executionMode,
        input: toJsonValue({}),
        output: toJsonValue(workflow.runResult),
        logs: toJsonValue({
          seeded: true,
        }),
        startedAt: new Date("2026-01-01T09:00:00.000Z"),
        finishedAt: new Date("2026-01-01T09:05:00.000Z"),
      },
    });

    for (const [index, step] of workflow.definition.steps.entries()) {
      const startedAt = new Date(Date.UTC(2026, 0, 1, 9, index, 0));
      const finishedAt = new Date(Date.UTC(2026, 0, 1, 9, index, 20));

      await prisma.stepRun.upsert({
        where: {
          workflowRunId_stepId_attempt: {
            workflowRunId: workflow.workflowRunId,
            stepId: step.id,
            attempt: 1,
          },
        },
        update: {
          tenantId: workflow.tenantId,
          stepType: step.type,
          status: "success",
          input: toJsonValue({}),
          output: toJsonValue(workflow.runResult.outputs[step.id] ?? {}),
          startedAt,
          finishedAt,
        },
        create: {
          tenantId: workflow.tenantId,
          workflowRunId: workflow.workflowRunId,
          stepId: step.id,
          stepType: step.type,
          status: "success",
          attempt: 1,
          input: toJsonValue({}),
          output: toJsonValue(workflow.runResult.outputs[step.id] ?? {}),
          startedAt,
          finishedAt,
        },
      });
    }
  }
}

async function runSeed(): Promise<void> {
  await seedTenants();
  await seedUsers();
  await seedWorkflows();
  await seedWorkflowRuns();
}

runSeed()
  .then(async () => {
    console.log("Backend seed completed successfully.");
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Backend seed failed.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
