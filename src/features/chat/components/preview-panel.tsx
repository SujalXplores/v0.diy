"use client";

import { Maximize, Minimize, Monitor, RefreshCw } from "lucide-react";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from "@/components/ai-elements/web-preview";
import { cn } from "@/lib/utils";
import { usePreviewControls } from "../hooks/use-preview-controls";

interface PreviewPanelProps {
  demoUrl: string | undefined;
}

function EmptyPreview() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-black">
      <div className="text-center text-border dark:text-input">
        <Monitor className="mx-auto mb-2 h-12 w-12 stroke-border text-border dark:stroke-input dark:text-input" />
        <p className="font-medium text-sm">No preview available</p>
        <p className="text-xs">Start a conversation to see your app here</p>
      </div>
    </div>
  );
}

/** Live preview of the generated app with reload and fullscreen controls. */
export function PreviewPanel({ demoUrl }: PreviewPanelProps) {
  const { isFullscreen, toggleFullscreen, reloadKey, reload } =
    usePreviewControls();
  const FullscreenIcon = isFullscreen ? Minimize : Maximize;

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-black" : "flex-1",
      )}
    >
      <WebPreview>
        <WebPreviewNavigation>
          <WebPreviewNavigationButton
            onClick={reload}
            tooltip="Refresh preview"
            disabled={!demoUrl}
          >
            <RefreshCw className="h-4 w-4" />
          </WebPreviewNavigationButton>
          <WebPreviewUrl
            readOnly
            placeholder="Your app will appear here..."
            value={demoUrl ?? ""}
          />
          <WebPreviewNavigationButton
            onClick={toggleFullscreen}
            tooltip={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            disabled={!demoUrl}
          >
            <FullscreenIcon className="h-4 w-4" />
          </WebPreviewNavigationButton>
        </WebPreviewNavigation>
        {demoUrl ? (
          <WebPreviewBody key={reloadKey} src={demoUrl} />
        ) : (
          <EmptyPreview />
        )}
      </WebPreview>
    </div>
  );
}
