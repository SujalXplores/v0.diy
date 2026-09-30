import { chatIdBodySchema } from "@/server/chats/schemas";
import { createChatOwnership } from "@/server/db/queries/chat-ownerships";
import { toErrorResponse } from "@/server/http/errors";
import { parseJsonBody, requireUserId } from "@/server/http/request";

/** Records the signed-in user as owner of a chat created by a stream. */
export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const { chatId } = await parseJsonBody(request, chatIdBodySchema);

    await createChatOwnership(chatId, userId);

    return Response.json({ success: true });
  } catch (error) {
    return toErrorResponse(
      error,
      "Failed to create chat ownership",
      "Failed to create ownership record",
    );
  }
}
