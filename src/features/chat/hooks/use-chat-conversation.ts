"use client";

import { useState } from "react";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";
import { requestChatStream } from "../lib/chat-api";
import {
  createMessage,
  createStreamingMessage,
  finalizeStreamingMessage,
} from "../lib/chat-history";
import type { AttachmentPayload, ChatMessage, MessageContent } from "../types";

export type SendOutcome = "sent" | "missing-key" | "failed";

interface SendMessageOptions {
  message: string;
  chatId?: string | undefined;
  attachments: AttachmentPayload[];
}

/**
 * Message history of one conversation plus sending and streaming state.
 * Every update is functional so the callbacks stay correct when the v0
 * stream calls them long after the render that created them.
 */
export function useChatConversation() {
  const { openKeyModal } = useV0ApiKeyModal();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  // True from sending until the first streamed chunk arrives.
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async ({
    message,
    chatId,
    attachments,
  }: SendMessageOptions): Promise<SendOutcome> => {
    setIsLoading(true);
    setHistory((current) => [...current, createMessage("user", message)]);

    const result = await requestChatStream({ message, chatId, attachments });
    // Keep loading while streaming: the first chunk clears it.
    setIsLoading(result.status === "streaming");

    if (result.status === "streaming") {
      setHistory((current) => [
        ...current,
        createStreamingMessage(result.stream),
      ]);
      return "sent";
    }

    if (result.status === "missing-key") {
      // Drop the optimistic user message; the caller restores the input.
      setHistory((current) => current.slice(0, -1));
      openKeyModal();
      return "missing-key";
    }

    setHistory((current) => [
      ...current,
      createMessage("assistant", result.message),
    ]);
    return "failed";
  };

  const completeStreaming = (messageId: string, content: MessageContent) => {
    setIsLoading(false);
    setHistory((current) =>
      finalizeStreamingMessage(current, messageId, content),
    );
  };

  const handleStreamingStarted = () => setIsLoading(false);

  const handleStreamingError = (error: string) => {
    console.error("Streaming error:", error);
    setIsLoading(false);
  };

  const reset = () => {
    setHistory([]);
    setIsLoading(false);
  };

  return {
    history,
    setHistory,
    isLoading,
    sendMessage,
    completeStreaming,
    handleStreamingStarted,
    handleStreamingError,
    reset,
  };
}

export type ChatConversation = ReturnType<typeof useChatConversation>;
