"use client";

import { AppHeader } from "@/components/layout/app-header";
import { useChat } from "../hooks/use-chat";
import { ChatWorkspace } from "./chat-workspace";

interface ChatDetailViewProps {
  chatId: string;
}

export function ChatDetailView({ chatId }: ChatDetailViewProps) {
  const { composer, conversation, preview, submit, handleStreamingComplete } =
    useChat(chatId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <AppHeader />
      <ChatWorkspace
        conversation={conversation}
        composer={composer}
        preview={preview}
        onSubmit={submit}
        onStreamingComplete={handleStreamingComplete}
      />
    </div>
  );
}
