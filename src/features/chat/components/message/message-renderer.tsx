"use client";

import { Message } from "@v0-sdk/react";
import { stripV0Markers } from "../../lib/message-content";
import type { MessageContent, MessageRole } from "../../types";
import { messageComponents } from "./message-components";

interface MessageRendererProps {
  content: MessageContent;
  messageId: string;
  role: MessageRole;
  className?: string;
}

/** Renders a finished message: plain text, or v0's structured content. */
export function MessageRenderer({
  content,
  messageId,
  role,
  className,
}: MessageRendererProps) {
  if (typeof content === "string") {
    return (
      <div className={className}>
        <p className="mb-4 text-gray-700 leading-relaxed dark:text-gray-200">
          {content}
        </p>
      </div>
    );
  }

  return (
    <Message
      content={stripV0Markers(content)}
      messageId={messageId}
      role={role}
      className={className}
      components={messageComponents}
    />
  );
}
