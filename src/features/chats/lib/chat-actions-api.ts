import type { Chat } from "@v0-sdk/react";
import {
  chatUrls,
  duplicateChat as duplicate,
} from "@/features/chat/lib/chat-api";
import { requestJson } from "@/lib/http-client";
import type { ChatPrivacy } from "../types";

export function renameChat(chatId: string, title: string): Promise<Chat> {
  return requestJson<Chat>(
    chatUrls.chat(chatId),
    { method: "PATCH", json: { title } },
    "Failed to rename chat",
  );
}

export async function deleteChat(chatId: string): Promise<void> {
  await requestJson(
    chatUrls.chat(chatId),
    { method: "DELETE" },
    "Failed to delete chat",
  );
}

export const duplicateChat = duplicate;

export function updateChatVisibility(
  chatId: string,
  privacy: ChatPrivacy,
): Promise<Chat> {
  return requestJson<Chat>(
    chatUrls.chat(chatId),
    { method: "PATCH", json: { privacy } },
    "Failed to change chat visibility",
  );
}
