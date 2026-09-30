import type { ChatSummary } from "../types";

export function getChatDisplayName(chat: ChatSummary): string {
  return chat.name || chat.title || `Chat ${chat.id.slice(0, 8)}...`;
}

/** Extracts the chat ID from a `/chats/:chatId` pathname. */
export function getChatIdFromPathname(pathname: string | null): string | null {
  const match = pathname?.match(/^\/chats\/([^/]+)/);
  return match?.[1] ?? null;
}

export function getV0ChatUrl(chatId: string): string {
  return `https://v0.app/chat/${chatId}`;
}
