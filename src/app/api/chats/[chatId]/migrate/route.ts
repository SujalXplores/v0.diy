import { API_ERROR_CODES } from "@/lib/api-error-codes";
import { migrateLegacyChat } from "@/server/chats/legacy-chats";
import { getOwnedChatVersion } from "@/server/chats/ownership";
import { chatIdSchema } from "@/server/chats/schemas";
import { HttpError } from "@/server/http/errors";
import {
  assertSameOrigin,
  parseParam,
  requireUserId,
} from "@/server/http/request";
import { handleRoute } from "@/server/http/route";

type Context = RouteContext<"/api/chats/[chatId]/migrate">;

export const maxDuration = 120;

export const POST = handleRoute(
  "Migrate chat error",
  "Failed to migrate the chat",
  async (request: Request, { params }: Context) => {
    assertSameOrigin(request);
    const userId = await requireUserId();
    const chatId = parseParam((await params).chatId, chatIdSchema);

    if ((await getOwnedChatVersion(chatId, userId)) !== "v1") {
      throw new HttpError(
        409,
        "This chat already uses the current v0 API.",
        API_ERROR_CODES.legacyChat,
      );
    }

    return Response.json(
      { chatId: await migrateLegacyChat(userId, chatId) },
      { status: 201 },
    );
  },
);
