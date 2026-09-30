"use client";

import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = ({
  className,
  children,
  ...props
}: SuggestionsProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Show fade edges only on the sides that have more suggestions to scroll to.
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    );
    if (!viewport) {
      return;
    }

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = viewport;
      setCanScrollLeft(scrollLeft > 0);
      // -1 absorbs sub-pixel rounding.
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    updateScrollState();
    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      {canScrollLeft && (
        <div className="pointer-events-none absolute -top-px -left-px z-10 h-[calc(100%+1px)] w-12 bg-gradient-to-r from-gray-50 to-transparent dark:from-black" />
      )}

      {canScrollRight && (
        <div className="pointer-events-none absolute -top-px -right-px z-10 h-[calc(100%+1px)] w-12 bg-gradient-to-l from-gray-50 to-transparent dark:from-black" />
      )}

      <ScrollArea
        ref={scrollAreaRef}
        className="w-full overflow-x-auto whitespace-nowrap"
        {...props}
      >
        <div
          className={cn("flex w-max flex-nowrap items-center gap-2", className)}
        >
          {children}
        </div>
        <ScrollBar className="hidden" orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <Button
      className={cn("cursor-pointer rounded-full px-4", className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};
