import type { ChatDetail } from "v0-sdk";
import { assertWithinChatRateLimit } from "@/server/chats/rate-limit";
import { sendMessageBodySchema } from "@/server/chats/schemas";
import { createChatOwnership } from "@/server/db/queries/chat-ownerships";
import { toErrorResponse } from "@/server/http/errors";
import { parseJsonBody, requireUserId } from "@/server/http/request";
import { getV0ClientForUser } from "@/server/v0/client";

const STREAMING_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
} as const;

/** Creates a chat, or continues one when `chatId` is given. */
export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const { message, chatId, streaming, attachments } = await parseJsonBody(
      request,
      sendMessageBodySchema,
    );

    await assertWithinChatRateLimit(userId);
    const v0Client = await getV0ClientForUser(userId);

    const responseMode = streaming ? "experimental_stream" : "sync";
    const attachmentOptions = attachments?.length ? { attachments } : {};

    const result = chatId
      ? await v0Client.chats.sendMessage({
          chatId,
          message,
          ...(streaming && { responseMode }),
          ...attachmentOptions,
        })
      : await v0Client.chats.create({
          message,
          responseMode,
          ...attachmentOptions,
        });

    if (result instanceof ReadableStream) {
      return new Response(result, { headers: STREAMING_HEADERS });
    }

    const chat: ChatDetail = result;

    if (!chatId) {
      await createChatOwnership(chat.id, userId).catch((error: unknown) => {
        console.error("Failed to create chat ownership:", error);
      });
    }

    return Response.json({
      id: chat.id,
      demo: chat.demo,
      messages: chat.messages,
    });
  } catch (error) {
    return toErrorResponse(error, "V0 API Error", "Failed to process request");
  }
}
