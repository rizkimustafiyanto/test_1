import type { Request } from "express";
import type { WorkflowAccessUser } from "../../workflows/types/workflow.types";

export type AuthenticatedRequest = Request & {
  user?: WorkflowAccessUser;
};
