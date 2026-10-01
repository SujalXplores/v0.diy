import {
  type Message,
  toV0UIMessage,
  type V0StreamUpdate,
  type V0UIMessage,
} from "@v0-sdk/react";
import { readV0Stream } from "v0/browser";
import { ApiRequestError, readApiError } from "@/lib/http-client";

export type ChatMessagePart = V0UIMessage["parts"][number];

export function findActiveAssistant(
  messages: readonly V0UIMessage[],
): V0UIMessage | undefined {
  const last = messages.at(-1);
  return last?.role === "assistant" && last.metadata?.finishReason == null
    ? last
    : undefined;
}

export function getMessageText(message: V0UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<ChatMessagePart, { type: "text" }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join("\n\n")
    .trim();
}

const RESUME_WINDOW_MS = 15 * 60 * 1000;

export function mayBeGenerating(history: readonly Message[]): boolean {
  const newest = history[0];
  if (!newest) {
    return false;
  }
  if (newest.role === "assistant") {
    return newest.finishReason === null;
  }
  return Date.now() - new Date(newest.createdAt).getTime() < RESUME_WINDOW_MS;
}

export function upsertMessage(
  messages: readonly V0UIMessage[],
  message: V0UIMessage,
): V0UIMessage[] {
  const index = messages.findIndex((current) => current.id === message.id);
  if (index === -1) {
    return [...messages, message];
  }
  return messages.map((current, i) => (i === index ? message : current));
}

const EMPTY_USAGE: Message["usage"] = {
  model: null,
  tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  creditsCost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
};

function readMessageId(update: V0StreamUpdate): string | undefined {
  if (update.message) {
    return update.message.id;
  }
  const { event } = update;
  return event.object === "chat" || event.object === "chat.title"
    ? undefined
    : event.id;
}

function toMessageSnapshot(
  update: V0StreamUpdate,
  chatId: string,
  messageId: string,
): Message {
  const base: Message = update.message ?? {
    id: messageId,
    chatId,
    role: "assistant",
    content: "",
    parts: [],
    finishReason: null,
    restorable: false,
    authorId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    usage: EMPTY_USAGE,
  };

  return {
    ...base,
    parts: update.parts,
    usage: update.usage ?? base.usage,
  };
}

export async function consumeV0MessageStream(
  response: Response,
  {
    chatId,
    onMessage,
    signal,
  }: {
    chatId: string;
    onMessage: (message: V0UIMessage) => void;
    signal?: AbortSignal;
  },
): Promise<void> {
  const result = readV0Stream(response);
  let messageId: string | undefined;

  for await (const update of result.stream) {
    if (signal?.aborted) {
      return;
    }
    messageId = readMessageId(update) ?? messageId;
    if (messageId) {
      onMessage(toV0UIMessage(toMessageSnapshot(update, chatId, messageId)));
    }
  }
}

export async function consumeV0Response(
  response: Response,
  options: Parameters<typeof consumeV0MessageStream>[1],
): Promise<void> {
  if (response.status === 204) {
    return;
  }
  if (!response.ok) {
    const { error, code } = await readApiError(response);
    throw new ApiRequestError(error ?? "Request failed", response.status, code);
  }
  await consumeV0MessageStream(response, options);
}

export function formatCredits(message: V0UIMessage): string | null {
  const total = message.metadata?.usage?.creditsCost?.total;
  if (!total) {
    return null;
  }
  return total < 0.01 ? "<0.01" : total.toFixed(2);
}
