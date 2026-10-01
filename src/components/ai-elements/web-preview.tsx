"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation";

export type WebPreviewProps = ComponentProps<"div">;

export function WebPreview({ className, ...props }: WebPreviewProps) {
  return (
    <div
      className={cn("flex size-full flex-col bg-background", className)}
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
      className={cn(
        "flex h-11 shrink-0 items-center gap-1 border-b bg-background px-2",
        className,
      )}
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={tooltip} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export type WebPreviewUrlProps = ComponentProps<typeof Input>;

export function WebPreviewUrl({ className, ...props }: WebPreviewUrlProps) {
  return (
    <Input
      className={cn("flex-1", className)}
      placeholder="Enter URL..."
      aria-label="Preview URL"
      {...props}
    />
  );
}

export type WebPreviewBodyProps = Omit<ComponentProps<"iframe">, "sandbox">;

export function WebPreviewBody({ className, ...props }: WebPreviewBodyProps) {
  return (
    <div className="min-h-0 flex-1 bg-white">
      <iframe
        className={cn("size-full", className)}
        title="Preview"
        {...props}
        sandbox={IFRAME_SANDBOX}
      />
    </div>
  );
}
