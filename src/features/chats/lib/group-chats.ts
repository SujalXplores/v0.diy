import type { ChatSummary } from "../types";

const HOUR_MS = 60 * 60 * 1000;

const AGE_BUCKETS = [
  { label: "Last 24 hours", maxAgeMs: 24 * HOUR_MS },
  { label: "Last 7 days", maxAgeMs: 7 * 24 * HOUR_MS },
  { label: "Last 30 days", maxAgeMs: 30 * 24 * HOUR_MS },
  { label: "Older", maxAgeMs: Number.POSITIVE_INFINITY },
] as const;

export interface ChatGroup {
  label: string;
  chats: ChatSummary[];
}

const getUpdatedTime = (chat: ChatSummary) =>
  new Date(chat.updatedAt ?? chat.createdAt).getTime();

export function groupChatsByAge(
  chats: ChatSummary[],
  now: number = Date.now(),
): ChatGroup[] {
  const sorted = [...chats].sort(
    (a, b) => getUpdatedTime(b) - getUpdatedTime(a),
  );

  let minAgeMs = 0;
  return AGE_BUCKETS.map(({ label, maxAgeMs }) => {
    const lowerBound = minAgeMs;
    minAgeMs = maxAgeMs;
    return {
      label,
      chats: sorted.filter((chat) => {
        const age = now - getUpdatedTime(chat);
        return age >= lowerBound && age < maxAgeMs;
      }),
    };
  }).filter((group) => group.chats.length > 0);
}
