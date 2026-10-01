"use client";

import { AiBrain01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Response } from "./response";

export type ReasoningProps = ComponentProps<typeof Collapsible>;

export function Reasoning({ className, ...props }: ReasoningProps) {
  return <Collapsible className={cn("not-prose mb-4", className)} {...props} />;
}

export type ReasoningTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  duration: number;
};

export function ReasoningTrigger({
  className,
  duration,
  children,
  ...props
}: ReasoningTriggerProps) {
  return (
    <CollapsibleTrigger
      className={cn(
        "group flex items-center gap-1.5 rounded-md text-muted-foreground text-xs transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <HugeiconsIcon
            icon={AiBrain01Icon}
            strokeWidth={2}
            className="size-3.5"
          />
          <span className={cn(duration === 0 && "animate-pulse")}>
            {duration === 0 ? "Thinking..." : `Thought for ${duration}s`}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="size-3.5 transition-transform group-data-[state=open]:rotate-180"
          />
        </>
      )}
    </CollapsibleTrigger>
  );
}

export type ReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export function ReasoningContent({
  className,
  children,
  ...props
}: ReasoningContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "mt-3 border-l-2 pl-3 text-muted-foreground text-xs/relaxed",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    >
      <Response className="grid gap-2">{children}</Response>
    </CollapsibleContent>
  );
}
