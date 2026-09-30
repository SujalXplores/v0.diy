import { assertChatOwner } from "@/server/chats/ownership";
import { updateChatBodySchema } from "@/server/chats/schemas";
import { deleteChatOwnership } from "@/server/db/queries/chat-ownerships";
import { toErrorResponse } from "@/server/http/errors";
import { parseJsonBody, requireUserId } from "@/server/http/request";
import { getV0ClientForUser } from "@/server/v0/client";

type ChatRouteContext = RouteContext<"/api/chats/[chatId]">;

/** Resolves the route's chat and returns a v0 client for its owner. */
async function authorizeChatRequest(context: ChatRouteContext) {
  const userId = await requireUserId();
  const { chatId } = await context.params;

  await assertChatOwner(chatId, userId);
  const v0Client = await getV0ClientForUser(userId);

  return { chatId, v0Client };
}

export async function GET(_request: Request, context: ChatRouteContext) {
  try {
    const { chatId, v0Client } = await authorizeChatRequest(context);

    return Response.json(await v0Client.chats.getById({ chatId }));
  } catch (error) {
    return toErrorResponse(
      error,
      "Error fetching chat details",
      "Failed to fetch chat details",
    );
  }
}

/** Renames a chat. */
export async function PATCH(request: Request, context: ChatRouteContext) {
  try {
    const { chatId, v0Client } = await authorizeChatRequest(context);
    const { name } = await parseJsonBody(request, updateChatBodySchema);

    return Response.json(await v0Client.chats.update({ chatId, name }));
  } catch (error) {
    return toErrorResponse(error, "Rename Chat Error", "Failed to rename chat");
  }
}

/** Deletes a chat from v0 and forgets its ownership record. */
export async function DELETE(_request: Request, context: ChatRouteContext) {
  try {
    const { chatId, v0Client } = await authorizeChatRequest(context);

    const result = await v0Client.chats.delete({ chatId });
    await deleteChatOwnership(chatId);

    return Response.json(result);
  } catch (error) {
    return toErrorResponse(
      error,
      "Error deleting chat",
      "Failed to delete chat",
    );
  }
}
