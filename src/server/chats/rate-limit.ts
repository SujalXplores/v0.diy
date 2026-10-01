import "server-only";

import { API_ERROR_CODES } from "@/lib/api-error-codes";
import { countChatsCreatedSince } from "@/server/db/queries/chat-ownerships";
import { HttpError } from "@/server/http/errors";

const MAX_CHATS_PER_WINDOW = 50;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function assertWithinChatRateLimit(userId: string): Promise<void> {
  const chatCount = await countChatsCreatedSince(
    userId,
    new Date(Date.now() - WINDOW_MS),
  );

  if (chatCount >= MAX_CHATS_PER_WINDOW) {
    throw new HttpError(
      429,
      `You can start up to ${MAX_CHATS_PER_WINDOW} new chats per day. Continue an existing chat or try again later.`,
      API_ERROR_CODES.rateLimited,
    );
  }
}
