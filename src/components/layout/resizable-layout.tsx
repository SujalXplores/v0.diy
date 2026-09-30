"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const KEYBOARD_STEP_PERCENT = 5;

interface ResizableLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  /** Widths are percentages of the container. */
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Two panels separated by a draggable, keyboard-accessible divider. */
export function ResizableLayout({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 30,
  minLeftWidth = 20,
  maxLeftWidth = 60,
  className,
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const { left, width } = container.getBoundingClientRect();
      const percent = ((event.clientX - left) / width) * 100;
      setLeftWidth(clamp(percent, minLeftWidth, maxLeftWidth));
    };
    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  const handleKeyDown = (event: KeyboardEvent<HTMLHRElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const delta =
      event.key === "ArrowLeft"
        ? -KEYBOARD_STEP_PERCENT
        : KEYBOARD_STEP_PERCENT;
    setLeftWidth((width) => clamp(width + delta, minLeftWidth, maxLeftWidth));
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full",
        // Iframes swallow mouse events, which would end drags over the preview.
        isDragging && "[&_iframe]:pointer-events-none",
        className,
      )}
    >
      <div className="flex flex-col" style={{ width: `${leftWidth}%` }}>
        {leftPanel}
      </div>

      {/* A focusable separator is the interactive ARIA "window splitter"
          pattern, so handlers on it are expected. */}
      {/* react-doctor-disable-next-line react-doctor/no-noninteractive-element-interactions */}
      <hr
        className={cn(
          "relative m-0 h-full w-px cursor-col-resize border-0 bg-border transition-colors dark:bg-input",
          // Widen the grab area beyond the 1px line.
          "before:absolute before:inset-y-0 before:-left-1.5 before:w-3 before:content-['']",
          isDragging && "bg-blue-500 dark:bg-blue-400",
        )}
        onMouseDown={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onKeyDown={handleKeyDown}
        aria-label="Resize panels"
        aria-orientation="vertical"
        aria-valuenow={Math.round(leftWidth)}
        aria-valuemin={minLeftWidth}
        aria-valuemax={maxLeftWidth}
        tabIndex={0}
      />

      <div className="flex flex-1 flex-col">{rightPanel}</div>
    </div>
  );
}
