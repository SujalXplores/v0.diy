import "server-only";

import type { Session } from "next-auth";
import { createClient } from "v0-sdk";
import { getUserV0ApiKey } from "@/lib/db/queries";
import { V0_API_KEY_REQUIRED_CODE } from "@/lib/v0-key";

export class V0ApiKeyRequiredError extends Error {
  public readonly code = V0_API_KEY_REQUIRED_CODE;

  constructor() {
    super("v0 API key is required");
  }
}

export class V0UnauthorizedError extends Error {
  constructor() {
    super("Authentication required");
  }
}

export function getV0ClientErrorResponse(error: unknown) {
  if (error instanceof V0UnauthorizedError) {
    return Response.json(
      { error: "Authentication required", code: "unauthorized" },
      { status: 401 },
    );
  }

  if (error instanceof V0ApiKeyRequiredError) {
    return Response.json(
      {
        error: "Set your v0 API key to continue",
        code: V0_API_KEY_REQUIRED_CODE,
      },
      { status: 428 },
    );
  }

  return null;
}

export async function getUserV0Client(session: Session | null) {
  if (!session?.user?.id) {
    throw new V0UnauthorizedError();
  }

  const apiKey = await getUserV0ApiKey({ userId: session.user.id });

  if (!apiKey) {
    throw new V0ApiKeyRequiredError();
  }

  return createClient({
    apiKey,
    ...(process.env.V0_API_URL ? { baseUrl: process.env.V0_API_URL } : {}),
  });
}
