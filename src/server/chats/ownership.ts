import "server-only";

import { getChatOwnership } from "@/server/db/queries/chat-ownerships";
import { HttpError } from "@/server/http/errors";

/**
 * Ensures a chat is owned by the given user.
 * @throws HttpError 404 when the chat is unknown, 403 when owned by someone else
 */
export async function assertChatOwner(
  chatId: string,
  userId: string,
): Promise<void> {
  const ownership = await getChatOwnership(chatId);

  if (!ownership) {
    throw new HttpError(404, "Chat not found");
  }

  if (ownership.user_id !== userId) {
    throw new HttpError(403, "Forbidden");
  }
}
