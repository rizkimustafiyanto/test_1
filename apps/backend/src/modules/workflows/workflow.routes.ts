import { Router } from "express";
import { authenticateJwt, authorizeRoles } from "../auth/middlewares/auth.middleware";
import {
  createWorkflowController,
  getWorkflowController,
  listWorkflowsController,
  listWorkflowRunsController,
  triggerWorkflowController,
} from "./controllers/workflow.controller";
import { getRunController } from "./controllers/workflow-run.controller";

export const workflowRouter = Router();
export const workflowRunRouter = Router();

workflowRouter.use(authenticateJwt);
workflowRunRouter.use(authenticateJwt);

workflowRouter.post(
  "/",
  authorizeRoles(["admin", "editor"]),
  createWorkflowController,
);

workflowRouter.get(
  "/",
  authorizeRoles(["admin", "editor", "viewer"]),
  listWorkflowsController,
);

workflowRouter.get(
  "/:id",
  authorizeRoles(["admin", "editor", "viewer"]),
  getWorkflowController,
);

workflowRouter.get(
  "/:id/runs",
  authorizeRoles(["admin", "editor", "viewer"]),
  listWorkflowRunsController,
);

workflowRouter.post(
  "/:id/trigger",
  authorizeRoles(["admin", "editor"]),
  triggerWorkflowController,
);

workflowRunRouter.get(
  "/:id",
  authorizeRoles(["admin", "editor", "viewer"]),
  getRunController,
);
