"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";
import {
  fetchChatSafely,
  getDemoUrl,
  recordChatOwnership,
  USER_CHATS_CACHE_KEY,
} from "../lib/chat-api";
import { toAttachmentPayload } from "../lib/image-attachments";
import type { ChatPreview, MessageContent, StreamChatData } from "../types";
import { useChatConversation } from "./use-chat-conversation";
import { usePromptComposer } from "./use-prompt-composer";

const LOGIN_URL = "/login?callbackUrl=/";

/**
 * Starts a new chat from the homepage and keeps chatting in place. The URL
 * switches to /chats/:id without a navigation so the stream isn't interrupted.
 */
export function useNewChat() {
  const router = useRouter();
  const { status } = useSession();
  const { requireV0ApiKey } = useV0ApiKeyModal();
  const { mutate } = useSWRConfig();
  const composer = usePromptComposer();
  const conversation = useChatConversation();
  const [preview, setPreview] = useState<ChatPreview | null>(null);
  // Stream callbacks outlive the render that created them, so they read the
  // chat ID from a ref instead of state.
  const chatIdRef = useRef<string | null>(null);

  const canSend = async () => {
    if (status !== "authenticated") {
      router.push(LOGIN_URL);
      return false;
    }

    return requireV0ApiKey();
  };

  /** Sends the composed message, or `text` when a suggestion is picked. */
  const submit = async (text?: string) => {
    const message = (text ?? composer.message).trim();
    if (!message || conversation.isLoading) {
      return;
    }

    // Keep a picked suggestion in the draft so it survives a sign-in
    // redirect or the API key dialog.
    if (text !== undefined) {
      composer.setMessage(message);
    }

    if (!(await canSend())) {
      return;
    }

    const { attachments } = composer;
    composer.clear();

    const outcome = await conversation.sendMessage({
      message,
      chatId: chatIdRef.current ?? undefined,
      attachments: toAttachmentPayload(attachments),
    });

    if (outcome === "missing-key") {
      composer.restore(message, attachments);
    }
  };

  const handleChatData = (chatData: StreamChatData) => {
    const { id } = chatData;
    if (!id) {
      return;
    }

    const isNewChat = chatIdRef.current === null;

    if (isNewChat || chatData.object === "chat") {
      chatIdRef.current = id;
      setPreview((current) => (current?.id === id ? current : { id }));

      const chatPath = `/chats/${id}`;
      if (window.location.pathname !== chatPath) {
        window.history.pushState(null, "", chatPath);
      }
    }

    if (isNewChat) {
      recordChatOwnership(id).then(() => mutate(USER_CHATS_CACHE_KEY));
    }
  };

  const handleStreamingComplete = async (
    messageId: string,
    content: MessageContent,
  ) => {
    conversation.completeStreaming(messageId, content);

    const chatId = chatIdRef.current;
    if (!chatId) {
      return;
    }

    const chat = await fetchChatSafely(chatId);
    const demoUrl = chat ? getDemoUrl(chat) : undefined;

    if (demoUrl) {
      setPreview((current) =>
        current?.id === chatId ? { ...current, demoUrl } : current,
      );
    }
  };

  /** Returns to the empty homepage state. */
  const reset = () => {
    conversation.reset();
    composer.clear();
    setPreview(null);
    chatIdRef.current = null;
  };

  return {
    composer,
    conversation,
    preview,
    hasStarted: conversation.history.length > 0,
    submit,
    handleChatData,
    handleStreamingComplete,
    reset,
  };
}
