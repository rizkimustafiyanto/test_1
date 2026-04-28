import type { NextFunction, RequestHandler, Response } from "express";
import { verifyJwt } from "../services/auth-jwt.service";
import type { WorkflowRole } from "../../workflows/types/workflow.types";
import type { AuthenticatedRequest } from "../types/express-request.types";

function readBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export const authenticateJwt: RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = readBearerToken(req.header("authorization"));
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyJwt(token, secret);
    req.user = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
    };
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    res.status(401).json({ message });
  }
};

export function authorizeRoles(roles: WorkflowRole[]) {
  const middleware: RequestHandler = (req, res, next) => {
    const request = req as AuthenticatedRequest;

    if (!request.user || !roles.includes(request.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };

  return middleware;
}
