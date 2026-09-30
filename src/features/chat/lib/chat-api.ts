import type { ChatDetail } from "v0-sdk";
import { API_ERROR_CODES } from "@/lib/api-error-codes";
import { readApiError, requestJson } from "@/lib/http-client";
import type { AttachmentPayload } from "../types";

const DEFAULT_ERROR_MESSAGE =
  "Sorry, there was an error processing your message. Please try again.";
const RATE_LIMIT_ERROR_MESSAGE =
  "You have exceeded your maximum number of messages for the day. Please try again later.";

export const getChatCacheKey = (chatId: string) => `/api/chats/${chatId}`;
export const USER_CHATS_CACHE_KEY = "/api/chats";

export type ChatStreamResult =
  | { status: "streaming"; stream: ReadableStream<Uint8Array> }
  | { status: "missing-key" }
  | { status: "error"; message: string };

interface ChatStreamRequest {
  message: string;
  /** Continues this chat; a new chat is created when omitted. */
  chatId?: string | undefined;
  attachments?: AttachmentPayload[];
}

/** Sends a message and returns the response stream, or why it failed. */
export async function requestChatStream({
  message,
  chatId,
  attachments = [],
}: ChatStreamRequest): Promise<ChatStreamResult> {
  let response: Response;

  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        chatId,
        streaming: true,
        ...(attachments.length > 0 && { attachments }),
      }),
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
    };
  }

  if (!response.ok) {
    const { error, code } = await readApiError(response);

    if (code === API_ERROR_CODES.v0ApiKeyRequired) {
      return { status: "missing-key" };
    }

    const fallback =
      response.status === 429
        ? RATE_LIMIT_ERROR_MESSAGE
        : DEFAULT_ERROR_MESSAGE;
    return { status: "error", message: error ?? fallback };
  }

  if (!response.body) {
    return { status: "error", message: "No response body for streaming" };
  }

  return { status: "streaming", stream: response.body };
}

export function fetchChat(chatId: string): Promise<ChatDetail> {
  return requestJson<ChatDetail>(getChatCacheKey(chatId));
}

/** Fetches chat details, returning null (and logging) on failure. */
export async function fetchChatSafely(
  chatId: string,
): Promise<ChatDetail | null> {
  try {
    return await fetchChat(chatId);
  } catch (error) {
    console.error("Error fetching chat details:", error);
    return null;
  }
}

/** The URL of the chat's live demo, preferring the latest version. */
export function getDemoUrl(chat: ChatDetail): string | undefined {
  return chat.latestVersion?.demoUrl || chat.demo;
}

/** Records the current user as owner of a chat created by a stream. */
export async function recordChatOwnership(chatId: string): Promise<void> {
  try {
    await requestJson("/api/chat/ownership", {
      method: "POST",
      json: { chatId },
    });
  } catch (error) {
    // The chat still works; it just won't be listed for this user.
    console.error("Failed to create chat ownership:", error);
  }
}
