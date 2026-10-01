"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SuggestionsProps = ComponentProps<"div">;

export const Suggestions = ({ className, ...props }: SuggestionsProps) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-center gap-2",
      className,
    )}
    {...props}
  />
);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "lg",
  children,
  ...props
}: SuggestionProps) => (
  <Button
    className={cn("rounded-full px-4", className)}
    onClick={() => onClick?.(suggestion)}
    size={size}
    type="button"
    variant={variant}
    {...props}
  >
    {children || suggestion}
  </Button>
);
