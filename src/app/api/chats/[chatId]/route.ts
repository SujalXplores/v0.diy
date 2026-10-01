import { authorizeChatRoute } from "@/server/chats/route-auth";
import { updateChatBodySchema } from "@/server/chats/schemas";
import { deleteChatOwnership } from "@/server/db/queries/chat-ownerships";
import { HttpError } from "@/server/http/errors";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

type Context = RouteContext<"/api/chats/[chatId]">;

export const GET = handleRoute(
  "Get chat error",
  "Failed to load the chat",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    return Response.json(unwrapV0(await v0.chats.get({ chatId })));
  },
);

export const PATCH = handleRoute(
  "Update chat error",
  "Failed to update the chat",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    const { title, privacy } = await parseJsonBody(
      request,
      updateChatBodySchema,
    );

    const chat = unwrapV0(
      await v0.chats.update({
        chatId,
        ...(title !== undefined && { title }),
        ...(privacy !== undefined && { privacy }),
      }),
    );
    return Response.json(chat);
  },
);

export const DELETE = handleRoute(
  "Delete chat error",
  "Failed to delete the chat",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);

    try {
      unwrapV0(await v0.chats.delete({ chatId }));
    } catch (error) {
      if (!(error instanceof HttpError && error.status === 404)) {
        throw error;
      }
    }

    await deleteChatOwnership(chatId);
    return Response.json({ chatId });
  },
);
