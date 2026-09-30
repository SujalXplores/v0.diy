"use client";

import { MicIcon, MicOffIcon } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import { PromptInputButton, type PromptInputButtonProps } from "./prompt-input";

export type PromptInputMicButtonProps = Omit<
  PromptInputButtonProps,
  "onError"
> & {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
};

/** Dictation button; renders nothing in browsers without speech recognition. */
export function PromptInputMicButton({
  className,
  onTranscript,
  onError,
  ...props
}: PromptInputMicButtonProps) {
  const { isSupported, isListening, toggle } = useSpeechRecognition({
    onTranscript,
    onError,
  });

  if (!isSupported) {
    return null;
  }

  const Icon = isListening ? MicOffIcon : MicIcon;

  return (
    <PromptInputButton
      className={cn(
        "transition-colors",
        isListening &&
          "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
        className,
      )}
      onClick={toggle}
      aria-label={isListening ? "Stop dictation" : "Start dictation"}
      aria-pressed={isListening}
      {...props}
    >
      <Icon
        className={cn(
          "size-4",
          isListening && "text-red-600 dark:text-red-400",
        )}
      />
    </PromptInputButton>
  );
}
