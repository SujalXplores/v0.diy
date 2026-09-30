"use client";

import { BrainIcon, ChevronDownIcon } from "lucide-react";
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
  /** Seconds spent thinking; 0 while unknown. */
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
        "group flex items-center gap-2 text-muted-foreground text-sm",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <BrainIcon className="size-4" />
          <p>
            {duration === 0 ? "Thinking..." : `Thought for ${duration} seconds`}
          </p>
          <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
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
        "mt-4 text-sm",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    >
      <Response className="grid gap-2">{children}</Response>
    </CollapsibleContent>
  );
}
