import type { MessageBinaryFormat } from "@v0-sdk/react";
import type { ChatDetail } from "v0-sdk";
import { createId } from "@/lib/create-id";
import type { ChatMessage, MessageContent, MessageRole } from "../types";

export function createMessage(
  role: MessageRole,
  content: MessageContent,
): ChatMessage {
  return { id: createId(), role, content };
}

export function createStreamingMessage(
  stream: ReadableStream<Uint8Array>,
): ChatMessage {
  return { id: createId(), role: "assistant", content: [], stream };
}

/**
 * Replaces a streaming message with its final content. Matched by ID because
 * a newer message may already be streaming after it.
 */
export function finalizeStreamingMessage(
  history: ChatMessage[],
  messageId: string,
  content: MessageContent,
): ChatMessage[] {
  return history.map((message) =>
    message.id === messageId && message.stream
      ? { id: message.id, role: message.role, content }
      : message,
  );
}

function isMessageBinaryFormat(value: unknown): value is MessageBinaryFormat {
  return (
    Array.isArray(value) &&
    value.every((row) => Array.isArray(row) && typeof row[0] === "number")
  );
}

/** Converts stored v0 messages, preferring their structured content. */
export function toChatHistory(messages: ChatDetail["messages"]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: isMessageBinaryFormat(message.experimental_content)
      ? message.experimental_content
      : message.content,
  }));
}
