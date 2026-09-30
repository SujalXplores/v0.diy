"use client";

import { ResizableLayout } from "@/components/layout/resizable-layout";
import type { ChatConversation } from "../hooks/use-chat-conversation";
import type { PromptComposer as PromptComposerState } from "../hooks/use-prompt-composer";
import type { ChatPreview, MessageContent, StreamChatData } from "../types";
import { ChatMessages } from "./chat-messages";
import { PreviewPanel } from "./preview-panel";
import { PromptComposer } from "./prompt-composer";

interface ChatWorkspaceProps {
  conversation: ChatConversation;
  composer: PromptComposerState;
  preview: ChatPreview | null;
  onSubmit: () => void;
  onStreamingComplete: (messageId: string, content: MessageContent) => void;
  onChatData?: (chatData: StreamChatData) => void;
}

/** Conversation and prompt on the left, live preview on the right. */
export function ChatWorkspace({
  conversation,
  composer,
  preview,
  onSubmit,
  onStreamingComplete,
  onChatData,
}: ChatWorkspaceProps) {
  return (
    <ResizableLayout
      className="h-[calc(100vh-64px)]"
      leftPanel={
        <>
          <ChatMessages
            conversation={conversation}
            onStreamingComplete={onStreamingComplete}
            onChatData={onChatData}
          />
          <div className="p-4 pt-0">
            <PromptComposer
              composer={composer}
              onSubmit={onSubmit}
              isLoading={conversation.isLoading}
              placeholder="Continue the conversation..."
              className="relative mx-auto w-full max-w-2xl"
              textareaClassName="min-h-[60px]"
            />
          </div>
        </>
      }
      rightPanel={<PreviewPanel demoUrl={preview?.demoUrl} />}
    />
  );
}
