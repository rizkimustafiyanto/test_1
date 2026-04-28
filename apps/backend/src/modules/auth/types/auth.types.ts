import type { WorkflowRole } from "../../workflows/types/workflow.types";

export type JwtPayload = {
  sub: string;
  tenantId: string;
  role: WorkflowRole;
  exp?: number;
  iat?: number;
};
