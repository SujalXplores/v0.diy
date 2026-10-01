import "server-only";

import { listUserChats, type UserChat } from "@/server/chats/list-user-chats";
import { createChatPreviewTargets } from "@/server/preview/preview-url";
import type { Project } from "../types";

function toProject(chat: UserChat, previewUrl: string | null): Project {
  return {
    id: chat.id,
    name: chat.title?.trim() || "Untitled project",
    updatedAt: new Date(chat.updatedAt ?? chat.createdAt).toISOString(),
    vercelProjectId: chat.vercelProjectId ?? null,
    privacy: chat.privacy,
    previewUrl,
  };
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const [chats, toPreviewTarget] = await Promise.all([
    listUserChats(userId),
    createChatPreviewTargets(userId),
  ]);
  return chats.map((chat) =>
    toProject(chat, toPreviewTarget?.(chat.id).url ?? null),
  );
}
