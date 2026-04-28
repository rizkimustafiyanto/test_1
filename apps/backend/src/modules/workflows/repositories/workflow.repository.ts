import type { Prisma, WorkflowRunStatus as PrismaWorkflowRunStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import type {
  WorkflowAccessUser,
  WorkflowDefinition,
  WorkflowRecord,
  WorkflowRunRecord,
  WorkflowStepEvent,
  WorkflowStepRunRecord,
} from "../types/workflow.types";

type PersistedWorkflowRecord = WorkflowRecord & {
  key: string;
  latestVersionId: string;
};

type CreateWorkflowParams = {
  actor: WorkflowAccessUser;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
};

type CreateWorkflowRunParams = {
  actor: WorkflowAccessUser;
  workflowId: string;
  workflowVersionId: string;
  mode: "sequential" | "parallel";
  input: Record<string, unknown>;
};

function slugifyWorkflowKey(name: string): string {
  const baseKey = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return baseKey || "workflow";
}

function mapWorkflowDefinition(value: unknown): WorkflowDefinition {
  return value as WorkflowDefinition;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function mapWorkflowRecord(
  workflow: {
    id: string;
    tenantId: string;
    key: string;
    name: string;
    description: string | null;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
    latestVersionId: string | null;
    latestVersion: { dag: unknown } | null;
  },
): PersistedWorkflowRecord {
  if (!workflow.latestVersion || !workflow.latestVersionId || !workflow.createdByUserId) {
    throw new Error("Workflow latest version is missing");
  }

  return {
    id: workflow.id,
    tenantId: workflow.tenantId,
    key: workflow.key,
    name: workflow.name,
    description: workflow.description ?? undefined,
    definition: mapWorkflowDefinition(workflow.latestVersion.dag),
    createdByUserId: workflow.createdByUserId,
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
    latestVersionId: workflow.latestVersionId,
    workflowVersionId: workflow.latestVersionId,
  };
}

function mapWorkflowRunRecord(
  run: {
    id: string;
    workflowId: string;
    workflowVersionId: string;
    tenantId: string;
    triggeredByUserId: string | null;
    status: PrismaWorkflowRunStatus;
    executionMode: string;
    input: unknown;
    output: unknown;
    error: string | null;
    createdAt: Date;
    startedAt: Date | null;
    finishedAt: Date | null;
  },
): WorkflowRunRecord {
  if (!run.triggeredByUserId || !run.startedAt) {
    throw new Error("Workflow run is missing required ownership metadata");
  }

  if (run.status !== "running" && run.status !== "success" && run.status !== "failed") {
    throw new Error(`Unsupported workflow run status: ${run.status}`);
  }

  return {
    id: run.id,
    workflowId: run.workflowId,
    workflowVersionId: run.workflowVersionId,
    tenantId: run.tenantId,
    triggeredByUserId: run.triggeredByUserId,
    status: run.status,
    mode: run.executionMode as "sequential" | "parallel",
    input: (run.input as Record<string, unknown> | null) ?? {},
    result: run.output as WorkflowRunRecord["result"] | undefined,
    error: run.error ?? undefined,
    createdAt: run.createdAt.toISOString(),
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString(),
  };
}

async function ensureActorContext(actor: WorkflowAccessUser): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: actor.tenantId },
    update: {},
    create: {
      id: actor.tenantId,
      slug: `tenant-${actor.tenantId.slice(0, 8)}`,
      name: `Tenant ${actor.tenantId.slice(0, 8)}`,
    },
  });

  await prisma.user.upsert({
    where: { id: actor.userId },
    update: {
      tenantId: actor.tenantId,
    },
    create: {
      id: actor.userId,
      tenantId: actor.tenantId,
      email: `${actor.userId}@flowforge.local`,
      name: actor.userId,
    },
  });
}

async function buildUniqueWorkflowKey(
  tenantId: string,
  name: string,
): Promise<string> {
  const baseKey = slugifyWorkflowKey(name);
  let candidate = baseKey;
  let suffix = 1;

  while (await prisma.workflow.findFirst({
    where: {
      tenantId,
      key: candidate,
    },
    select: { id: true },
  })) {
    suffix += 1;
    candidate = `${baseKey}-${suffix}`;
  }

  return candidate;
}

export type WorkflowRepository = {
  createWorkflow(params: CreateWorkflowParams): Promise<PersistedWorkflowRecord>;
  listWorkflowsByTenant(tenantId: string): Promise<PersistedWorkflowRecord[]>;
  getWorkflowById(id: string): Promise<PersistedWorkflowRecord | null>;
  listRunsByWorkflowId(workflowId: string, tenantId: string): Promise<WorkflowRunRecord[]>;
  createRun(params: CreateWorkflowRunParams): Promise<WorkflowRunRecord>;
  updateRun(run: WorkflowRunRecord): Promise<WorkflowRunRecord>;
  getRunById(id: string): Promise<WorkflowRunRecord | null>;
  upsertStepRunFromEvent(event: WorkflowStepEvent): Promise<WorkflowStepRunRecord>;
};

function mapWorkflowStepRunRecord(
  stepRun: {
    id: string;
    workflowRunId: string;
    tenantId: string;
    stepId: string;
    stepType: string;
    status: string;
    attempt: number;
    input: unknown;
    output: unknown;
    error: string | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
): WorkflowStepRunRecord {
  return {
    id: stepRun.id,
    workflowRunId: stepRun.workflowRunId,
    tenantId: stepRun.tenantId,
    stepId: stepRun.stepId,
    stepType: stepRun.stepType as WorkflowStepRunRecord["stepType"],
    status: stepRun.status as WorkflowStepRunRecord["status"],
    attempt: stepRun.attempt,
    input: (stepRun.input as Record<string, unknown> | null) ?? undefined,
    output: (stepRun.output as Record<string, unknown> | null) ?? undefined,
    error: stepRun.error ?? undefined,
    startedAt: stepRun.startedAt?.toISOString(),
    finishedAt: stepRun.finishedAt?.toISOString(),
    createdAt: stepRun.createdAt.toISOString(),
    updatedAt: stepRun.updatedAt.toISOString(),
  };
}

export const workflowRepository: WorkflowRepository = {
  async createWorkflow(params) {
    await ensureActorContext(params.actor);
    const key = await buildUniqueWorkflowKey(params.actor.tenantId, params.name);

    const workflow = await prisma.$transaction(async (tx) => {
      const createdWorkflow = await tx.workflow.create({
        data: {
          tenantId: params.actor.tenantId,
          key,
          name: params.name,
          description: params.description,
          status: "draft",
          createdByUserId: params.actor.userId,
        },
      });

      const createdVersion = await tx.workflowVersion.create({
        data: {
          tenantId: params.actor.tenantId,
          workflowId: createdWorkflow.id,
          versionNumber: 1,
          dag: toJsonValue(params.definition),
          isPublished: true,
          createdByUserId: params.actor.userId,
        },
      });

      return tx.workflow.update({
        where: { id: createdWorkflow.id },
        data: {
          latestVersionId: createdVersion.id,
        },
        include: {
          latestVersion: true,
        },
      });
    });

    return mapWorkflowRecord(workflow);
  },

  async listWorkflowsByTenant(tenantId) {
    const workflows = await prisma.workflow.findMany({
      where: { tenantId },
      include: {
        latestVersion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return workflows.map(mapWorkflowRecord);
  },

  async getWorkflowById(id) {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        latestVersion: true,
      },
    });

    return workflow ? mapWorkflowRecord(workflow) : null;
  },

  async listRunsByWorkflowId(workflowId, tenantId) {
    const runs = await prisma.workflowRun.findMany({
      where: {
        workflowId,
        tenantId,
      },
      include: {
        stepRuns: {
          orderBy: [
            { startedAt: "asc" },
            { createdAt: "asc" },
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return runs.map((run) => ({
      ...mapWorkflowRunRecord(run),
      stepRuns: run.stepRuns.map(mapWorkflowStepRunRecord),
    }));
  },

  async createRun(params) {
    await ensureActorContext(params.actor);

    const run = await prisma.workflowRun.create({
      data: {
        tenantId: params.actor.tenantId,
        workflowId: params.workflowId,
        workflowVersionId: params.workflowVersionId,
        triggeredByUserId: params.actor.userId,
        status: "running",
        executionMode: params.mode,
        input: toJsonValue(params.input),
        startedAt: new Date(),
      },
    });

    return mapWorkflowRunRecord(run);
  },

  async updateRun(run) {
    const updatedRun = await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: run.status,
        executionMode: run.mode,
        input: toJsonValue(run.input),
        output: run.result ? toJsonValue(run.result) : undefined,
        error: run.error,
        finishedAt: run.finishedAt ? new Date(run.finishedAt) : null,
      },
    });

    return mapWorkflowRunRecord(updatedRun);
  },

  async getRunById(id) {
    const run = await prisma.workflowRun.findUnique({
      where: { id },
      include: {
        stepRuns: {
          orderBy: [
            { startedAt: "asc" },
            { createdAt: "asc" },
          ],
        },
      },
    });

    return run
      ? {
          ...mapWorkflowRunRecord(run),
          stepRuns: run.stepRuns.map(mapWorkflowStepRunRecord),
        }
      : null;
  },

  async upsertStepRunFromEvent(event) {
    const statusByEvent = {
      step_started: "running",
      step_completed: "success",
      step_failed: "failed",
    } as const;

    const existingStepRun = await prisma.stepRun.findFirst({
      where: {
        workflowRunId: event.runId,
        stepId: event.stepId,
        attempt: event.attempt,
      },
    });

    const stepRun = existingStepRun
      ? await prisma.stepRun.update({
          where: { id: existingStepRun.id },
          data: {
            status: statusByEvent[event.event],
            stepType: event.stepType,
            output: event.output ? toJsonValue(event.output) : undefined,
            error: event.error,
            startedAt: event.event === "step_started" ? new Date(event.timestamp) : undefined,
            finishedAt:
              event.event === "step_completed" || event.event === "step_failed"
                ? new Date(event.timestamp)
                : undefined,
          },
        })
      : await prisma.stepRun.create({
          data: {
            tenantId: event.tenantId,
            workflowRunId: event.runId,
            stepId: event.stepId,
            stepType: event.stepType,
            status: statusByEvent[event.event],
            attempt: event.attempt,
            output: event.output ? toJsonValue(event.output) : undefined,
            error: event.error,
            startedAt: event.event === "step_started" ? new Date(event.timestamp) : undefined,
            finishedAt:
              event.event === "step_completed" || event.event === "step_failed"
                ? new Date(event.timestamp)
                : undefined,
          },
        });

    return mapWorkflowStepRunRecord(stepRun);
  },
};
