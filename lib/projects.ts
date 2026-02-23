import "server-only";

import { auth } from "@/app/(auth)/auth";
import { getChatIdsByUserId } from "@/lib/db/queries";
import { getUserV0Client } from "@/lib/v0-client";

export interface Project {
  id: string;
  name: string;
  demoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface V0Chat {
  id: string;
  name?: string;
  demo?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{ role: string; content: string }>;
}

function getProjectName(chat: V0Chat): string {
  if (chat.name) {
    return chat.name;
  }
  const firstUserMessage = chat.messages?.find((msg) => msg.role === "user");
  return firstUserMessage?.content?.slice(0, 50) || "Untitled Project";
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const userChatIds = await getChatIdsByUserId({ userId });

  if (userChatIds.length === 0) {
    return [];
  }

  const session = await auth();
  const v0Client = await getUserV0Client(session);
  const allChats = await v0Client.chats.find();
  const userChats =
    (allChats.data as V0Chat[])?.filter((chat) =>
      userChatIds.includes(chat.id),
    ) || [];

  return userChats.map((chat) => ({
    id: chat.id,
    name: getProjectName(chat),
    demoUrl: chat.demo || null,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    messageCount: chat.messages?.length || 0,
  }));
}
