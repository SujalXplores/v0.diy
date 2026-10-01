import type { Chat } from "@v0-sdk/react";

export type ChatSummary = Pick<
  Chat,
  "id" | "title" | "privacy" | "vercelProjectId"
> & {
  createdAt: string | Date;
  updatedAt?: string | Date | undefined;
};

export type ChatPrivacy = Chat["privacy"];

export interface ChatsResponse {
  chats: ChatSummary[];
}
