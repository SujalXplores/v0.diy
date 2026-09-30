"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import type { ChatDetail } from "v0-sdk";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";
import { getChatCacheKey, getDemoUrl } from "../lib/chat-api";
import { toChatHistory } from "../lib/chat-history";
import { toAttachmentPayload } from "../lib/image-attachments";
import type { ChatPreview, MessageContent } from "../types";
import { useChatConversation } from "./use-chat-conversation";
import { usePromptComposer } from "./use-prompt-composer";

/** Loads an existing chat and continues the conversation. */
export function useChat(chatId: string) {
  const router = useRouter();
  const { requireV0ApiKey } = useV0ApiKeyModal();
  const composer = usePromptComposer();
  const conversation = useChatConversation();
  const [hasSeededHistory, setHasSeededHistory] = useState(false);

  const { data: chat, mutate } = useSWR<ChatDetail>(getChatCacheKey(chatId), {
    onError: (error) => {
      console.error("Error loading chat:", error);
      router.push("/");
    },
  });

  // Seed the history from the first loaded chat, including data served from
  // SWR's cache (which skips onSuccess). Later revalidations only refresh
  // the preview. Updating state during render avoids an extra effect pass.
  if (chat && !hasSeededHistory) {
    setHasSeededHistory(true);
    conversation.setHistory((current) =>
      current.length > 0 ? current : toChatHistory(chat.messages),
    );
  }

  const submit = async () => {
    const message = composer.message.trim();
    if (!message || conversation.isLoading) {
      return;
    }

    if (!(await requireV0ApiKey())) {
      return;
    }

    const { attachments } = composer;
    composer.clear();

    const outcome = await conversation.sendMessage({
      message,
      chatId,
      attachments: toAttachmentPayload(attachments),
    });

    if (outcome === "missing-key") {
      composer.restore(message, attachments);
    }
  };

  const handleStreamingComplete = async (
    messageId: string,
    content: MessageContent,
  ) => {
    conversation.completeStreaming(messageId, content);
    // Refetch so the preview picks up the newly generated demo.
    await mutate();
  };

  const preview: ChatPreview | null = chat
    ? { id: chat.id, demoUrl: getDemoUrl(chat) }
    : null;

  return {
    composer,
    conversation,
    preview,
    submit,
    handleStreamingComplete,
  };
}
