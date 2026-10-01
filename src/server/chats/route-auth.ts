import "server-only";

import type { V0Client } from "v0";
import {
  assertSameOrigin,
  parseParam,
  requireUserId,
} from "@/server/http/request";
import { getV0ClientForUser } from "@/server/v0/client";
import { assertChatOwner } from "./ownership";
import { chatIdSchema } from "./schemas";

export interface AuthorizedChatRoute {
  userId: string;
  chatId: string;
  v0: V0Client;
}

export async function authorizeChatRoute(
  request: Request,
  params: Promise<{ chatId: string }>,
): Promise<AuthorizedChatRoute> {
  assertSameOrigin(request);
  const userId = await requireUserId();
  const chatId = parseParam((await params).chatId, chatIdSchema);

  await assertChatOwner(chatId, userId);

  return { userId, chatId, v0: await getV0ClientForUser(userId) };
}

export async function authorizeUserRoute(
  request: Request,
): Promise<{ userId: string; v0: V0Client }> {
  assertSameOrigin(request);
  const userId = await requireUserId();
  return { userId, v0: await getV0ClientForUser(userId) };
}
