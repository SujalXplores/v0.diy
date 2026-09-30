import "server-only";

import { listUserChats, type UserChat } from "@/server/chats/list-user-chats";
import type { Project } from "../types";

/** Prefers the latest version's demo, falling back to the legacy `demo` field. */
function getDemoUrl(chat: UserChat): string | null {
  if (chat.latestVersion?.demoUrl) {
    return chat.latestVersion.demoUrl;
  }

  return "demo" in chat && typeof chat.demo === "string" ? chat.demo : null;
}

function toProject(chat: UserChat): Project {
  return {
    id: chat.id,
    name: chat.name || chat.title || "Untitled Project",
    demoUrl: getDemoUrl(chat),
    updatedAt: chat.updatedAt ?? chat.createdAt,
  };
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const chats = await listUserChats(userId);
  return chats.map(toProject);
}
