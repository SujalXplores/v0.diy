import "server-only";

import { API_ERROR_CODES } from "@/lib/api-error-codes";
import {
  getChatIdsByUserId,
  replaceLegacyChatOwnership,
} from "@/server/db/queries/chat-ownerships";
import { HttpError } from "@/server/http/errors";
import {
  getUserV0ApiKey,
  getV0ClientForUser,
  unwrapV0,
} from "@/server/v0/client";
import { requestV1 } from "@/server/v0/legacy-api";

export interface LegacyChat {
  id: string;
  name: string;
  updatedAt: string;
}

interface V1Chat {
  id: string;
  name?: string;
  title?: string;
  updatedAt?: string;
  createdAt: string;
  latestVersion?: { id: string; status?: string } | null;
}

const MAX_LEGACY_ZIP_BYTES = 25 * 1024 * 1024;
const LEGACY_FETCH_CONCURRENCY = 6;

async function mapWithConcurrency<Item, Result>(
  items: readonly Item[],
  limit: number,
  run: (item: Item) => Promise<Result>,
): Promise<Result[]> {
  const results: Result[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await run(items[index] as Item);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

async function getLegacyChat(
  apiKey: string,
  chatId: string,
): Promise<V1Chat | null> {
  try {
    const response = await requestV1(apiKey, `/chats/${chatId}`);
    return (await response.json()) as V1Chat;
  } catch (error) {
    if (!(error instanceof HttpError && error.status === 404)) {
      console.warn(`Couldn't load legacy chat ${chatId}:`, error);
    }
    return null;
  }
}

async function requireApiKey(userId: string): Promise<string> {
  const apiKey = await getUserV0ApiKey(userId);
  if (!apiKey) {
    throw new HttpError(
      428,
      "Set your v0 API key to continue",
      API_ERROR_CODES.v0ApiKeyRequired,
    );
  }
  return apiKey;
}

export async function listLegacyChats(userId: string): Promise<LegacyChat[]> {
  const legacyIds = new Set(await getChatIdsByUserId(userId, "v1"));
  if (legacyIds.size === 0) {
    return [];
  }

  const apiKey = await getUserV0ApiKey(userId);
  if (!apiKey) {
    return [];
  }

  const chats = await mapWithConcurrency(
    [...legacyIds],
    LEGACY_FETCH_CONCURRENCY,
    (chatId) => getLegacyChat(apiKey, chatId),
  );

  return chats
    .filter((chat): chat is V1Chat => chat !== null)
    .map((chat) => ({
      id: chat.id,
      name: chat.name || chat.title || "Untitled chat",
      updatedAt: chat.updatedAt ?? chat.createdAt,
    }))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function migrateLegacyChat(
  userId: string,
  legacyChatId: string,
): Promise<string> {
  const apiKey = await requireApiKey(userId);

  const chatResponse = await requestV1(apiKey, `/chats/${legacyChatId}`);
  const legacyChat = (await chatResponse.json()) as V1Chat;
  const versionId = legacyChat.latestVersion?.id;

  if (!versionId) {
    throw new HttpError(
      422,
      "This chat has no generated code to migrate. Start a new chat instead.",
    );
  }

  const zipResponse = await requestV1(
    apiKey,
    `/chats/${legacyChatId}/versions/${versionId}/download?format=zip&includeDefaultFiles=true`,
  );
  const zip = Buffer.from(await zipResponse.arrayBuffer());

  if (zip.byteLength > MAX_LEGACY_ZIP_BYTES) {
    throw new HttpError(413, "This project is too large to migrate.");
  }

  const v0 = await getV0ClientForUser(userId);
  const { chat } = unwrapV0(
    await v0.chats.createFromZip({
      url: `data:application/zip;base64,${zip.toString("base64")}`,
      privacy: "private",
      title: legacyChat.name || legacyChat.title || "Migrated chat",
      metadata: {
        migratedFrom: "v1",
        v1ChatId: legacyChatId,
        v1VersionId: versionId,
      },
    }),
  );

  await replaceLegacyChatOwnership(legacyChatId, chat.id, userId);
  return chat.id;
}
