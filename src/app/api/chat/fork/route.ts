import { assertChatOwner } from "@/server/chats/ownership";
import { chatIdBodySchema } from "@/server/chats/schemas";
import { createChatOwnership } from "@/server/db/queries/chat-ownerships";
import { toErrorResponse } from "@/server/http/errors";
import { parseJsonBody, requireUserId } from "@/server/http/request";
import { getV0ClientForUser } from "@/server/v0/client";

/** Duplicates a chat the user owns into a new private chat. */
export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const { chatId } = await parseJsonBody(request, chatIdBodySchema);

    await assertChatOwner(chatId, userId);
    const v0Client = await getV0ClientForUser(userId);

    const forkedChat = await v0Client.chats.fork({
      chatId,
      privacy: "private",
    });
    // Without an ownership record the new chat would 404 when opened.
    await createChatOwnership(forkedChat.id, userId);

    return Response.json(forkedChat);
  } catch (error) {
    return toErrorResponse(error, "Error forking chat", "Failed to fork chat");
  }
}
