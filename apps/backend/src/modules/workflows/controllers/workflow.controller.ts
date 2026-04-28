import type { Response } from "express";
import type { AuthenticatedRequest } from "../../auth/types/express-request.types";
import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  listWorkflowRuns,
  triggerWorkflow,
} from "../services/workflow.service";
import {
  parseCreateWorkflowRequest,
  parseTriggerWorkflowRequest,
} from "../validators/workflow.validator";

export async function createWorkflowController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const input = parseCreateWorkflowRequest(req.body);
    const workflow = await createWorkflow(req.user, input);
    res.status(201).json(workflow);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create workflow";
    res.status(400).json({ message });
  }
}

export async function listWorkflowsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const workflows = await listWorkflows(req.user);
  res.json(workflows);
}

export async function triggerWorkflowController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const workflowId =
      typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!workflowId) {
      res.status(400).json({ message: "Workflow id is required" });
      return;
    }

    const input = parseTriggerWorkflowRequest(req.body);
    const run = await triggerWorkflow(req.user, workflowId, input);
    res.status(201).json(run);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to trigger workflow";
    const statusCode = message === "Workflow not found" ? 404 : 400;
    res.status(statusCode).json({ message });
  }
}

export async function getWorkflowController(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const workflowId =
    typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

  if (!workflowId) {
    res.status(400).json({ message: "Workflow id is required" });
    return;
  }

  const workflow = await getWorkflow(req.user, workflowId);

  if (!workflow) {
    res.status(404).json({ message: "Workflow not found" });
    return;
  }

  res.json(workflow);
}

export async function listWorkflowRunsController(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const workflowId =
    typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

  if (!workflowId) {
    res.status(400).json({ message: "Workflow id is required" });
    return;
  }

  const runs = await listWorkflowRuns(req.user, workflowId);

  if (!runs) {
    res.status(404).json({ message: "Workflow not found" });
    return;
  }

  res.json(runs);
}
