import { authorizeChatRoute } from "@/server/chats/route-auth";
import { sendMessageBodySchema } from "@/server/chats/schemas";
import { badRequestError } from "@/server/http/errors";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { unwrapV0 } from "@/server/v0/client";
import { openV0Stream } from "@/server/v0/stream";

type Context = RouteContext<"/api/chats/[chatId]/messages">;

export const maxDuration = 300;

export const GET = handleRoute(
  "List messages error",
  "Failed to load messages",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    const searchParams = new URL(request.url).searchParams;
    const limit = Number(searchParams.get("limit") ?? 50);
    const cursor = searchParams.get("cursor");

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw badRequestError("limit must be between 1 and 100");
    }

    const page = unwrapV0(
      await v0.messages.list({ chatId, limit, ...(cursor && { cursor }) }),
    );
    return Response.json(page);
  },
);

export const POST = handleRoute(
  "Send message error",
  "Failed to send the message",
  async (request: Request, { params }: Context) => {
    const { chatId, v0 } = await authorizeChatRoute(request, params);
    const body = await parseJsonBody(request, sendMessageBodySchema);

    const opened = await openV0Stream(
      (options) =>
        v0.messages.sendStream(
          {
            chatId,
            message: body.message,
            ...(body.attachments?.length
              ? { attachments: body.attachments }
              : {}),
            ...(body.modelConfiguration && {
              modelConfiguration: body.modelConfiguration,
            }),
          },
          options,
        ),
      { signal: request.signal },
    );

    return opened.result.toResponse();
  },
);
