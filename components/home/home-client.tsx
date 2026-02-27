"use client";

import type { MessageBinaryFormat } from "@v0-sdk/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  clearPromptFromStorage,
  type ImageAttachment,
} from "@/components/ai-elements/prompt-input";
import { AppHeader } from "@/components/shared/app-header";
import { useV0ApiKeyModal } from "@/contexts/v0-api-key-modal-context";
import { parseErrorResponse } from "@/lib/api-utils";
import { V0_API_KEY_REQUIRED_CODE } from "@/lib/v0-key";
import type { ChatData, ChatMessage } from "@/types/chat";
import { HomeChatInterface } from "./home-chat-interface";
import { HomeLanding } from "./home-landing";

function SearchParamsHandler({ onReset }: { onReset: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const reset = searchParams.get("reset");
    if (reset === "true") {
      onReset();
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("reset");
      window.history.replaceState({}, "", newUrl.pathname);
    }
  }, [searchParams, onReset]);

  return null;
}

export function HomeClient() {
  const { status } = useSession();
  const router = useRouter();
  const { openKeyModal, requireV0ApiKey } = useV0ApiKeyModal();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<{
    id: string;
    demo?: string;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReset = () => {
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
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const ensureAuthenticatedAndKey = async () => {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/");
      return false;
    }
    return requireV0ApiKey();
  };

  const getStreamingBodyOrThrow = async (
    response: Response,
    onMissingKey: () => void,
  ): Promise<ReadableStream<Uint8Array>> => {
    if (!response.ok) {
      const errorPayload = await parseErrorResponse(response);
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
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
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
          attachments: currentAttachments.map((att) => ({ url: att.dataUrl })),
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
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Sorry, there was an error processing your message. Please try again.",
        },
      ]);
    }
  };

  const handleChatData = async (chatData: ChatData) => {
    if (!chatData.id) {
      return;
    }

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
  };

  const fetchDemoUrl = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) {
        return;
      }
      const chatDetails = await response.json();
      const demoUrl = chatDetails?.latestVersion?.demoUrl || chatDetails?.demo;
      if (demoUrl) {
        setCurrentChat((prev) => (prev ? { ...prev, demo: demoUrl } : null));
      }
    } catch (error) {
      console.error("Error fetching demo URL:", error);
    }
  };

  const handleStreamingComplete = async (
    finalContent: string | MessageBinaryFormat,
  ) => {
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

    setCurrentChat((prevCurrentChat) => {
      if (prevCurrentChat?.id) {
        fetchDemoUrl(prevCurrentChat.id);
      }
      return prevCurrentChat;
    });
  };

  const handleChatSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
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
    setChatHistory((prev) => [...prev, { type: "user", content: userMessage }]);

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
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Sorry, there was an error processing your message. Please try again.",
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
      <Suspense fallback={null}>
        <SearchParamsHandler onReset={handleReset} />
      </Suspense>

      <AppHeader />

      {showChatInterface ? (
        <HomeChatInterface
          message={message}
          setMessage={setMessage}
          chatHistory={chatHistory}
          isLoading={isLoading}
          currentChat={currentChat}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          refreshKey={refreshKey}
          setRefreshKey={setRefreshKey}
          onSubmit={handleChatSendMessage}
          onStreamingComplete={handleStreamingComplete}
          onChatData={handleChatData}
          onStreamingStarted={() => setIsLoading(false)}
          onStreamingError={() => setIsLoading(false)}
        />
      ) : (
        <HomeLanding
          message={message}
          setMessage={setMessage}
          isLoading={isLoading}
          attachments={attachments}
          setAttachments={setAttachments}
          onSubmit={handleSendMessage}
          textareaRef={textareaRef}
        />
      )}
    </div>
  );
}
