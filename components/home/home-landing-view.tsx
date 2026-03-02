"use client";

import Link from "next/link";
import {
  type ImageAttachment,
  PromptInput,
  PromptInputImageButton,
  PromptInputImagePreview,
  PromptInputMicButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { PROMPT_SUGGESTIONS } from "@/lib/prompt-suggestions";

interface HomeLandingViewProps {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  attachments: ImageAttachment[];
  isDragOver: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onImageFiles: (files: File[]) => void;
  onRemoveAttachment: (id: string) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
}

export function HomeLandingView({
  message,
  setMessage,
  isLoading,
  attachments,
  isDragOver,
  textareaRef,
  onSubmit,
  onImageFiles,
  onRemoveAttachment,
  onDragOver,
  onDragLeave,
  onDrop,
}: HomeLandingViewProps) {
  const submitSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    setTimeout(() => {
      textareaRef.current?.form?.requestSubmit();
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
            onImageDrop={onImageFiles}
            isDragOver={isDragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <PromptInputImagePreview
              attachments={attachments}
              onRemove={onRemoveAttachment}
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
                  onImageSelect={onImageFiles}
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
          <Suggestions>
            {PROMPT_SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={() => submitSuggestion(suggestion)}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
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
