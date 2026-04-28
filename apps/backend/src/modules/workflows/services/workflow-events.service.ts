import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import type { WorkflowAccessUser, WorkflowStepEvent } from "../types/workflow.types";
import { verifyJwt } from "../../auth/services/auth-jwt.service";

const WORKFLOW_RUN_CHANNEL_PREFIX = "workflow-run";

let io: Server | null = null;

function getWorkflowRunChannel(runId: string): string {
  return `${WORKFLOW_RUN_CHANNEL_PREFIX}:${runId}`;
}

function readSocketToken(authToken: unknown, authorizationHeader: unknown): string | null {
  if (typeof authToken === "string" && authToken.trim().length > 0) {
    return authToken;
  }

  if (typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function buildSocketUser(token: string): WorkflowAccessUser {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const payload = verifyJwt(token, secret);

  return {
    userId: payload.sub,
    tenantId: payload.tenantId,
    role: payload.role,
  };
}

export function initializeWorkflowEvents(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    try {
      const token = readSocketToken(
        socket.handshake.auth.token,
        socket.handshake.headers.authorization,
      );

      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }

      socket.data.user = buildSocketUser(token);
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unauthorized";
      next(new Error(message));
    }
  });

  io.on("connection", (socket) => {
    socket.on("workflow-run:subscribe", (runId: string) => {
      if (typeof runId !== "string" || runId.trim().length === 0) {
        return;
      }

      socket.join(getWorkflowRunChannel(runId));
    });

    socket.on("workflow-run:unsubscribe", (runId: string) => {
      if (typeof runId !== "string" || runId.trim().length === 0) {
        return;
      }

      socket.leave(getWorkflowRunChannel(runId));
    });
  });

  return io;
}

export function emitWorkflowStepEvent(event: WorkflowStepEvent): void {
  io?.to(getWorkflowRunChannel(event.runId)).emit(event.event, event);
}
