import "server-only";

import { API_ERROR_CODES } from "@/lib/api-error-codes";
import { countChatsCreatedSince } from "@/server/db/queries/chat-ownerships";
import { HttpError } from "@/server/http/errors";

/** Chats a signed-in user may create in a rolling window. */
const MAX_CHATS_PER_WINDOW = 50;
const WINDOW_MS = 24 * 60 * 60 * 1000;

/** @throws HttpError 429 when the user created too many chats recently */
export async function assertWithinChatRateLimit(userId: string): Promise<void> {
  const chatCount = await countChatsCreatedSince(
    userId,
    new Date(Date.now() - WINDOW_MS),
  );

  if (chatCount >= MAX_CHATS_PER_WINDOW) {
    throw new HttpError(
      429,
      "You have exceeded your maximum number of messages for the day. Please try again later.",
      API_ERROR_CODES.rateLimited,
    );
  }
}
