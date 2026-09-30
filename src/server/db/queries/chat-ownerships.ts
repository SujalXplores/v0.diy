import "server-only";

import { and, count, desc, eq, gte } from "drizzle-orm";
import { getDb } from "../connection";
import { type ChatOwnership, chat_ownerships } from "../schema";

/** Records that a user owns a v0 chat. Does nothing if already recorded. */
export async function createChatOwnership(
  v0ChatId: string,
  userId: string,
): Promise<void> {
  await getDb()
    .insert(chat_ownerships)
    .values({ v0_chat_id: v0ChatId, user_id: userId })
    .onConflictDoNothing({ target: chat_ownerships.v0_chat_id });
}

/** Gets the ownership record for a v0 chat ID. */
export async function getChatOwnership(
  v0ChatId: string,
): Promise<ChatOwnership | null> {
  const [ownership] = await getDb()
    .select()
    .from(chat_ownerships)
    .where(eq(chat_ownerships.v0_chat_id, v0ChatId));

  return ownership ?? null;
}

/** Gets all chat IDs owned by a user, newest first. */
export async function getChatIdsByUserId(userId: string): Promise<string[]> {
  const ownerships = await getDb()
    .select({ v0ChatId: chat_ownerships.v0_chat_id })
    .from(chat_ownerships)
    .where(eq(chat_ownerships.user_id, userId))
    .orderBy(desc(chat_ownerships.created_at));

  return ownerships.map((ownership) => ownership.v0ChatId);
}

/** Deletes the ownership record for a v0 chat ID. */
export async function deleteChatOwnership(v0ChatId: string): Promise<void> {
  await getDb()
    .delete(chat_ownerships)
    .where(eq(chat_ownerships.v0_chat_id, v0ChatId));
}

/** Counts the chats a user created since the given date. */
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
