"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ResizableLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!(isDragging && containerRef.current)) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Clamp the width between min and max
      const clampedWidth = Math.min(
        Math.max(newLeftWidth, minLeftWidth),
        maxLeftWidth,
      );
      setLeftWidth(clampedWidth);
    },
    [isDragging, minLeftWidth, maxLeftWidth],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
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
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className={cn("flex h-full", className)}>
      {/* Left Panel */}
      <div className="flex flex-col" style={{ width: `${leftWidth}%` }}>
        {leftPanel}
      </div>

      {/* Resize Handle */}
      <hr
        className={cn(
          "group relative m-0 h-full w-px cursor-col-resize border-0 bg-border transition-all dark:bg-input",
          isDragging && "bg-blue-500 dark:bg-blue-400",
        )}
        onMouseDown={handleMouseDown}
        aria-label="Resize panels"
        aria-orientation="vertical"
        aria-valuenow={leftWidth}
        aria-valuemin={10}
        aria-valuemax={90}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const delta = e.key === "ArrowLeft" ? -5 : 5;
            const newLeftWidth = Math.max(10, Math.min(90, leftWidth + delta));
            setLeftWidth(newLeftWidth);
          }
        }}
      />
      {/* Blue highlight on hover - 3px wide */}
      {isDragging && (
        <div
          className={cn(
            "absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-blue-500 transition-all duration-200 dark:bg-blue-400",
          )}
        />
      )}

      {/* Right Panel */}
      <div className="flex flex-1 flex-col">{rightPanel}</div>
    </div>
  );
}
