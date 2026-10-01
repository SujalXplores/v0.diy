import type { Chat, Files, Message, MessageListResponse } from "@v0-sdk/react";
import { requestJson } from "@/lib/http-client";

const chatPath = (chatId: string) => `/api/chats/${encodeURIComponent(chatId)}`;

export const chatUrls = {
  create: "/api/chats",
  list: "/api/chats",
  chat: chatPath,
  messages: (chatId: string) => `${chatPath(chatId)}/messages`,
  resume: (chatId: string) => `${chatPath(chatId)}/resume`,
  resolve: (chatId: string) => `${chatPath(chatId)}/resolve`,
  restore: (chatId: string) => `${chatPath(chatId)}/restore`,
  stop: (chatId: string, messageId: string) =>
    `${chatPath(chatId)}/messages/${encodeURIComponent(messageId)}/stop`,
  files: (chatId: string) => `${chatPath(chatId)}/files`,
  download: (chatId: string) => `${chatPath(chatId)}/download`,
  duplicate: (chatId: string) => `${chatPath(chatId)}/duplicate`,
  deploy: (chatId: string) => `${chatPath(chatId)}/deploy`,
  project: (chatId: string) => `${chatPath(chatId)}/project`,
  connectStatus: (chatId: string, requestId: string) =>
    `${chatPath(chatId)}/connect-status?requestId=${encodeURIComponent(requestId)}`,
  migrate: (chatId: string) => `${chatPath(chatId)}/migrate`,
  previewUrl: (chatId: string) => `${chatPath(chatId)}/preview-url`,
} as const;

export const USER_CHATS_CACHE_KEY = chatUrls.list;

export function fetchMessagesPage(
  chatId: string,
  { limit = 50, cursor }: { limit?: number; cursor?: string | null } = {},
): Promise<MessageListResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set("cursor", cursor);
  }
  return requestJson<MessageListResponse>(
    `${chatUrls.messages(chatId)}?${params}`,
    {},
    "Failed to load messages",
  );
}

export async function stopMessage(
  chatId: string,
  messageId: string,
): Promise<void> {
  await requestJson(
    chatUrls.stop(chatId, messageId),
    { method: "POST" },
    "Failed to stop the generation",
  );
}

export function restoreMessage(
  chatId: string,
  messageId: string,
): Promise<{ messages: Message[] }> {
  return requestJson(
    chatUrls.restore(chatId),
    { method: "POST", json: { messageId } },
    "Failed to restore that version",
  );
}

export function fetchFiles(chatId: string): Promise<Files> {
  return requestJson<Files>(chatUrls.files(chatId), {}, "Failed to load code");
}

export function updateFiles(
  chatId: string,
  files: { path: string; content: string | null }[],
): Promise<{ messages: Message[] }> {
  return requestJson(
    chatUrls.files(chatId),
    { method: "PATCH", json: { files } },
    "Failed to save your changes",
  );
}

export function deployChat(
  chatId: string,
): Promise<{ deploymentId: string; vercelProjectId: string }> {
  return requestJson(
    chatUrls.deploy(chatId),
    { method: "POST" },
    "Failed to start the deployment",
  );
}

export function createVercelProject(
  chatId: string,
): Promise<{ vercelProjectId: string }> {
  return requestJson(
    chatUrls.project(chatId),
    { method: "POST" },
    "Failed to create the Vercel project",
  );
}

export function duplicateChat(chatId: string): Promise<Chat> {
  return requestJson<Chat>(
    chatUrls.duplicate(chatId),
    { method: "POST", json: {} },
    "Failed to duplicate the chat",
  );
}

export function migrateChat(chatId: string): Promise<{ chatId: string }> {
  return requestJson(
    chatUrls.migrate(chatId),
    { method: "POST" },
    "Failed to migrate the chat",
  );
}

export type ImportSource =
  | { kind: "repo"; url: string; branch?: string }
  | { kind: "zip"; url: string; title?: string }
  | { kind: "files"; files: { name: string; content: string }[] };

export async function importChat(source: ImportSource): Promise<string> {
  const { kind, ...body } = source;
  const { chatId } = await requestJson<{ chatId: string }>(
    `/api/chats/import/${kind}`,
    { method: "POST", json: body },
    "Import failed",
  );
  return chatId;
}

export interface ConnectStatus {
  status: "pending" | "ready" | "error";
  message?: string;
}

export function fetchConnectStatus(
  chatId: string,
  requestId: string,
): Promise<ConnectStatus> {
  return requestJson<ConnectStatus>(
    chatUrls.connectStatus(chatId, requestId),
    {},
    "Failed to check the connection",
  );
}
