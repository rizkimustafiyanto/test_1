import type { Response } from "express";
import type { AuthenticatedRequest } from "../../auth/types/express-request.types";
import { getRun } from "../services/workflow.service";

export async function getRunController(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const runId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

  if (!runId) {
    res.status(400).json({ message: "Run id is required" });
    return;
  }

  const run = await getRun(req.user, runId);

  if (!run) {
    res.status(404).json({ message: "Run not found" });
    return;
  }

  res.json(run);
}
