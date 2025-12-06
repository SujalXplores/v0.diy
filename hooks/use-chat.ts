import type { MessageBinaryFormat } from "@v0-sdk/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { useStreaming } from "@/contexts/streaming-context";
import type { Chat, ChatData, ChatMessage } from "@/types/chat";

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
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

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

      const userMessage = message.trim();
      setMessage("");
      setIsLoading(true);

      setChatHistory((prev) => [
        ...prev,
        { type: "user", content: userMessage },
      ]);

      try {
        // Use streaming mode
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            chatId: chatId,
            streaming: true,
            ...(attachments && attachments.length > 0 && { attachments }),
          }),
        });

        if (!response.ok) {
          // Try to get the specific error message from the response
          let errorMessage =
            "Sorry, there was an error processing your message. Please try again.";
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
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
          throw new Error(errorMessage);
        }

        if (!response.body) {
          throw new Error("No response body for streaming");
        }

        setIsStreaming(true);
        // Keep isLoading true until streaming message has content

        // Add placeholder for streaming response with the stream attached
        setChatHistory((prev) => [
          ...prev,
          {
            type: "assistant",
            content: [],
            isStreaming: true,
            stream: response.body,
          },
        ]);
      } catch (error) {
        console.error("Error:", error);

        // Use the specific error message if available, otherwise fall back to generic message
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
        setIsLoading(false);
      }
    },
    [message, isLoading, chatId],
  );

  const handleStreamingComplete = useCallback(
    async (finalContent: string | MessageBinaryFormat) => {
      setIsStreaming(false);
      setIsLoading(false);

      try {
        const response = await fetch(`/api/chats/${chatId}`);
        if (response.ok) {
          const chatDetails = await response.json();

          const demoUrl =
            chatDetails?.latestVersion?.demoUrl || chatDetails?.demo;

          // Update SWR cache with the latest chat data
          mutate(
            `/api/chats/${chatId}`,
            {
              ...chatDetails,
              demo: demoUrl,
            },
            false,
          );
        } else {
          console.warn(
            "Failed to fetch updated chat details:",
            response.status,
          );
          // Fallback to just refreshing the cache
          mutate(`/api/chats/${chatId}`);
        }
      } catch (error) {
        console.error("Error fetching updated chat details:", error);
        // Fallback to just refreshing the cache
        mutate(`/api/chats/${chatId}`);
      }

      // Try to extract chat ID from the final content if we don't have one yet
      if (!currentChat && finalContent && Array.isArray(finalContent)) {
        let newChatId: string | undefined;

        // Search through the content structure for chat ID
        const searchForChatId = (obj: unknown) => {
          if (obj && typeof obj === "object") {
            const objRecord = obj as Record<string, unknown>;

            // Look for chat ID - be more specific about what we accept
            if (objRecord.chatId && typeof objRecord.chatId === "string") {
              // Validate that it looks like a real chat ID (UUID-like or specific format)
              if (
                objRecord.chatId.length > 10 &&
                objRecord.chatId !== "hello-world"
              ) {
                console.log("Accepting chatId:", objRecord.chatId);
                newChatId = objRecord.chatId;
              }
            }

            // Only use 'id' if it's specifically a chat context and looks like a real ID
            if (
              !newChatId &&
              objRecord.id &&
              typeof objRecord.id === "string"
            ) {
              // More restrictive check for 'id' field - should look like UUID or be longer
              if (
                (objRecord.id.includes("-") && objRecord.id.length > 20) ||
                (objRecord.id.length > 15 && objRecord.id !== "hello-world")
              ) {
                console.log("Accepting id as chatId:", objRecord.id);
                newChatId = objRecord.id;
              }
            }

            // Recursively search in arrays and objects
            if (Array.isArray(obj)) {
              obj.forEach(searchForChatId);
            } else {
              Object.values(objRecord).forEach(searchForChatId);
            }
          }
        };

        finalContent.forEach(searchForChatId);

        if (newChatId) {
          console.log("Found chat ID:", newChatId);
          console.log("Fetching chat details to get demo URL...");

          try {
            // Fetch the full chat details to get the demo URL
            const response = await fetch(`/api/chats/${newChatId}`);
            if (response.ok) {
              const chatDetails = await response.json();
              console.log("Chat details:", chatDetails);

              const demoUrl =
                chatDetails?.latestVersion?.demoUrl || chatDetails?.demo;
              console.log("Demo URL from chat details:", demoUrl);

              // Update SWR cache with new chat data
              mutate(
                `/api/chats/${newChatId}`,
                {
                  id: newChatId,
                  demo: demoUrl || `Generated Chat ${newChatId}`,
                },
                false,
              );
            } else {
              console.warn("Failed to fetch chat details:", response.status);
              // Update SWR cache with new chat data
              mutate(
                `/api/chats/${newChatId}`,
                {
                  id: newChatId,
                  demo: `Generated Chat ${newChatId}`,
                },
                false,
              );
            }
          } catch (error) {
            console.error("Error fetching chat details:", error);
            // Update SWR cache with new chat data
            mutate(
              `/api/chats/${newChatId}`,
              {
                id: newChatId,
                demo: `Generated Chat ${newChatId}`,
              },
              false,
            );
          }
        } else {
          console.log("No chat ID found in final content");
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
