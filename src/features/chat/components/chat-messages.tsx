"use client";

import { StreamingMessage } from "@v0-sdk/react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message } from "@/components/ai-elements/message";
import type { ChatConversation } from "../hooks/use-chat-conversation";
import type { MessageContent, StreamChatData } from "../types";
import { messageComponents } from "./message/message-components";
import { MessageRenderer } from "./message/message-renderer";

interface ChatMessagesProps {
  conversation: ChatConversation;
  onStreamingComplete: (messageId: string, content: MessageContent) => void;
  onChatData?: (chatData: StreamChatData) => void;
}

export function ChatMessages({
  conversation,
  onStreamingComplete,
  onChatData,
}: ChatMessagesProps) {
  const { history, isLoading, handleStreamingStarted, handleStreamingError } =
    conversation;

  return (
    <Conversation>
      <ConversationContent>
        {history.map((message) => (
          <Message from={message.role} key={message.id}>
            {message.stream ? (
              <StreamingMessage
                stream={message.stream}
                messageId={message.id}
                role={message.role}
                onComplete={(content) =>
                  onStreamingComplete(message.id, content)
                }
                onChatData={onChatData}
                // Hide the loader as soon as content starts arriving.
                onChunk={handleStreamingStarted}
                onError={handleStreamingError}
                components={messageComponents}
                showLoadingIndicator={false}
              />
            ) : (
              <MessageRenderer
                content={message.content}
                role={message.role}
                messageId={message.id}
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
