"use client";

import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";
import { migrateChat, USER_CHATS_CACHE_KEY } from "../lib/chat-api";
import { describeChatError } from "../lib/chat-errors";

export function LegacyChatNotice({ chatId }: { chatId: string }) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { openKeyModal } = useV0ApiKeyModal();
  const [isMigrating, setIsMigrating] = useState(false);

  const migrate = async () => {
    setIsMigrating(true);
    try {
      const { chatId: newChatId } = await migrateChat(chatId);
      toast.success("Chat migrated", {
        description: "Your code is now in a new chat on the current v0 API.",
      });
      mutate(USER_CHATS_CACHE_KEY);
      router.replace(`/chats/${encodeURIComponent(newChatId)}`);
    } catch (error) {
      const info = describeChatError(error);
      if (info.needsApiKey) {
        openKeyModal();
      }
      toast.error("Migration failed", { description: info.message });
      setIsMigrating(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty className="max-w-md border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon
              icon={ArrowDataTransferHorizontalIcon}
              strokeWidth={2}
            />
          </EmptyMedia>
          <EmptyTitle>This chat uses the legacy v0 API</EmptyTitle>
          <EmptyDescription>
            v0 moved to a new API that can&apos;t open older chats. Migrate it
            to keep building: the latest code moves to a new chat, and the
            original conversation stays available on v0.app.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button variant="outline" asChild>
            <a
              href={`https://v0.app/chat/${encodeURIComponent(chatId)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on v0.app
            </a>
          </Button>
          <Button onClick={migrate} disabled={isMigrating}>
            {isMigrating && <Spinner data-icon="inline-start" />}
            {isMigrating ? "Migrating…" : "Migrate chat"}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
