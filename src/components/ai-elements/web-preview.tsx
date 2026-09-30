"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Generated apps need scripts and forms but stay isolated from this origin's
// top-level navigation.
const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation";

export type WebPreviewProps = ComponentProps<"div">;

export function WebPreview({ className, ...props }: WebPreviewProps) {
  return (
    <div
      className={cn("flex size-full flex-col bg-card", className)}
      {...props}
    />
  );
}

export type WebPreviewNavigationProps = ComponentProps<"div">;

export function WebPreviewNavigation({
  className,
  ...props
}: WebPreviewNavigationProps) {
  return (
    <div
      className={cn("flex h-14 items-center gap-1 border-b p-2", className)}
      {...props}
    />
  );
}

export type WebPreviewNavigationButtonProps = ComponentProps<typeof Button> & {
  tooltip: string;
};

export function WebPreviewNavigationButton({
  tooltip,
  children,
  ...props
}: WebPreviewNavigationButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8 w-8 p-0 hover:text-foreground"
            size="sm"
            variant="ghost"
            aria-label={tooltip}
            {...props}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export type WebPreviewUrlProps = ComponentProps<typeof Input>;

export function WebPreviewUrl({ className, ...props }: WebPreviewUrlProps) {
  return (
    <Input
      className={cn("h-8 flex-1 text-sm", className)}
      placeholder="Enter URL..."
      aria-label="Preview URL"
      {...props}
    />
  );
}

export type WebPreviewBodyProps = Omit<ComponentProps<"iframe">, "sandbox">;

export function WebPreviewBody({ className, ...props }: WebPreviewBodyProps) {
  return (
    <div className="flex-1">
      <iframe
        className={cn("size-full", className)}
        title="Preview"
        {...props}
        sandbox={IFRAME_SANDBOX}
      />
    </div>
  );
}
