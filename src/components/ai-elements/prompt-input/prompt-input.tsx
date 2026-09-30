"use client";

import { ArrowUpIcon, Loader2Icon, SquareIcon, XIcon } from "lucide-react";
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
  /** Called with the images dropped onto the form. */
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
        "w-full divide-y overflow-hidden rounded-xl border bg-background shadow-sm transition-colors",
        isDragOver && "border-primary bg-primary/5",
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

/** Auto-growing textarea that submits on Enter and adds a newline on Shift+Enter. */
export function PromptInputTextarea({
  className,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputTextareaProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore Enter while an IME composition is in progress.
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
        "w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0",
        "field-sizing-content max-h-[6lh] bg-transparent dark:bg-transparent",
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
      className={cn("flex items-center justify-between p-1", className)}
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
    <div
      className={cn(
        "flex items-center gap-1",
        "[&_button:first-child]:rounded-bl-xl",
        className,
      )}
      {...props}
    />
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
    size ?? (Children.count(props.children) > 1 ? "default" : "icon");

  return (
    <Button
      className={cn(
        "shrink-0 gap-1.5 rounded-lg",
        variant === "ghost" && "text-muted-foreground",
        resolvedSize === "default" && "px-3",
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

const STATUS_ICONS: Record<PromptInputStatus, typeof ArrowUpIcon> = {
  ready: ArrowUpIcon,
  submitted: Loader2Icon,
  streaming: SquareIcon,
  error: XIcon,
};

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: PromptInputStatus;
};

export function PromptInputSubmit({
  className,
  variant = "default",
  size = "icon",
  status = "ready",
  children,
  ...props
}: PromptInputSubmitProps) {
  const Icon = STATUS_ICONS[status];

  return (
    <Button
      className={cn("gap-1.5 rounded-lg", className)}
      size={size}
      type="submit"
      variant={variant}
      aria-label="Send message"
      {...props}
    >
      {children ?? (
        <Icon
          className={cn("size-4", status === "submitted" && "animate-spin")}
        />
      )}
    </Button>
  );
}
