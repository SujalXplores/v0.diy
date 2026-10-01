import { authorizeChatRoute } from "@/server/chats/route-auth";
import { restoreMessageBodySchema } from "@/server/chats/schemas";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

type Context = RouteContext<"/api/chats/[chatId]/restore">;

export const POST = handleRoute(
  "Restore message error",
  "Failed to restore that version",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    const { messageId } = await parseJsonBody(
      request,
      restoreMessageBodySchema,
    );

    return Response.json(
      unwrapV0(await v0.chats.restoreMessage({ chatId, messageId })),
    );
  },
);
