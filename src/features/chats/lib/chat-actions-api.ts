import type { ChatDetail } from "v0-sdk";
import { requestJson } from "@/lib/http-client";
import type { ChatPrivacy } from "../types";

const chatUrl = (chatId: string) => `/api/chats/${chatId}`;

export function renameChat(chatId: string, name: string): Promise<ChatDetail> {
  return requestJson<ChatDetail>(
    chatUrl(chatId),
    { method: "PATCH", json: { name } },
    "Failed to rename chat",
  );
}

export async function deleteChat(chatId: string): Promise<void> {
  await requestJson(
    chatUrl(chatId),
    { method: "DELETE" },
    "Failed to delete chat",
  );
}

export function duplicateChat(chatId: string): Promise<ChatDetail> {
  return requestJson<ChatDetail>(
    "/api/chat/fork",
    { method: "POST", json: { chatId } },
    "Failed to duplicate chat",
  );
}

export function updateChatVisibility(
  chatId: string,
  privacy: ChatPrivacy,
): Promise<ChatDetail> {
  return requestJson<ChatDetail>(
    `${chatUrl(chatId)}/visibility`,
    { method: "PATCH", json: { privacy } },
    "Failed to change chat visibility",
  );
}
