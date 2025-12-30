import type { MessageBinaryFormat } from "@v0-sdk/react";

/**
 * Task part types for structured task content in shared-components
 */
export interface TaskPartChangedFile {
  fileName?: string;
  baseName?: string;
}

export interface TaskPartInspiration {
  title?: string;
  description?: string;
}

export interface TaskPart {
  type: string;
  query?: string;
  filePaths?: string[];
  filePath?: string;
  count?: number;
  answer?: string;
  changedFiles?: TaskPartChangedFile[];
  inspirations?: TaskPartInspiration[];
  requirements?: unknown[];
  status?: string;
  message?: string;
  description?: string;
  text?: string;
  error?: string;
  source?: string;
}

/**
 * Chat-related types for use-chat hook
 */
export interface Chat {
  id: string;
  demo?: string;
  url?: string;
  messages?: ChatMessageData[];
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  experimental_content?: MessageBinaryFormat;
}

export interface ChatMessage {
  type: "user" | "assistant";
  content: string | MessageBinaryFormat;
  isStreaming?: boolean;
  stream?: ReadableStream<Uint8Array> | null;
}

export interface ChatData {
  id?: string;
  webUrl?: string;
  url?: string;
  object?: string;
}

/**
 * Image attachment types for prompt input
 */
export interface ImageAttachment {
  id: string;
  file: File;
  preview: string;
  dataUrl?: string;
}

export interface StoredImageAttachment {
  id: string;
  fileName: string;
  dataUrl: string;
  preview: string;
}

export interface StoredPromptData {
  message: string;
  attachments: StoredImageAttachment[];
}
