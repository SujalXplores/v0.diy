import { assertChatOwner } from "@/server/chats/ownership";
import { updateVisibilityBodySchema } from "@/server/chats/schemas";
import { toErrorResponse } from "@/server/http/errors";
import { parseJsonBody, requireUserId } from "@/server/http/request";
import { getV0ClientForUser } from "@/server/v0/client";

/** Changes who can see a chat. */
export async function PATCH(
  request: Request,
  context: RouteContext<"/api/chats/[chatId]/visibility">,
) {
  try {
    const userId = await requireUserId();
    const { chatId } = await context.params;

    await assertChatOwner(chatId, userId);
    const { privacy } = await parseJsonBody(
      request,
      updateVisibilityBodySchema,
    );
    const v0Client = await getV0ClientForUser(userId);

    return Response.json(await v0Client.chats.update({ chatId, privacy }));
  } catch (error) {
    return toErrorResponse(
      error,
      "Change Chat Visibility Error",
      "Failed to change chat visibility",
    );
  }
}
