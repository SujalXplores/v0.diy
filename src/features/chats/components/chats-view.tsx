"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { useUserChats } from "../hooks/use-user-chats";
import { getChatDisplayName } from "../lib/chat-display";
import type { ChatSummary } from "../types";

function NewChatLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-sm text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
    >
      <Plus className="mr-2 h-4 w-4" />
      New Chat
    </Link>
  );
}

function ChatCard({ chat }: { chat: ChatSummary }) {
  // Chats are fetched client-side, so this never renders on the server and
  // can't cause a hydration mismatch.
  // react-doctor-disable-next-line react-doctor/no-locale-format-in-render
  const updatedLabel = new Date(
    chat.updatedAt ?? chat.createdAt,
  ).toLocaleDateString();

  return (
    <Link href={`/chats/${chat.id}`} className="group block">
      <div className="rounded-lg border border-border p-6 transition-shadow hover:shadow-md dark:border-input">
        <h3 className="truncate font-medium text-gray-900 text-lg transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {getChatDisplayName(chat)}
        </h3>
        <p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
          Updated {updatedLabel}
        </p>
      </div>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2 dark:border-white" />
      <span className="ml-2 text-gray-600 dark:text-gray-300">
        Loading chats...
      </span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <h3 className="font-medium text-red-800 text-sm dark:text-red-200">
        Error loading chats
      </h3>
      <p className="mt-1 text-red-700 text-sm dark:text-red-300">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <h3 className="mt-2 font-medium text-gray-900 text-sm dark:text-white">
        No chats yet
      </h3>
      <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
        Get started by creating your first chat.
      </p>
      <div className="mt-6">
        <NewChatLink />
      </div>
    </div>
  );
}

function ChatList({ chats }: { chats: ChatSummary[] }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-2 font-bold text-2xl text-gray-900 dark:text-white">
            Chats
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {chats.length} {chats.length === 1 ? "chat" : "chats"}
          </p>
        </div>
        <NewChatLink />
      </div>

      {chats.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {chats.map((chat) => (
            <ChatCard key={chat.id} chat={chat} />
          ))}
        </div>
      )}
    </>
  );
}

function ChatsContent() {
  const { chats, error, isLoading } = useUserChats();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message || "Failed to load chats"} />;
  }

  return <ChatList chats={chats} />;
}

export function ChatsView() {
  return (
    <PageContainer header={<AppHeader />}>
      <ChatsContent />
    </PageContainer>
  );
}
