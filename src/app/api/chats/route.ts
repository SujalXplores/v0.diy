import { auth } from "@/server/auth/auth";
import { CHAT_METADATA } from "@/server/chats/import-chat";
import { listUserChats } from "@/server/chats/list-user-chats";
import { assertWithinChatRateLimit } from "@/server/chats/rate-limit";
import { authorizeUserRoute } from "@/server/chats/route-auth";
import { createChatBodySchema } from "@/server/chats/schemas";
import { createChatOwnership } from "@/server/db/queries/chat-ownerships";
import { HttpError } from "@/server/http/errors";
import { parseJsonBody } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { getStreamChatId, openV0Stream } from "@/server/v0/stream";

export const maxDuration = 300;

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ chats: [] });
  }

  return handleRoute("Chats list error", "Failed to fetch chats", async () =>
    Response.json({ chats: await listUserChats(userId) }),
  )();
}

export const POST = handleRoute(
  "Create chat error",
  "Failed to start the chat",
  async (request: Request) => {
    const { userId, v0 } = await authorizeUserRoute(request);
    const body = await parseJsonBody(request, createChatBodySchema);
    await assertWithinChatRateLimit(userId);

    const opened = await openV0Stream(
      (options) =>
        v0.chats.createStream(
          {
            message: body.message,
            privacy: "private",
            metadata: CHAT_METADATA,
            ...(body.attachments?.length
              ? { attachments: body.attachments }
              : {}),
            ...(body.modelConfiguration && {
              modelConfiguration: body.modelConfiguration,
            }),
          },
          options,
        ),
      {
        signal: request.signal,
        until: (update) => Boolean(getStreamChatId(update)),
      },
    );

    const chatId = getStreamChatId(opened.first);
    if (!(chatId && (await createChatOwnership(chatId, userId)))) {
      throw new HttpError(502, "v0 didn't return a usable chat");
    }

    return opened.result.toResponse();
  },
);
