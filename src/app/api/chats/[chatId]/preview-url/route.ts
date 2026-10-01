import { assertChatOwner } from "@/server/chats/ownership";
import { chatIdSchema } from "@/server/chats/schemas";
import { parseParam, requireUserId } from "@/server/http/request";
import { handleRoute } from "@/server/http/route";
import { getChatPreviewTarget } from "@/server/preview/preview-url";

type Context = RouteContext<"/api/chats/[chatId]/preview-url">;

export const GET = handleRoute(
  "Preview URL error",
  "Failed to prepare the preview",
  async (_request: Request, { params }: Context) => {
    const userId = await requireUserId();
    const chatId = parseParam((await params).chatId, chatIdSchema);
    await assertChatOwner(chatId, userId);

    return Response.json({
      preview: await getChatPreviewTarget(chatId, userId),
    });
  },
);
