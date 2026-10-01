import type { ChatPrivacy } from "@/features/chats/types";

export interface Project {
  id: string;
  name: string;
  updatedAt: string;
  vercelProjectId: string | null;
  privacy: ChatPrivacy;
  previewUrl: string | null;
}
