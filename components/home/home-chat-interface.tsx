"use client";

import type { MessageBinaryFormat } from "@v0-sdk/react";
import { StreamingMessage } from "@v0-sdk/react";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { PreviewPanel } from "@/components/chat/preview-panel";
import { ResizableLayout } from "@/components/shared/resizable-layout";
import type { ChatData, ChatMessage } from "@/types/chat";

interface HomeChatInterfaceProps {
  message: string;
  setMessage: (message: string) => void;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  currentChat: { id: string; demo?: string } | null;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  refreshKey: number;
  setRefreshKey: (key: number | ((prev: number) => number)) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onStreamingComplete: (finalContent: string | MessageBinaryFormat) => void;
  onChatData: (chatData: ChatData) => void;
  onStreamingStarted: () => void;
  onStreamingError: () => void;
}

export function HomeChatInterface({
  message,
  setMessage,
  chatHistory,
  isLoading,
  currentChat,
  isFullscreen,
  setIsFullscreen,
  refreshKey,
  setRefreshKey,
  onSubmit,
  onStreamingComplete,
  onChatData,
  onStreamingStarted,
  onStreamingError,
}: HomeChatInterfaceProps) {
  return (
    <>
      <ResizableLayout
        className="h-[calc(100vh-64px)]"
        leftPanel={
          <>
            <ChatMessages
              chatHistory={chatHistory}
              isLoading={isLoading}
              onStreamingComplete={onStreamingComplete}
              onChatData={onChatData}
              onStreamingStarted={onStreamingStarted}
            />

            <ChatInput
              message={message}
              setMessage={setMessage}
              onSubmit={onSubmit}
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

      <HiddenStreamingRenderer
        chatHistory={chatHistory}
        onStreamingComplete={onStreamingComplete}
        onChatData={onChatData}
        onStreamingError={onStreamingError}
      />
    </>
  );
}

/** Renders hidden StreamingMessage components for initial response processing */
function HiddenStreamingRenderer({
  chatHistory,
  onStreamingComplete,
  onChatData,
  onStreamingError,
}: {
  chatHistory: ChatMessage[];
  onStreamingComplete: (finalContent: string | MessageBinaryFormat) => void;
  onChatData: (chatData: ChatData) => void;
  onStreamingError: () => void;
}) {
  const hasStreaming = chatHistory.some((msg) => msg.isStreaming && msg.stream);
  if (!hasStreaming) {
    return null;
  }

  return (
    <div className="hidden">
      {chatHistory.map(
        (msg, index) =>
          msg.isStreaming &&
          msg.stream && (
            <StreamingMessage
              key={`streaming-${msg.type}-${index}`}
              stream={msg.stream}
              messageId={`msg-${index}`}
              onComplete={onStreamingComplete}
              onChatData={onChatData}
              onError={(error) => {
                console.error("Streaming error:", error);
                onStreamingError();
              }}
            />
          ),
      )}
    </div>
  );
}
