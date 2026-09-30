import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "../connection";
import { users } from "../schema";

const BYOK_COLUMNS = [
  "v0_api_key_encrypted",
  "v0_api_key_iv",
  "v0_api_key_updated_at",
] as const;

export interface StoredV0ApiKey {
  encrypted: string;
  iv: string;
  updatedAt: Date | null;
}

/** True when a query failed because the BYOK migration hasn't been applied. */
export function isMissingByokColumnsError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return BYOK_COLUMNS.some((column) => message.includes(column));
}

/**
 * Reads the encrypted v0 API key of a user.
 * Returns null when no key is stored or the BYOK columns don't exist yet.
 */
export async function getStoredV0ApiKey(
  userId: string,
): Promise<StoredV0ApiKey | null> {
  try {
    const [row] = await getDb()
      .select({
        encrypted: users.v0_api_key_encrypted,
        iv: users.v0_api_key_iv,
        updatedAt: users.v0_api_key_updated_at,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!(row?.encrypted && row.iv)) {
      return null;
    }

    return { encrypted: row.encrypted, iv: row.iv, updatedAt: row.updatedAt };
  } catch (error) {
    if (isMissingByokColumnsError(error)) {
      return null;
    }
    throw error;
  }
}

/** Stores an encrypted v0 API key for a user. */
export async function saveV0ApiKey(
  userId: string,
  { encrypted, iv }: Pick<StoredV0ApiKey, "encrypted" | "iv">,
): Promise<void> {
  await getDb()
    .update(users)
    .set({
      v0_api_key_encrypted: encrypted,
      v0_api_key_iv: iv,
      v0_api_key_updated_at: new Date(),
    })
    .where(eq(users.id, userId));
}

/** Removes the stored v0 API key of a user. */
export async function clearV0ApiKey(userId: string): Promise<void> {
  await getDb()
    .update(users)
    .set({
      v0_api_key_encrypted: null,
      v0_api_key_iv: null,
      v0_api_key_updated_at: null,
    })
    .where(eq(users.id, userId));
}
