"use client";

import { ImageIcon } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { PromptInputButton, type PromptInputButtonProps } from "./prompt-input";

export type PromptInputImageButtonProps = PromptInputButtonProps & {
  onImageSelect: (files: File[]) => void;
};

/** Opens the file picker and reports the selected images. */
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

    // Reset so selecting the same file again still fires a change event.
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
      <PromptInputButton
        onClick={() => fileInputRef.current?.click()}
        aria-label="Attach images"
        {...props}
      >
        <ImageIcon className="size-4" />
      </PromptInputButton>
    </>
  );
}
