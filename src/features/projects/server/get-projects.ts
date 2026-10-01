import "server-only";

import { listUserChats, type UserChat } from "@/server/chats/list-user-chats";
import type { Project } from "../types";

function toProject(chat: UserChat): Project {
  return {
    id: chat.id,
    name: chat.title?.trim() || "Untitled project",
    updatedAt: new Date(chat.updatedAt ?? chat.createdAt).toISOString(),
    vercelProjectId: chat.vercelProjectId ?? null,
  };
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const chats = await listUserChats(userId);
  return chats.map(toProject);
}
