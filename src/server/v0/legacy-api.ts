import "server-only";

import { LEGACY_V0_API_URL } from "@/server/env";
import { toV0HttpError } from "./client";

async function readErrorMessage(
  response: Response,
): Promise<string | undefined> {
  try {
    const body = (await response.json()) as {
      error?: { message?: unknown };
    };
    const message = body.error?.message;
    return typeof message === "string" ? message : undefined;
  } catch {
    return undefined;
  }
}

export async function requestV1(
  apiKey: string,
  path: string,
): Promise<Response> {
  const response = await fetch(`${LEGACY_V0_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw toV0HttpError(response.status, await readErrorMessage(response));
  }
  return response;
}
