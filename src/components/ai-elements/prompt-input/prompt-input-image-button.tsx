"use client";

import { ImageAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ChangeEvent, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptInputButton, type PromptInputButtonProps } from "./prompt-input";

export type PromptInputImageButtonProps = PromptInputButtonProps & {
  onImageSelect: (files: File[]) => void;
};

export function PromptInputImageButton({
  onImageSelect,
  ...props
}: PromptInputImageButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const images = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (images.length > 0) {
      onImageSelect(images);
    }

    event.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="Attach images"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <PromptInputButton
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach images"
            {...props}
          >
            <HugeiconsIcon icon={ImageAdd01Icon} strokeWidth={2} />
          </PromptInputButton>
        </TooltipTrigger>
        <TooltipContent>Attach images</TooltipContent>
      </Tooltip>
    </>
  );
}
