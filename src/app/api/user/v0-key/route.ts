import { z } from "zod";
import { API_ERROR_CODES } from "@/lib/api-error-codes";
import {
  clearV0ApiKey,
  getStoredV0ApiKey,
  isMissingByokColumnsError,
  saveV0ApiKey,
} from "@/server/db/queries/v0-api-keys";
import { HttpError, toErrorResponse } from "@/server/http/errors";
import { parseJsonBody, requireUserId } from "@/server/http/request";
import { encryptV0ApiKey } from "@/server/v0/api-key-crypto";
import { isValidV0ApiKey } from "@/server/v0/client";

const INVALID_KEY_MESSAGE = "Invalid v0 API key";

const saveKeyBodySchema = z.object({
  apiKey: z
    .string({ error: INVALID_KEY_MESSAGE })
    .trim()
    .min(1, INVALID_KEY_MESSAGE),
});

function handleError(error: unknown, logContext: string): Response {
  if (isMissingByokColumnsError(error)) {
    return new HttpError(
      503,
      "Database migration required. Run `pnpm db:migrate` and restart the app.",
      API_ERROR_CODES.migrationRequired,
    ).toResponse();
  }

  return toErrorResponse(error, logContext, "Failed to manage v0 API key");
}

/** Reports whether the signed-in user has saved a v0 API key. */
export async function GET() {
  try {
    const userId = await requireUserId();
    const storedKey = await getStoredV0ApiKey(userId);

    return Response.json({
      hasKey: storedKey !== null,
      lastUpdatedAt: storedKey?.updatedAt ?? null,
    });
  } catch (error) {
    return handleError(error, "Failed to read v0 API key status");
  }
}

/** Validates the key against the v0 API, then stores it encrypted. */
export async function PUT(request: Request) {
  try {
    const userId = await requireUserId();
    const { apiKey } = await parseJsonBody(request, saveKeyBodySchema);

    if (!(await isValidV0ApiKey(apiKey))) {
      throw new HttpError(400, INVALID_KEY_MESSAGE);
    }

    await saveV0ApiKey(userId, encryptV0ApiKey(apiKey));

    return Response.json({ success: true });
  } catch (error) {
    return handleError(error, "Failed to save v0 API key");
  }
}

export async function DELETE() {
  try {
    const userId = await requireUserId();
    await clearV0ApiKey(userId);

    return Response.json({ success: true });
  } catch (error) {
    return handleError(error, "Failed to clear v0 API key");
  }
}
