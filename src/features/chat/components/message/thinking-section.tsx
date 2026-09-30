"use client";

import type { ThinkingSectionProps } from "@v0-sdk/react";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

/** Renders v0's thinking blocks with the AI Elements Reasoning component. */
export function ThinkingSection({
  duration,
  thought,
  collapsed,
  onCollapse,
  className,
  children,
}: ThinkingSectionProps) {
  const content =
    thought ||
    (typeof children === "string" ? children : "No thinking content available");

  return (
    <Reasoning
      className={className}
      defaultOpen={!collapsed}
      onOpenChange={() => onCollapse?.()}
    >
      <ReasoningTrigger
        duration={duration === undefined ? 0 : Math.round(duration)}
      />
      <ReasoningContent>{content}</ReasoningContent>
    </Reasoning>
  );
}
