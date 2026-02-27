"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearPromptFromStorage,
  createImageAttachment,
  createImageAttachmentFromStored,
  type ImageAttachment,
  loadPromptFromStorage,
  PromptInput,
  PromptInputImageButton,
  PromptInputImagePreview,
  PromptInputMicButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  savePromptToStorage,
} from "@/components/ai-elements/prompt-input";
import { SuggestionList } from "@/components/chat/suggestion-list";

interface HomeLandingProps {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  attachments: ImageAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<ImageAttachment[]>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function HomeLanding({
  message,
  setMessage,
  isLoading,
  attachments,
  setAttachments,
  onSubmit,
  textareaRef,
}: HomeLandingProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    const storedData = loadPromptFromStorage();
    if (storedData) {
      setMessage(storedData.message);
      if (storedData.attachments.length > 0) {
        const restoredAttachments = storedData.attachments.map(
          createImageAttachmentFromStored,
        );
        setAttachments(restoredAttachments);
      }
    }
  }, [setMessage, setAttachments, textareaRef]);

  useEffect(() => {
    if (message.trim() || attachments.length > 0) {
      savePromptToStorage(message, attachments);
    } else {
      clearPromptFromStorage();
    }
  }, [message, attachments]);

  const handleImageFiles = async (files: File[]) => {
    try {
      const newAttachments = await Promise.all(
        files.map((file) => createImageAttachment(file)),
      );
      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error) {
      console.error("Error processing image files:", error);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setMessage(suggestion);
    setTimeout(() => {
      const form = textareaRef.current?.form;
      if (form) {
        form.requestSubmit();
      }
    }, 0);
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
            What can we build together?
          </h2>
        </div>

        <div className="mx-auto max-w-2xl">
          <PromptInput
            onSubmit={onSubmit}
            className="relative w-full"
            onImageDrop={handleImageFiles}
            isDragOver={isDragOver}
            onDragOver={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={() => setIsDragOver(false)}
          >
            <PromptInputImagePreview
              attachments={attachments}
              onRemove={handleRemoveAttachment}
            />
            <PromptInputTextarea
              ref={textareaRef}
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              placeholder="Describe what you want to build..."
              className="min-h-20 text-base"
              disabled={isLoading}
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputImageButton
                  onImageSelect={handleImageFiles}
                  disabled={isLoading}
                />
              </PromptInputTools>
              <PromptInputTools>
                <PromptInputMicButton
                  onTranscript={(transcript) => {
                    setMessage(message + (message ? " " : "") + transcript);
                  }}
                  onError={(error) => {
                    console.error("Speech recognition error:", error);
                  }}
                  disabled={isLoading}
                />
                <PromptInputSubmit
                  disabled={!message.trim() || isLoading}
                  status={isLoading ? "streaming" : "ready"}
                />
              </PromptInputTools>
            </PromptInputToolbar>
          </PromptInput>
        </div>

        <div className="mx-auto mt-4 max-w-2xl">
          <SuggestionList onSelect={handleSuggestionSelect} />
        </div>

        <div className="mt-16 text-center text-muted-foreground text-sm">
          <p>
            Powered by{" "}
            <Link
              href="https://v0-sdk.dev"
              className="text-foreground hover:underline"
            >
              v0 SDK
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
