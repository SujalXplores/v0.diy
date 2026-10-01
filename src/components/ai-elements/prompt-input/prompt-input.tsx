"use client";

import {
  ArrowUp02Icon,
  Cancel01Icon,
  Loading03Icon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Children,
  type ComponentProps,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const isImageFile = (file: File) => file.type.startsWith("image/");

export type PromptInputProps = HTMLAttributes<HTMLFormElement> & {
  onImageDrop?: (files: File[]) => void;
  isDragOver?: boolean;
};

export function PromptInput({
  className,
  onImageDrop,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  ...props
}: PromptInputProps) {
  const handleDragOver = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onDragOver?.(event);
  };

  const handleDragLeave = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onDragLeave?.(event);
  };

  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const images = Array.from(event.dataTransfer.files).filter(isImageFile);
    if (images.length > 0) {
      onImageDrop?.(images);
    }

    onDrop?.(event);
  };

  return (
    <form
      className={cn(
        "w-full overflow-hidden rounded-xl border bg-card shadow-xs transition-[border-color,box-shadow]",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
        isDragOver && "border-ring border-dashed ring-2 ring-ring/30",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    />
  );
}

export type PromptInputTextareaProps = ComponentProps<typeof Textarea>;

export function PromptInputTextarea({
  className,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputTextareaProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <Textarea
      className={cn(
        "w-full resize-none rounded-none border-none px-3.5 pt-3 pb-1 shadow-none outline-none ring-0",
        "field-sizing-content max-h-[8lh] bg-transparent text-sm md:text-sm dark:bg-transparent",
        "focus-visible:ring-0",
        className,
      )}
      name="message"
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  );
}

export type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export function PromptInputToolbar({
  className,
  ...props
}: PromptInputToolbarProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-2 p-2", className)}
      {...props}
    />
  );
}

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export function PromptInputTools({
  className,
  ...props
}: PromptInputToolsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props} />
  );
}

export type PromptInputButtonProps = ComponentProps<typeof Button>;

export function PromptInputButton({
  variant = "ghost",
  className,
  size,
  ...props
}: PromptInputButtonProps) {
  const resolvedSize =
    size ?? (Children.count(props.children) > 1 ? "default" : "icon-lg");

  return (
    <Button
      className={cn(
        "shrink-0 rounded-lg",
        variant === "ghost" && "text-muted-foreground",
        className,
      )}
      size={resolvedSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
}

export type PromptInputStatus = "ready" | "submitted" | "streaming" | "error";

const STATUS_ICONS: Record<PromptInputStatus, IconSvgElement> = {
  ready: ArrowUp02Icon,
  submitted: Loading03Icon,
  streaming: StopIcon,
  error: Cancel01Icon,
};

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: PromptInputStatus;
};

export function PromptInputSubmit({
  className,
  variant = "default",
  size = "icon-lg",
  status = "ready",
  children,
  ...props
}: PromptInputSubmitProps) {
  return (
    <Button
      className={cn("rounded-lg", className)}
      size={size}
      type="submit"
      variant={variant}
      aria-label="Send message"
      {...props}
    >
      {children ?? (
        <HugeiconsIcon
          icon={STATUS_ICONS[status]}
          strokeWidth={2}
          className={cn(status === "submitted" && "animate-spin")}
        />
      )}
    </Button>
  );
}
