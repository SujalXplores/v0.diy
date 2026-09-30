import type { MessageBinaryFormat } from "@v0-sdk/react";
import type { PromptInputAttachment } from "@/components/ai-elements/prompt-input/prompt-input-image-preview";

export type MessageRole = "user" | "assistant";

/** Plain text, or v0's structured binary message format. */
export type MessageContent = string | MessageBinaryFormat;

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: MessageContent;
  /** Present while the assistant response is still streaming. */
  stream?: ReadableStream<Uint8Array>;
}

/** Chat metadata events emitted while a v0 response streams. */
export interface StreamChatData {
  id?: string;
  object?: string;
}

/** What the live preview needs to know about the current chat. */
export interface ChatPreview {
  id: string;
  demoUrl?: string | undefined;
}

/** An image attached to the prompt, held as a data URL. */
export type ImageAttachment = PromptInputAttachment;

/** The shape v0 expects for message attachments. */
export interface AttachmentPayload {
  url: string;
}
