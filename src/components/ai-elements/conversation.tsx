"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export function Conversation({ className, ...props }: ConversationProps) {
  return (
    <StickToBottom
      className={cn("relative flex min-h-0 flex-1 flex-col", className)}
      initial="smooth"
      resize="smooth"
      role="log"
      {...props}
    />
  );
}

export type ConversationContentProps = ComponentProps<"div">;

export function ConversationContent({
  className,
  ...props
}: ConversationContentProps) {
  const { scrollRef, contentRef } = useStickToBottomContext();
  return (
    <ScrollArea
      className="min-h-0 flex-1"
      viewportRef={scrollRef}
      viewportClassName="[&>div]:block!"
    >
      <div
        ref={contentRef}
        className={cn("mx-auto w-full max-w-3xl px-4 py-4", className)}
        {...props}
      />
    </ScrollArea>
  );
}

export function ConversationScrollButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) {
    return null;
  }

  return (
    <Button
      className={cn(
        "absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background shadow-md hover:bg-muted dark:bg-background dark:hover:bg-muted",
        className,
      )}
      onClick={() => scrollToBottom()}
      size="icon-lg"
      type="button"
      variant="outline"
      aria-label="Scroll to latest message"
      {...props}
    >
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
    </Button>
  );
}
