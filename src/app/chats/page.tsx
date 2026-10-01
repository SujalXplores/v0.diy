import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LoadErrorState, MissingKeyState } from "@/components/load-states";
import { ChatsBrowser } from "@/features/chats/components/chats-browser";
import { ChatsSkeleton } from "@/features/chats/components/chats-skeleton";
import { requireSessionUserId } from "@/server/auth/session";
import { listLegacyChats } from "@/server/chats/legacy-chats";
import { listUserChats } from "@/server/chats/list-user-chats";
import { loadV0Data } from "@/server/v0/load-result";

export const metadata: Metadata = { title: "Chats" };

async function ChatsContent() {
  const userId = await requireSessionUserId();
  const [result, legacyChats] = await Promise.all([
    loadV0Data(() => listUserChats(userId), "Failed to load chats"),
    listLegacyChats(userId),
  ]);

  if (result.status === "missing-key") {
    return <MissingKeyState resource="chats" />;
  }

  if (result.status === "error") {
    return <LoadErrorState title="Couldn't load your chats" />;
  }

  return <ChatsBrowser chats={result.data} legacyChats={legacyChats} />;
}

export default function ChatsPage() {
  return (
    <PageContainer header={<AppHeader />}>
      <PageHeader
        title="Chats"
        description="Pick up any conversation right where you left off."
      />
      <Suspense fallback={<ChatsSkeleton />}>
        <ChatsContent />
      </Suspense>
    </PageContainer>
  );
}
