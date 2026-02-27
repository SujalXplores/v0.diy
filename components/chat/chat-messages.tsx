import { type MessageBinaryFormat, StreamingMessage } from "@v0-sdk/react";
import { useEffect, useRef } from "react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message } from "@/components/ai-elements/message";
import { MessageRenderer } from "@/components/message-renderer";
import { sharedComponents } from "@/components/shared-components";
import type { Chat, ChatMessage } from "@/types/chat";

interface ChatMessagesProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  currentChat: Chat | null;
  onStreamingComplete: (finalContent: string | MessageBinaryFormat) => void;
  onChatData: (chatData: { id: string; demo?: string; url?: string }) => void;
  onStreamingStarted?: () => void;
}

export function ChatMessages({
  chatHistory,
  isLoading,
  onStreamingComplete,
  onChatData,
  onStreamingStarted,
}: Omit<ChatMessagesProps, "currentChat">) {
  const streamingStartedRef = useRef(false);

  // Reset the streaming started flag when a new message starts loading
  useEffect(() => {
    if (isLoading) {
      streamingStartedRef.current = false;
    }
  }, [isLoading]);

  if (chatHistory.length === 0) {
    return (
      <Conversation>
        <ConversationContent>
          <div>
            {/* Empty conversation - messages will appear here when they load */}
          </div>
        </ConversationContent>
      </Conversation>
    );
  }

  return (
    <Conversation>
      <ConversationContent>
        {chatHistory.map((msg, index) => (
          <Message from={msg.type} key={`message-${index}-${msg.type}`}>
            {msg.isStreaming && msg.stream ? (
              <StreamingMessage
                stream={msg.stream}
                messageId={`msg-${index}`}
                role={msg.type}
                onComplete={onStreamingComplete}
                onChatData={onChatData}
                onChunk={(_chunk) => {
                  // Hide external loader once we start receiving content (only once)
                  if (onStreamingStarted && !streamingStartedRef.current) {
                    streamingStartedRef.current = true;
                    onStreamingStarted();
                  }
                }}
                onError={(error) => console.error("Streaming error:", error)}
                components={sharedComponents}
                showLoadingIndicator={false}
              />
            ) : (
              <MessageRenderer
                content={msg.content}
                role={msg.type}
                messageId={`msg-${index}`}
              />
            )}
          </Message>
        ))}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </ConversationContent>
    </Conversation>
  );
}
