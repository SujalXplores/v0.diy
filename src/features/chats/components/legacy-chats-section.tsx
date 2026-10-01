"use client";

import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { migrateChat } from "@/features/chat/lib/chat-api";
import { describeChatError } from "@/features/chat/lib/chat-errors";
import { formatRelativeTime } from "@/lib/format-relative-time";

export interface LegacyChatSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export function LegacyChatsSection({ chats }: { chats: LegacyChatSummary[] }) {
  const router = useRouter();
  const [migratingId, setMigratingId] = useState<string | null>(null);

  const migrate = async (chat: LegacyChatSummary) => {
    setMigratingId(chat.id);
    try {
      const { chatId } = await migrateChat(chat.id);
      toast.success(`Migrated “${chat.name}”`);
      router.push(`/chats/${encodeURIComponent(chatId)}`);
    } catch (error) {
      toast.error("Migration failed", {
        description: describeChatError(error).message,
      });
      setMigratingId(null);
    }
  };

  return (
    <section aria-labelledby="legacy-chats-heading" className="mt-8">
      <h2
        id="legacy-chats-heading"
        className="mb-1 font-medium text-muted-foreground text-xs"
      >
        Legacy chats
      </h2>
      <p className="mb-3 text-muted-foreground text-xs">
        Created with the previous v0 API. Migrating moves the latest code into a
        new chat; the original conversation stays on v0.app.
      </p>
      <ItemGroup>
        {chats.map((chat) => (
          <Item key={chat.id} variant="outline" size="sm" role="listitem">
            <ItemMedia variant="icon">
              <HugeiconsIcon
                icon={ArrowDataTransferHorizontalIcon}
                strokeWidth={2}
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{chat.name}</ItemTitle>
              <ItemDescription>
                <time dateTime={chat.updatedAt} suppressHydrationWarning>
                  Updated {formatRelativeTime(chat.updatedAt)}
                </time>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="sm"
                variant="outline"
                onClick={() => migrate(chat)}
                disabled={migratingId !== null}
              >
                {migratingId === chat.id && (
                  <Spinner data-icon="inline-start" />
                )}
                {migratingId === chat.id ? "Migrating…" : "Migrate"}
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </section>
  );
}
