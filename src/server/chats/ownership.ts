import "server-only";

import { API_ERROR_CODES } from "@/lib/api-error-codes";
import { getChatOwnership } from "@/server/db/queries/chat-ownerships";
import type { ChatApiVersion } from "@/server/db/schema";
import { HttpError } from "@/server/http/errors";

export async function getOwnedChatVersion(
  chatId: string,
  userId: string,
): Promise<ChatApiVersion> {
  const ownership = await getChatOwnership(chatId);

  if (!ownership) {
    throw new HttpError(404, "Chat not found");
  }

  if (ownership.user_id !== userId) {
    throw new HttpError(403, "Forbidden");
  }

  return ownership.api_version;
}

export async function assertChatOwner(
  chatId: string,
  userId: string,
): Promise<void> {
  const version = await getOwnedChatVersion(chatId, userId);

  if (version === "v1") {
    throw new HttpError(
      409,
      "This chat was created with the legacy v0 API. Migrate it to keep working on it.",
      API_ERROR_CODES.legacyChat,
    );
  }
}
