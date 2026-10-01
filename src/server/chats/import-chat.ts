import "server-only";

import type { ChatWithUsage } from "v0";
import { createChatOwnership } from "@/server/db/queries/chat-ownerships";
import { HttpError } from "@/server/http/errors";
import { assertWithinChatRateLimit } from "./rate-limit";

export const CHAT_METADATA = { source: "v0.diy" } as const;

export async function importChat(
  userId: string,
  create: () => Promise<ChatWithUsage>,
): Promise<string> {
  await assertWithinChatRateLimit(userId);
  const { chat } = await create();

  if (!(await createChatOwnership(chat.id, userId))) {
    throw new HttpError(502, "v0 didn't return a usable chat");
  }
  return chat.id;
}
