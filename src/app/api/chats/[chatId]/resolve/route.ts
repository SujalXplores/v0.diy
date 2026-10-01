import type { MessagesResolveStreamData } from "v0";
import { authorizeChatRoute } from "@/server/chats/route-auth";
import { resolveTaskBodySchema } from "@/server/chats/schemas";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { openV0Stream } from "@/server/v0/stream";

type Context = RouteContext<"/api/chats/[chatId]/resolve">;
type ResolveTask = MessagesResolveStreamData["body"]["task"];

export const maxDuration = 60;

export const POST = handleRoute(
  "Resolve task error",
  "Failed to send your answer",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    const { task, modelConfiguration } = await parseJsonBody(
      request,
      resolveTaskBodySchema,
    );

    const opened = await openV0Stream(
      (options) =>
        v0.messages.resolveStream(
          {
            chatId,
            task: task as ResolveTask,
            ...(modelConfiguration && { modelConfiguration }),
          },
          options,
        ),
      { signal: request.signal },
    );

    return opened.result.toResponse();
  },
);
