import type { MessageBinaryFormat } from "@v0-sdk/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { useStreaming } from "@/contexts/streaming-context";
import { useV0ApiKeyModal } from "@/contexts/v0-api-key-modal-context";
import { V0_API_KEY_REQUIRED_CODE } from "@/lib/v0-key";
import type { Chat, ChatData, ChatMessage } from "@/types/chat";

/**
 * Extracts a chat ID from a nested content structure.
 * Validates that the ID looks like a real chat ID (UUID-like format).
 */
function extractChatIdFromContent(content: unknown[]): string | undefined {
  let foundChatId: string | undefined;

  const isValidChatId = (id: string): boolean => {
    if (id === "hello-world" || id.length <= 10) {
      return false;
    }
    return (id.includes("-") && id.length > 20) || id.length > 15;
  };

  const search = (obj: unknown): void => {
    if (foundChatId || !obj || typeof obj !== "object") {
      return;
    }

    const record = obj as Record<string, unknown>;

    if (
      record.chatId &&
      typeof record.chatId === "string" &&
      isValidChatId(record.chatId)
    ) {
      foundChatId = record.chatId;
      return;
    }

    if (
      !foundChatId &&
      record.id &&
      typeof record.id === "string" &&
      isValidChatId(record.id)
    ) {
      foundChatId = record.id;
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(search);
    } else {
      Object.values(record).forEach(search);
    }
  };

  content.forEach(search);
  return foundChatId;
}

/**
 * Fetches chat details and updates SWR cache.
 */
async function fetchAndCacheChatDetails(chatId: string): Promise<void> {
  try {
    const response = await fetch(`/api/chats/${chatId}`);
    if (response.ok) {
      const chatDetails = await response.json();
      const demoUrl = chatDetails?.latestVersion?.demoUrl || chatDetails?.demo;
      mutate(`/api/chats/${chatId}`, { ...chatDetails, demo: demoUrl }, false);
    } else {
      mutate(
        `/api/chats/${chatId}`,
        { id: chatId, demo: `Generated Chat ${chatId}` },
        false,
      );
    }
  } catch (error) {
    console.error("Error fetching chat details:", error);
    mutate(
      `/api/chats/${chatId}`,
      { id: chatId, demo: `Generated Chat ${chatId}` },
      false,
    );
  }
}

/**
 * Parses error response and returns appropriate error message.
 */
async function parseErrorResponse(
  response: Response,
): Promise<{ message: string; code?: string }> {
  const defaultMessage =
    "Sorry, there was an error processing your message. Please try again.";
  const rateLimitMessage =
    "You have exceeded your maximum number of messages for the day. Please try again later.";

  try {
    const errorData = await response.json();
    const code = errorData.code as string | undefined;

    if (errorData.message) {
      return { message: errorData.message, code };
    }
    if (errorData.error) {
      return { message: errorData.error, code };
    }
    if (response.status === 429) {
      return { message: rateLimitMessage, code };
    }
  } catch {
    if (response.status === 429) {
      return { message: rateLimitMessage };
    }
  }
  return { message: defaultMessage };
}

/**
 * Custom hook for managing chat state and interactions.
 *
 * Handles:
 * - Fetching and caching chat data via SWR
 * - Sending messages with streaming support
 * - Managing chat history and streaming states
 * - Handoff from homepage streaming context
 *
 * @param chatId - The unique identifier of the chat
 * @returns Chat state and handler functions
 */
export function useChat(chatId: string) {
  const router = useRouter();
  const { handoff, clearHandoff } = useStreaming();
  const { openKeyModal, requireV0ApiKey } = useV0ApiKeyModal();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const getStreamingBodyOrThrow = useCallback(
    async (response: Response, userMessage: string) => {
      if (!response.ok) {
        const errorPayload = await parseErrorResponse(response);

        if (errorPayload.code === V0_API_KEY_REQUIRED_CODE) {
          openKeyModal();
          setMessage(userMessage);
          setIsLoading(false);
          setChatHistory((prev) => prev.slice(0, -1));
          throw new Error("missing_v0_key_handled");
        }

        throw new Error(errorPayload.message);
      }

      if (!response.body) {
        throw new Error("No response body for streaming");
      }

      return response.body;
    },
    [openKeyModal],
  );

  // Use SWR to fetch chat data
  const { data: currentChat, isLoading: isLoadingChat } = useSWR<Chat>(
    chatId ? `/api/chats/${chatId}` : null,
    {
      onError: (error) => {
        console.error("Error loading chat:", error);
        // Redirect to home if chat not found
        router.push("/");
      },
      onSuccess: (chat) => {
        // Update chat history with existing messages when chat loads
        // But skip if we have a handoff (streaming from homepage) to avoid duplicates
        if (
          chat.messages &&
          chatHistory.length === 0 &&
          !(handoff.chatId === chatId && handoff.stream)
        ) {
          setChatHistory(
            chat.messages.map((msg) => ({
              type: msg.role,
              // Use experimental_content if available, otherwise fall back to plain content
              content: msg.experimental_content || msg.content,
            })),
          );
        }
      },
    },
  );

  // Handle streaming from context (when redirected from homepage)
  useEffect(() => {
    if (handoff.chatId === chatId && handoff.stream && handoff.userMessage) {
      const userMessage = handoff.userMessage;

      // Add the user message to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          type: "user",
          content: userMessage,
        },
      ]);

      // Start streaming the assistant response
      setIsStreaming(true);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content: [],
          isStreaming: true,
          stream: handoff.stream,
        },
      ]);

      // Clear the handoff immediately to prevent re-runs
      clearHandoff();
    }
  }, [chatId, handoff, clearHandoff]);

  const handleSendMessage = useCallback(
    async (
      e: React.FormEvent<HTMLFormElement>,
      attachments?: Array<{ url: string }>,
    ) => {
      e.preventDefault();
      if (!message.trim() || isLoading || !chatId) {
        return;
      }

      const hasKey = await requireV0ApiKey();
      if (!hasKey) {
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
            chatId,
            streaming: true,
            ...(attachments && attachments.length > 0 && { attachments }),
          }),
        });

        const streamBody = await getStreamingBodyOrThrow(response, userMessage);

        setIsStreaming(true);
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
    [message, isLoading, chatId, getStreamingBodyOrThrow, requireV0ApiKey],
  );

  const handleStreamingComplete = useCallback(
    async (finalContent: string | MessageBinaryFormat) => {
      setIsStreaming(false);
      setIsLoading(false);

      // Refresh current chat details
      await fetchAndCacheChatDetails(chatId);

      // Try to extract chat ID from final content if we don't have a current chat
      if (!currentChat && finalContent && Array.isArray(finalContent)) {
        const newChatId = extractChatIdFromContent(finalContent);
        if (newChatId) {
          await fetchAndCacheChatDetails(newChatId);
        }
      }

      // Update chat history with the final content
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
    [chatId, currentChat],
  );

  const handleChatData = useCallback(
    async (chatData: ChatData) => {
      if (chatData.id && !currentChat) {
        // Only update with basic chat data, without demo URL
        // The demo URL will be fetched in handleStreamingComplete
        mutate(
          `/api/chats/${chatData.id}`,
          {
            id: chatData.id,
            url: chatData.webUrl || chatData.url,
            // Don't set demo URL here - wait for streaming to complete
          },
          false,
        );
      }
    },
    [currentChat],
  );

  return {
    message,
    setMessage,
    currentChat,
    isLoading,
    setIsLoading,
    isStreaming,
    chatHistory,
    isLoadingChat,
    handleSendMessage,
    handleStreamingComplete,
    handleChatData,
  };
}
