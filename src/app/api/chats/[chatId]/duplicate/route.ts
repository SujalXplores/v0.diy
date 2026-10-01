import { assertWithinChatRateLimit } from "@/server/chats/rate-limit";
import { authorizeChatRoute } from "@/server/chats/route-auth";
import { duplicateChatBodySchema } from "@/server/chats/schemas";
import { createChatOwnership } from "@/server/db/queries/chat-ownerships";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

type Context = RouteContext<"/api/chats/[chatId]/duplicate">;

export const POST = handleRoute(
  "Duplicate chat error",
  "Failed to duplicate the chat",
  async (request: Request, { params }: Context) => {
    const { userId, chatId, v0 } = await authorizeChatRoute(request, params);
    const { title } = await parseJsonBody(request, duplicateChatBodySchema);
    await assertWithinChatRateLimit(userId);

    const chat = unwrapV0(
      await v0.chats.duplicate({
        chatId,
        privacy: "private",
        ...(title && { title }),
      }),
    );
    await createChatOwnership(chat.id, userId);

    return Response.json(chat, { status: 201 });
  },
);
