"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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

export function ChatSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { chats } = useUserChats();

  if (chats.length === 0) {
    return null;
  }

  const currentChatId = getChatIdFromPathname(pathname);
  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return (
    <div className="flex min-w-0 items-center gap-1 max-md:hidden">
      <span aria-hidden="true" className="select-none text-muted-foreground">
        /
      </span>
      <Select
        value={currentChat?.id ?? ""}
        onValueChange={(chatId) => router.push(`/chats/${chatId}`)}
      >
        <SelectTrigger className="min-w-0 max-w-64" aria-label="Switch chat">
          <SelectValue placeholder="Recent chats">
            {currentChat && (
              <span className="truncate">
                {getChatDisplayName(currentChat)}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Recent chats</SelectLabel>
            {chats.slice(0, MAX_LISTED_CHATS).map((chat) => (
              <SelectItem key={chat.id} value={chat.id}>
                <span className="truncate">{getChatDisplayName(chat)}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {currentChat && (
        <ChatActionsMenu key={currentChat.id} chat={currentChat} />
      )}
    </div>
  );
}
