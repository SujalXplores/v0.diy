"use client";

import type { MessageBinaryFormat } from "@v0-sdk/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearPromptFromStorage,
  createImageAttachment,
  createImageAttachmentFromStored,
  type ImageAttachment,
  loadPromptFromStorage,
  savePromptToStorage,
} from "@/components/ai-elements/prompt-input";
import { useV0ApiKeyModal } from "@/contexts/v0-api-key-modal-context";
import { V0_API_KEY_REQUIRED_CODE } from "@/lib/v0-key";
import type { ChatData } from "@/types/chat";

type ChatHistoryItem = {
  type: "user" | "assistant";
  content: string | MessageBinaryFormat;
  isStreaming?: boolean;
  stream?: ReadableStream<Uint8Array> | null;
};

export function useHomeChatController() {
  const { status } = useSession();
  const router = useRouter();
  const { openKeyModal, requireV0ApiKey } = useV0ApiKeyModal();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<{
    id: string;
    demo?: string;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReset = useCallback(() => {
    setShowChatInterface(false);
    setChatHistory([]);
    setCurrentChatId(null);
    setCurrentChat(null);
    setMessage("");
    setAttachments([]);
    setIsLoading(false);
    setIsFullscreen(false);
    setRefreshKey((prev) => prev + 1);
    clearPromptFromStorage();

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();

    const storedData = loadPromptFromStorage();
    if (storedData) {
      setMessage(storedData.message);
      if (storedData.attachments.length > 0) {
        setAttachments(
          storedData.attachments.map(createImageAttachmentFromStored),
        );
      }
    }
  }, []);

  useEffect(() => {
    if (message.trim() || attachments.length > 0) {
      savePromptToStorage(message, attachments);
    } else {
      clearPromptFromStorage();
    }
  }, [message, attachments]);

  const handleImageFiles = useCallback(async (files: File[]) => {
    try {
      const newAttachments = await Promise.all(
        files.map((file) => createImageAttachment(file)),
      );
      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error) {
      console.error("Error processing image files:", error);
    }
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  }, []);

  const handleDragOver = useCallback(() => setIsDragOver(true), []);
  const handleDragLeave = useCallback(() => setIsDragOver(false), []);
  const handleDrop = useCallback(() => setIsDragOver(false), []);

  const getErrorPayload = useCallback(async (response: Response) => {
    let errorMessage =
      "Sorry, there was an error processing your message. Please try again.";
    let code: string | undefined;

    try {
      const errorData = await response.json();
      code = errorData.code;

      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (response.status === 429) {
        errorMessage =
          "You have exceeded your maximum number of messages for the day. Please try again later.";
      }
    } catch (parseError) {
      console.error("Error parsing error response:", parseError);
      if (response.status === 429) {
        errorMessage =
          "You have exceeded your maximum number of messages for the day. Please try again later.";
      }
    }

    return { message: errorMessage, code };
  }, []);

  const getStreamingBodyOrThrow = useCallback(
    async (response: Response, onMissingKey: () => void) => {
      if (!response.ok) {
        const errorPayload = await getErrorPayload(response);

        if (errorPayload.code === V0_API_KEY_REQUIRED_CODE) {
          onMissingKey();
          throw new Error("missing_v0_key_handled");
        }

        throw new Error(errorPayload.message);
      }

      if (!response.body) {
        throw new Error("No response body for streaming");
      }

      return response.body;
    },
    [getErrorPayload],
  );

  const ensureAuthenticatedAndKey = useCallback(async () => {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/");
      return false;
    }

    return requireV0ApiKey();
  }, [status, router, requireV0ApiKey]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message.trim() || isLoading) {
        return;
      }

      const canSend = await ensureAuthenticatedAndKey();
      if (!canSend) {
        return;
      }

      const userMessage = message.trim();
      const currentAttachments = [...attachments];
      clearPromptFromStorage();

      setMessage("");
      setAttachments([]);
      setShowChatInterface(true);
      setChatHistory([{ type: "user", content: userMessage }]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            streaming: true,
            attachments: currentAttachments.map((att) => ({
              url: att.dataUrl,
            })),
          }),
        });

        const streamBody = await getStreamingBodyOrThrow(response, () => {
          openKeyModal();
          setIsLoading(false);
          setShowChatInterface(false);
          setChatHistory([]);
          setMessage(userMessage);
          setAttachments(currentAttachments);
        });

        setIsLoading(false);
        setChatHistory((prev) => [
          ...prev,
          {
            type: "assistant",
            content: [],
            isStreaming: true,
            stream: streamBody,
          },
        ]);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "missing_v0_key_handled"
        ) {
          return;
        }

        console.error("Error creating chat:", error);
        setIsLoading(false);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Sorry, there was an error processing your message. Please try again.";

        setChatHistory((prev) => [
          ...prev,
          {
            type: "assistant",
            content: errorMessage,
          },
        ]);
      }
    },
    [
      attachments,
      ensureAuthenticatedAndKey,
      getStreamingBodyOrThrow,
      isLoading,
      message,
      openKeyModal,
    ],
  );

  const handleChatData = useCallback(
    async (chatData: ChatData) => {
      if (chatData.id) {
        if (!currentChatId || chatData.object === "chat") {
          setCurrentChatId(chatData.id);
          setCurrentChat({ id: chatData.id });
          window.history.pushState(null, "", `/chats/${chatData.id}`);
        }

        if (!currentChatId) {
          try {
            await fetch("/api/chat/ownership", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chatId: chatData.id }),
            });
          } catch (error) {
            console.error("Failed to create chat ownership:", error);
          }
        }
      }
    },
    [currentChatId],
  );

  useEffect(() => {
    if (!currentChatId) {
      return;
    }

    fetch(`/api/chats/${currentChatId}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        console.warn("Failed to fetch chat details:", response.status);
        return null;
      })
      .then((chatDetails) => {
        if (chatDetails) {
          const demoUrl =
            chatDetails?.latestVersion?.demoUrl || chatDetails?.demo;
          if (demoUrl) {
            setCurrentChat((prev) =>
              prev ? { ...prev, demo: demoUrl } : prev,
            );
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching demo URL:", error);
      });
  }, [currentChatId]);

  const handleStreamingComplete = useCallback(
    async (finalContent: string | MessageBinaryFormat) => {
      setIsLoading(false);

      setChatHistory((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].isStreaming) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: finalContent,
            isStreaming: false,
            stream: undefined,
          };
        }
        return updated;
      });
    },
    [],
  );

  const handleChatSendMessage = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message.trim() || isLoading || !currentChatId) {
        return;
      }

      const canSend = await ensureAuthenticatedAndKey();
      if (!canSend) {
        return;
      }

      const userMessage = message.trim();
      setMessage("");
      setIsLoading(true);
      setChatHistory((prev) => [
        ...prev,
        { type: "user", content: userMessage },
      ]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            chatId: currentChatId,
            streaming: true,
          }),
        });

        const streamBody = await getStreamingBodyOrThrow(response, () => {
          openKeyModal();
          setIsLoading(false);
          setMessage(userMessage);
        });

        setIsLoading(false);
        setChatHistory((prev) => [
          ...prev,
          {
            type: "assistant",
            content: [],
            isStreaming: true,
            stream: streamBody,
          },
        ]);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "missing_v0_key_handled"
        ) {
          return;
        }

        console.error("Error:", error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Sorry, there was an error processing your message. Please try again.";

        setChatHistory((prev) => [
          ...prev,
          { type: "assistant", content: errorMessage },
        ]);
        setIsLoading(false);
      }
    },
    [
      currentChatId,
      ensureAuthenticatedAndKey,
      getStreamingBodyOrThrow,
      isLoading,
      message,
      openKeyModal,
    ],
  );

  return {
    message,
    setMessage,
    isLoading,
    setIsLoading,
    showChatInterface,
    attachments,
    isDragOver,
    chatHistory,
    currentChat,
    isFullscreen,
    setIsFullscreen,
    refreshKey,
    setRefreshKey,
    textareaRef,
    handleReset,
    handleImageFiles,
    handleRemoveAttachment,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSendMessage,
    handleChatSendMessage,
    handleChatData,
    handleStreamingComplete,
  };
}
