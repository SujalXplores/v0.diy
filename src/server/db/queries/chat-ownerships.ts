import "server-only";

import { and, count, desc, eq, gte } from "drizzle-orm";
import { getDb } from "../connection";
import {
  type ChatApiVersion,
  type ChatOwnership,
  chat_ownerships,
} from "../schema";

export async function createChatOwnership(
  v0ChatId: string,
  userId: string,
  apiVersion: ChatApiVersion = "v2",
): Promise<boolean> {
  await getDb()
    .insert(chat_ownerships)
    .values({ v0_chat_id: v0ChatId, user_id: userId, api_version: apiVersion })
    .onConflictDoNothing({ target: chat_ownerships.v0_chat_id });

  const ownership = await getChatOwnership(v0ChatId);
  return ownership?.user_id === userId;
}

export async function getChatOwnership(
  v0ChatId: string,
): Promise<ChatOwnership | null> {
  const [ownership] = await getDb()
    .select()
    .from(chat_ownerships)
    .where(eq(chat_ownerships.v0_chat_id, v0ChatId));

  return ownership ?? null;
}

export async function getChatIdsByUserId(
  userId: string,
  apiVersion: ChatApiVersion = "v2",
): Promise<string[]> {
  const ownerships = await getDb()
    .select({ v0ChatId: chat_ownerships.v0_chat_id })
    .from(chat_ownerships)
    .where(
      and(
        eq(chat_ownerships.user_id, userId),
        eq(chat_ownerships.api_version, apiVersion),
      ),
    )
    .orderBy(desc(chat_ownerships.created_at));

  return ownerships.map((ownership) => ownership.v0ChatId);
}

export async function deleteChatOwnership(v0ChatId: string): Promise<void> {
  await getDb()
    .delete(chat_ownerships)
    .where(eq(chat_ownerships.v0_chat_id, v0ChatId));
}

export async function replaceLegacyChatOwnership(
  legacyChatId: string,
  newChatId: string,
  userId: string,
): Promise<void> {
  await getDb().transaction(async (tx) => {
    await tx
      .delete(chat_ownerships)
      .where(
        and(
          eq(chat_ownerships.v0_chat_id, legacyChatId),
          eq(chat_ownerships.user_id, userId),
        ),
      );
    await tx
      .insert(chat_ownerships)
      .values({ v0_chat_id: newChatId, user_id: userId, api_version: "v2" })
      .onConflictDoNothing({ target: chat_ownerships.v0_chat_id });
  });
}

export async function countChatsCreatedSince(
  userId: string,
  since: Date,
): Promise<number> {
  const [stats] = await getDb()
    .select({ count: count(chat_ownerships.id) })
    .from(chat_ownerships)
    .where(
      and(
        eq(chat_ownerships.user_id, userId),
        gte(chat_ownerships.created_at, since),
      ),
    );

  return stats?.count ?? 0;
}
