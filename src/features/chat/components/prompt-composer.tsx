"use client";

import { type FormEvent, useState } from "react";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input/prompt-input";
import { PromptInputImageButton } from "@/components/ai-elements/prompt-input/prompt-input-image-button";
import { PromptInputImagePreview } from "@/components/ai-elements/prompt-input/prompt-input-image-preview";
import { PromptInputMicButton } from "@/components/ai-elements/prompt-input/prompt-input-mic-button";
import type { PromptComposer as PromptComposerState } from "../hooks/use-prompt-composer";

interface PromptComposerProps {
  composer: PromptComposerState;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder: string;
  /** Disable typing while a message is being sent. */
  lockWhileLoading?: boolean;
  className?: string;
  textareaClassName?: string;
}

function logSpeechError(error: string) {
  console.error("Speech recognition error:", error);
}

/** Prompt box with image attachments, drag & drop and dictation. */
export function PromptComposer({
  composer,
  onSubmit,
  isLoading,
  placeholder,
  lockWhileLoading = false,
  className,
  textareaClassName,
}: PromptComposerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isLocked = lockWhileLoading && isLoading;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <PromptInput
      onSubmit={handleSubmit}
      className={className}
      onImageDrop={composer.addImages}
      isDragOver={isDragOver}
      onDragOver={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => setIsDragOver(false)}
    >
      <PromptInputImagePreview
        attachments={composer.attachments}
        onRemove={composer.removeAttachment}
      />
      <PromptInputTextarea
        onChange={(event) => composer.setMessage(event.target.value)}
        value={composer.message}
        placeholder={placeholder}
        className={textareaClassName}
        disabled={isLocked}
        aria-label={placeholder}
        autoFocus
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputImageButton
            onImageSelect={composer.addImages}
            disabled={isLocked}
          />
        </PromptInputTools>
        <PromptInputTools>
          <PromptInputMicButton
            onTranscript={composer.appendTranscript}
            onError={logSpeechError}
            disabled={isLocked}
          />
          <PromptInputSubmit
            disabled={!composer.message.trim() || isLoading}
            status={isLoading ? "streaming" : "ready"}
          />
        </PromptInputTools>
      </PromptInputToolbar>
    </PromptInput>
  );
}
