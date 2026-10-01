import "server-only";

import type { Chat, Message } from "v0";
import { getV0ClientForUser, unwrapV0 } from "@/server/v0/client";
import { assertChatOwner } from "./ownership";

export const INITIAL_MESSAGE_LIMIT = 50;

export interface UserChatWithMessages {
  chat: Chat;
  messages: Message[];
  cursor: string | null;
}

export async function getUserChat(
  chatId: string,
  userId: string,
): Promise<UserChatWithMessages> {
  await assertChatOwner(chatId, userId);
  const v0 = await getV0ClientForUser(userId);

  const [chatResult, messagesResult] = await Promise.all([
    v0.chats.get({ chatId }),
    v0.messages.list({ chatId, limit: INITIAL_MESSAGE_LIMIT }),
  ]);

  const chat = unwrapV0(chatResult);
  const { messages, cursor } = unwrapV0(messagesResult);

  return { chat, messages, cursor };
}
