"use client";

import type { ComponentProps } from "react";
import { StickToBottom } from "use-stick-to-bottom";
import { cn } from "@/lib/utils";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

/** Scroll container that stays pinned to the newest message. */
export function Conversation({ className, ...props }: ConversationProps) {
  return (
    <StickToBottom
      className={cn("relative flex-1 overflow-y-auto", className)}
      initial="smooth"
      resize="smooth"
      role="log"
      {...props}
    />
  );
}

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export function ConversationContent({
  className,
  ...props
}: ConversationContentProps) {
  return <StickToBottom.Content className={cn("p-4", className)} {...props} />;
}
