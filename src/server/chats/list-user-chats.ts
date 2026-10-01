import "server-only";

import type { Chat } from "v0";
import { getChatIdsByUserId } from "@/server/db/queries/chat-ownerships";
import { getV0ClientForUser, unwrapV0 } from "@/server/v0/client";

export type UserChat = Chat;

const PAGE_SIZE = 100;
const MAX_PAGES = 5;

const updatedTime = (chat: Chat) =>
  new Date(chat.updatedAt ?? chat.createdAt).getTime();

export async function listUserChats(userId: string): Promise<UserChat[]> {
  const ownedChatIds = new Set(await getChatIdsByUserId(userId, "v2"));

  if (ownedChatIds.size === 0) {
    return [];
  }

  const v0 = await getV0ClientForUser(userId);
  const chats: Chat[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = unwrapV0(
      await v0.chats.list({ limit: PAGE_SIZE, ...(cursor && { cursor }) }),
    );

    for (const chat of data.chats) {
      if (ownedChatIds.has(chat.id)) {
        chats.push(chat);
      }
    }

    if (!data.cursor || chats.length >= ownedChatIds.size) {
      break;
    }
    cursor = data.cursor;
  }

  return chats.sort((a, b) => updatedTime(b) - updatedTime(a));
}
