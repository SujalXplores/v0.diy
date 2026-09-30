import "server-only";

import type { z } from "zod";
import { auth } from "@/server/auth/auth";
import { badRequestError, unauthorizedError } from "./errors";

/** Returns the signed-in user's ID or throws a 401. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw unauthorizedError();
  }

  return userId;
}

/** Parses and validates a JSON request body, throwing a 400 on failure. */
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
