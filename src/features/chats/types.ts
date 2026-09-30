import type { ChatDetail, ChatsFindResponse } from "v0-sdk";

/** A chat as listed by GET /api/chats. */
export type ChatSummary = ChatsFindResponse["data"][number];

export type ChatPrivacy = ChatDetail["privacy"];

export interface ChatsResponse {
  data: ChatSummary[];
}
