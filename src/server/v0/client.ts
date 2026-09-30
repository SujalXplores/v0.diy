import "server-only";

import { createClient } from "v0-sdk";
import { API_ERROR_CODES } from "@/lib/api-error-codes";
import { getStoredV0ApiKey } from "@/server/db/queries/v0-api-keys";
import { getV0ApiUrl } from "@/server/env";
import { HttpError } from "@/server/http/errors";
import { decryptV0ApiKey } from "./api-key-crypto";

export type V0Client = ReturnType<typeof createClient>;

export function createV0Client(apiKey: string): V0Client {
  return createClient({ apiKey, baseUrl: getV0ApiUrl() });
}

/** Decrypts and returns the stored v0 API key of a user, if any. */
export async function getUserV0ApiKey(userId: string): Promise<string | null> {
  const storedKey = await getStoredV0ApiKey(userId);
  return storedKey ? decryptV0ApiKey(storedKey) : null;
}

/**
 * Creates a v0 client authenticated with the user's own API key.
 * @throws HttpError 428 when the user hasn't saved a key yet
 */
export async function getV0ClientForUser(userId: string): Promise<V0Client> {
  const apiKey = await getUserV0ApiKey(userId);

  if (!apiKey) {
    throw new HttpError(
      428,
      "Set your v0 API key to continue",
      API_ERROR_CODES.v0ApiKeyRequired,
    );
  }

  return createV0Client(apiKey);
}

/** Checks a v0 API key by making the cheapest authenticated request. */
export async function isValidV0ApiKey(apiKey: string): Promise<boolean> {
  // v0-sdk falls back to the server's V0_API_KEY when given an empty key.
  if (!apiKey) {
    return false;
  }

  try {
    await createV0Client(apiKey).chats.find({ limit: 1 });
    return true;
  } catch {
    return false;
  }
}
