import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { LoadErrorState, MissingKeyState } from "@/components/load-states";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";
import { ChatWorkspaceSkeleton } from "@/features/chat/components/chat-workspace-skeleton";
import { LegacyChatNotice } from "@/features/chat/components/legacy-chat-notice";
import { isApiKeyErrorCode } from "@/lib/api-error-codes";
import { requireSessionUserId } from "@/server/auth/session";
import {
  getUserChat,
  type UserChatWithMessages,
} from "@/server/chats/get-user-chat";
import { getOwnedChatVersion } from "@/server/chats/ownership";
import { chatIdSchema } from "@/server/chats/schemas";
import type { ChatApiVersion } from "@/server/db/schema";
import { HttpError } from "@/server/http/errors";
import { getChatPreviewTarget } from "@/server/preview/preview-url";

type ChatParams = PageProps<"/chats/[chatId]">["params"];

const isNotFound = (error: unknown) =>
  error instanceof HttpError && (error.status === 404 || error.status === 403);

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

async function ChatContent({ params }: { params: ChatParams }) {
  const [{ chatId }, userId] = await Promise.all([
    params,
    requireSessionUserId(),
  ]);

  if (!chatIdSchema.safeParse(chatId).success) {
    notFound();
  }

  let version: ChatApiVersion | null = null;
  try {
    version = await getOwnedChatVersion(chatId, userId);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }
  if (!version) {
    notFound();
  }
  if (version === "v1") {
    return <LegacyChatNotice chatId={chatId} />;
  }

  let data: UserChatWithMessages;
  try {
    data = await getUserChat(chatId, userId);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    if (error instanceof HttpError && isApiKeyErrorCode(error.code)) {
      return (
        <CenteredState>
          <MissingKeyState resource="chats" />
        </CenteredState>
      );
    }
    console.error("Failed to load chat:", error);
    return (
      <CenteredState>
        <LoadErrorState title="Couldn't load this chat" />
      </CenteredState>
    );
  }

  const previewTarget = await getChatPreviewTarget(chatId, userId);

  return (
    <ChatWorkspace
      key={chatId}
      chat={data.chat}
      initialMessages={data.messages}
      initialCursor={data.cursor}
      previewTarget={previewTarget}
    />
  );
}

export default function ChatDetailPage({
  params,
}: PageProps<"/chats/[chatId]">) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <AppHeader />
      <Suspense fallback={<ChatWorkspaceSkeleton />}>
        <ChatContent params={params} />
      </Suspense>
    </div>
  );
}
