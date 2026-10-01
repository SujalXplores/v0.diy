"use client";

import { Mic01Icon, MicOff01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const label = isListening ? "Stop dictation" : "Start dictation";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <PromptInputButton
          className={cn(
            isListening &&
              "bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive",
            className,
          )}
          onClick={toggle}
          aria-label={label}
          aria-pressed={isListening}
          {...props}
        >
          <HugeiconsIcon
            icon={isListening ? MicOff01Icon : Mic01Icon}
            strokeWidth={2}
            className={cn(isListening && "animate-pulse")}
          />
        </PromptInputButton>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
