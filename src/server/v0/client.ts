import "server-only";

import { createV0Client, type V0Client } from "v0";
import { API_ERROR_CODES } from "@/lib/api-error-codes";
import { getStoredV0ApiKey } from "@/server/db/queries/v0-api-keys";
import { getV0ApiUrl } from "@/server/env";
import { HttpError } from "@/server/http/errors";
import { decryptV0ApiKey } from "./api-key-crypto";

export type { V0Client };

const missingKeyError = () =>
  new HttpError(
    428,
    "Set your v0 API key to continue",
    API_ERROR_CODES.v0ApiKeyRequired,
  );

export function createUserV0Client(apiKey: string): V0Client {
  if (!apiKey) {
    throw missingKeyError();
  }
  return createV0Client({ auth: apiKey, baseUrl: getV0ApiUrl() });
}

export async function getUserV0ApiKey(userId: string): Promise<string | null> {
  const storedKey = await getStoredV0ApiKey(userId);
  if (!storedKey) {
    return null;
  }

  try {
    return decryptV0ApiKey(storedKey);
  } catch (error) {
    console.error("Failed to decrypt stored v0 API key:", error);
    return null;
  }
}

export async function getV0ClientForUser(userId: string): Promise<V0Client> {
  const apiKey = await getUserV0ApiKey(userId);

  if (!apiKey) {
    throw missingKeyError();
  }

  return createUserV0Client(apiKey);
}

export async function isValidV0ApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) {
    return false;
  }

  const result = await createUserV0Client(apiKey).chats.list({ limit: 1 });
  return result.error === undefined && result.response?.ok === true;
}

export function toV0HttpError(
  status: number | undefined,
  message: string | undefined,
): HttpError {
  switch (status) {
    case 401:
      return new HttpError(
        428,
        "v0 rejected your API key. Add a new one to continue.",
        API_ERROR_CODES.v0ApiKeyInvalid,
      );
    case 403:
      return new HttpError(403, message || "v0 denied access to this chat");
    case 404:
      return new HttpError(404, message || "Not found on v0");
    case 409:
      return new HttpError(409, message || "That action is no longer valid");
    case 422:
      return new HttpError(422, message || "v0 couldn't process the request");
    case 429:
      return new HttpError(
        429,
        message || "v0 rate limit reached. Try again shortly.",
        API_ERROR_CODES.rateLimited,
      );
    case undefined:
      return new HttpError(502, "Couldn't reach v0. Check your connection.");
    default:
      return new HttpError(
        502,
        message || `v0 request failed with status ${status}`,
      );
  }
}

interface V0Result<Data> {
  data?: Data;
  error?: unknown;
  response?: Response;
}

function readErrorMessage(error: unknown): string | undefined {
  if (typeof error === "string") {
    return error || undefined;
  }
  if (error && typeof error === "object" && "message" in error) {
    const { message } = error as { message: unknown };
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}

export function unwrapV0<Data>(result: V0Result<Data>): Data {
  if (result.error !== undefined || !result.response?.ok) {
    throw toV0HttpError(
      result.response?.status,
      readErrorMessage(result.error),
    );
  }
  return result.data as Data;
}
