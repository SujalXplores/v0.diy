import "server-only";

import type { z } from "zod";
import { auth } from "@/server/auth/auth";
import { badRequestError, HttpError, unauthorizedError } from "./errors";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw unauthorizedError();
  }

  return userId;
}

export async function parseJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const body: unknown = await request.json().catch(() => null);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw badRequestError(
      result.error.issues[0]?.message ?? "Invalid request body",
    );
  }

  return result.data;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function assertSameOrigin(request: Request): void {
  if (SAFE_METHODS.has(request.method)) {
    return;
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new HttpError(403, "Cross-origin request blocked");
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new HttpError(403, "Cross-origin request blocked");
  }
}

export function parseParam<Schema extends z.ZodType>(
  value: unknown,
  schema: Schema,
): z.infer<Schema> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw badRequestError(result.error.issues[0]?.message ?? "Invalid request");
  }
  return result.data;
}
