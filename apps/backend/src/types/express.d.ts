import type { WorkflowAccessUser } from "../modules/workflows/types/workflow.types";

declare module "express-serve-static-core" {
  interface Request {
    user?: WorkflowAccessUser;
  }
}

export {};
