import { createHmac, timingSafeEqual } from "node:crypto";
import type { JwtPayload } from "../types/auth.types";

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function encodeBase64Url(value: Buffer): string {
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token format");
  }

  const content = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = encodeBase64Url(
    createHmac("sha256", secret).update(content).digest(),
  );

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as JwtPayload;

  if (!payload.sub || !payload.tenantId || !payload.role) {
    throw new Error("Token payload is missing required fields");
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error("Token has expired");
  }

  return payload;
}
