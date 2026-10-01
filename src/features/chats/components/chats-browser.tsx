"use client";

import {
  Add01Icon,
  ArrowRight01Icon,
  BubbleChatIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { ListToolbar } from "@/components/layout/list-toolbar";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getChatDisplayName } from "../lib/chat-display";
import { getPrivacyOption } from "../lib/chat-privacy";
import { groupChatsByAge } from "../lib/group-chats";
import type { ChatSummary } from "../types";
import {
  type LegacyChatSummary,
  LegacyChatsSection,
} from "./legacy-chats-section";

interface ChatsBrowserProps {
  chats: ChatSummary[];
  legacyChats?: LegacyChatSummary[];
}

function NewChatButton() {
  return (
    <Button asChild>
      <Link href="/">
        <HugeiconsIcon
          icon={Add01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        New chat
      </Link>
    </Button>
  );
}

function ChatRow({ chat }: { chat: ChatSummary }) {
  const privacy = getPrivacyOption(chat.privacy);
  const updatedAt = chat.updatedAt ?? chat.createdAt;

  return (
    <Item asChild variant="outline" size="sm" role="listitem">
      <Link href={`/chats/${chat.id}`}>
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={BubbleChatIcon} strokeWidth={2} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{getChatDisplayName(chat)}</ItemTitle>
          <ItemDescription className="flex items-center gap-1">
            <HugeiconsIcon
              icon={privacy.icon}
              strokeWidth={2}
              className="size-3"
            />
            {privacy.label}
            <span aria-hidden="true">·</span>
            <time
              dateTime={new Date(updatedAt).toISOString()}
              suppressHydrationWarning
            >
              {formatRelativeTime(updatedAt)}
            </time>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-4 text-muted-foreground opacity-0 transition-[opacity,translate] group-hover/item:translate-x-0.5 group-hover/item:opacity-100 group-focus-visible/item:opacity-100"
          />
        </ItemActions>
      </Link>
    </Item>
  );
}

function EmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={BubbleChatIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No chats yet</EmptyTitle>
        <EmptyDescription>
          Describe something you want to build. Every conversation you start
          shows up here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <NewChatButton />
      </EmptyContent>
    </Empty>
  );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No chats match &ldquo;{query}&rdquo;</EmptyTitle>
        <EmptyDescription>
          Check the spelling or try another name.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onClear}>
          Clear search
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function matchesQuery(chat: ChatSummary, query: string): boolean {
  return getChatDisplayName(chat).toLowerCase().includes(query);
}

export function ChatsBrowser({ chats, legacyChats = [] }: ChatsBrowserProps) {
  const [query, setQuery] = useState("");

  if (chats.length === 0) {
    return (
      <>
        <EmptyState />
        {legacyChats.length > 0 && <LegacyChatsSection chats={legacyChats} />}
      </>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const visibleChats = normalizedQuery
    ? chats.filter((chat) => matchesQuery(chat, normalizedQuery))
    : chats;
  const groups = groupChatsByAge(visibleChats);

  return (
    <>
      <ListToolbar
        search={
          <SearchField
            value={query}
            onValueChange={setQuery}
            placeholder="Search chats..."
          />
        }
        summary={
          normalizedQuery
            ? `${visibleChats.length} of ${chats.length}`
            : `${chats.length} ${chats.length === 1 ? "chat" : "chats"}`
        }
        action={<NewChatButton />}
      />

      {visibleChats.length === 0 ? (
        <NoResults query={query.trim()} onClear={() => setQuery("")} />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="mb-2 font-medium text-muted-foreground text-xs">
                {group.label}
              </h2>
              <ItemGroup>
                {group.chats.map((chat) => (
                  <ChatRow key={chat.id} chat={chat} />
                ))}
              </ItemGroup>
            </section>
          ))}
        </div>
      )}

      {legacyChats.length > 0 && !normalizedQuery && (
        <LegacyChatsSection chats={legacyChats} />
      )}
    </>
  );
}
