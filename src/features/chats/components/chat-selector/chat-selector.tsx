"use client";

import { MessageSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserChats } from "../../hooks/use-user-chats";
import {
  getChatDisplayName,
  getChatIdFromPathname,
} from "../../lib/chat-display";
import { ChatActionsMenu } from "./chat-actions-menu";

const MAX_LISTED_CHATS = 15;

function ChatLabel({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <MessageSquare className="h-4 w-4" />
      <span className="truncate">{name}</span>
    </div>
  );
}

/** Header dropdown to switch chats, plus actions for the open chat. */
export function ChatSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { chats, isSignedIn } = useUserChats();

  if (!isSignedIn) {
    return null;
  }

  const currentChatId = getChatIdFromPathname(pathname);
  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return (
    <div className="flex items-center gap-1">
      <Select
        value={currentChatId ?? ""}
        onValueChange={(chatId) => router.push(`/chats/${chatId}`)}
      >
        <SelectTrigger className="w-fit min-w-37.5 max-w-62.5" size="sm">
          <SelectValue placeholder="Select chat">
            <ChatLabel
              name={
                currentChat ? getChatDisplayName(currentChat) : "Select chat"
              }
            />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {chats.length > 0 ? (
            chats.slice(0, MAX_LISTED_CHATS).map((chat) => (
              <SelectItem key={chat.id} value={chat.id}>
                <ChatLabel name={getChatDisplayName(chat)} />
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-muted-foreground text-sm">
              No chats yet
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Keyed so dialog state resets when switching chats. */}
      {currentChat && (
        <ChatActionsMenu key={currentChat.id} chat={currentChat} />
      )}
    </div>
  );
}
