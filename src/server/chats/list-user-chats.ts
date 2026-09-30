import "server-only";

import type { ChatsFindResponse } from "v0-sdk";
import { getChatIdsByUserId } from "@/server/db/queries/chat-ownerships";
import { getV0ClientForUser } from "@/server/v0/client";

export type UserChat = ChatsFindResponse["data"][number];

/** Lists the v0 chats owned by a user, in the order v0 returns them. */
export async function listUserChats(userId: string): Promise<UserChat[]> {
  const ownedChatIds = new Set(await getChatIdsByUserId(userId));

  if (ownedChatIds.size === 0) {
    return [];
  }

  const v0Client = await getV0ClientForUser(userId);
  const { data } = await v0Client.chats.find();

  return data.filter((chat) => ownedChatIds.has(chat.id));
}
