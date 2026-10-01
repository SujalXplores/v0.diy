import { authorizeChatRoute } from "@/server/chats/route-auth";
import { messageIdSchema } from "@/server/chats/schemas";
import { HttpError } from "@/server/http/errors";
import { parseParam } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";

type Context = RouteContext<"/api/chats/[chatId]/messages/[messageId]/stop">;

export const POST = handleRoute(
  "Stop message error",
  "Failed to stop the generation",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    const messageId = parseParam((await params).messageId, messageIdSchema);

    try {
      unwrapV0(await v0.messages.stop({ chatId, messageId }));
    } catch (error) {
      if (!(error instanceof HttpError && error.status === 409)) {
        throw error;
      }
    }

    return Response.json({ messageId });
  },
);
