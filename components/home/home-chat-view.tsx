"use client";

import type { MessageBinaryFormat } from "@v0-sdk/react";
import { StreamingMessage } from "@v0-sdk/react";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { PreviewPanel } from "@/components/chat/preview-panel";
import { ResizableLayout } from "@/components/shared/resizable-layout";
import type { ChatData } from "@/types/chat";

type ChatHistoryItem = {
  type: "user" | "assistant";
  content: string | MessageBinaryFormat;
  isStreaming?: boolean;
  stream?: ReadableStream<Uint8Array> | null;
};

interface HomeChatViewProps {
  chatHistory: ChatHistoryItem[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  handleChatSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  handleStreamingComplete: (finalContent: string | MessageBinaryFormat) => void;
  handleChatData: (chatData: ChatData) => void;
  currentChat: { id: string; demo?: string } | null;
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
  refreshKey: number;
  setRefreshKey: (key: number | ((prev: number) => number)) => void;
}

export function HomeChatView({
  chatHistory,
  isLoading,
  setIsLoading,
  message,
  setMessage,
  handleChatSendMessage,
  handleStreamingComplete,
  handleChatData,
  currentChat,
  isFullscreen,
  setIsFullscreen,
  refreshKey,
  setRefreshKey,
}: HomeChatViewProps) {
  return (
    <>
      <ResizableLayout
        className="h-[calc(100vh-64px)]"
        leftPanel={
          <>
            <ChatMessages
              chatHistory={chatHistory}
              isLoading={isLoading}
              onStreamingComplete={handleStreamingComplete}
              onChatData={handleChatData}
              onStreamingStarted={() => setIsLoading(false)}
            />

            <ChatInput
              message={message}
              setMessage={setMessage}
              onSubmit={handleChatSendMessage}
              isLoading={isLoading}
              showSuggestions={false}
            />
          </>
        }
        rightPanel={
          <PreviewPanel
            currentChat={currentChat}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            refreshKey={refreshKey}
            setRefreshKey={setRefreshKey}
          />
        }
      />

      {chatHistory.some((msg) => msg.isStreaming && msg.stream) && (
        <div className="hidden">
          {chatHistory.map((msg, index) =>
            msg.isStreaming && msg.stream ? (
              <StreamingMessage
                key={`streaming-${msg.type}-${index}`}
                stream={msg.stream}
                messageId={`msg-${index}`}
                onComplete={handleStreamingComplete}
                onChatData={handleChatData}
                onError={(error) => {
                  console.error("Streaming error:", error);
                  setIsLoading(false);
                }}
              />
            ) : null,
          )}
        </div>
      )}
    </>
  );
}
