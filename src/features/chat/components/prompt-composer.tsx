"use client";

import { StopIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ClipboardEvent,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWindowEvent } from "@/hooks/use-window-event";
import { MAX_PROMPT_LENGTH } from "@/lib/v0-models";
import type { SentPrompt } from "../hooks/use-chat-session";
import type { ModelSettings } from "../hooks/use-model-settings";
import type { PromptComposerState } from "../hooks/use-prompt-composer";
import { ModelPicker } from "./model-picker";

interface PromptComposerProps {
  composer: PromptComposerState;
  modelSettings: ModelSettings;
  onModelSettingsChange: (patch: Partial<ModelSettings>) => void;
  onSubmit: (prompt: SentPrompt) => Promise<boolean>;
  isBusy: boolean;
  onStop?: () => void;
  isStopping?: boolean;
  placeholder: string;
  leadingTools?: ReactNode;
  autoFocus?: boolean;
  className?: string;
  textareaClassName?: string;
}

const SPEECH_ERRORS: Record<string, string> = {
  "not-allowed":
    "Microphone access was blocked. Allow it in your browser to dictate.",
  "audio-capture": "No microphone was found.",
  network: "Dictation needs an internet connection.",
};

function showSpeechError(error: string) {
  if (error !== "no-speech" && error !== "aborted") {
    toast.error(SPEECH_ERRORS[error] ?? "Dictation stopped unexpectedly.");
  }
}

function hasFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

export function PromptComposer({
  composer,
  modelSettings,
  onModelSettingsChange,
  onSubmit,
  isBusy,
  onStop,
  isStopping = false,
  placeholder,
  leadingTools,
  autoFocus = false,
  className,
  textareaClassName,
}: PromptComposerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const canSend = Boolean(composer.message.trim()) && !composer.isProcessing;

  useWindowEvent("dragover", (event) => {
    if (hasFiles(event)) {
      event.preventDefault();
    }
  });
  useWindowEvent("drop", (event) => {
    if (hasFiles(event)) {
      event.preventDefault();
      setIsDragOver(false);
    }
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy || !canSend) {
      return;
    }

    const prompt: SentPrompt = {
      text: composer.message.trim(),
      attachments: composer.attachments,
    };
    composer.clear();

    if (!(await onSubmit(prompt))) {
      composer.restore(prompt.text, prompt.attachments);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const images = Array.from(event.clipboardData.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (images.length > 0) {
      event.preventDefault();
      composer.addImages(images);
    }
  };

  return (
    <PromptInput
      onSubmit={handleSubmit}
      className={className}
      onImageDrop={composer.addImages}
      isDragOver={isDragOver}
      onDragOver={() => setIsDragOver(true)}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragOver(false);
        }
      }}
      onDrop={() => setIsDragOver(false)}
    >
      <PromptInputImagePreview
        attachments={composer.attachments}
        onRemove={composer.removeAttachment}
      />
      <PromptInputTextarea
        onChange={(event) => composer.setMessage(event.target.value)}
        onPaste={handlePaste}
        value={composer.message}
        placeholder={placeholder}
        className={textareaClassName}
        aria-label="Message v0"
        maxLength={MAX_PROMPT_LENGTH}
        enterKeyHint="send"
        autoFocus={autoFocus}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          {leadingTools}
          <PromptInputImageButton
            onImageSelect={composer.addImages}
            disabled={composer.isProcessing}
          />
          <ModelPicker
            settings={modelSettings}
            onChange={onModelSettingsChange}
          />
        </PromptInputTools>
        <PromptInputTools>
          <PromptInputMicButton
            onTranscript={composer.appendTranscript}
            onError={showSpeechError}
          />
          {isBusy && onStop ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-lg"
                  className="rounded-lg"
                  onClick={onStop}
                  disabled={isStopping}
                  aria-label="Stop generating"
                >
                  {isStopping ? (
                    <Spinner />
                  ) : (
                    <HugeiconsIcon icon={StopIcon} strokeWidth={2} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop generating</TooltipContent>
            </Tooltip>
          ) : (
            <PromptInputSubmit
              disabled={!canSend || isBusy}
              status={isBusy || composer.isProcessing ? "submitted" : "ready"}
            />
          )}
        </PromptInputTools>
      </PromptInputToolbar>
    </PromptInput>
  );
}
