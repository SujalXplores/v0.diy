import { Maximize, Minimize, Monitor, RefreshCw } from "lucide-react";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from "@/components/ai-elements/web-preview";
import { cn } from "@/lib/utils";
import type { Chat } from "@/types/chat";

interface PreviewPanelProps {
  currentChat: Chat | null;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  refreshKey: number;
  setRefreshKey: (key: number | ((prev: number) => number)) => void;
}

export function PreviewPanel({
  currentChat,
  isFullscreen,
  setIsFullscreen,
  refreshKey,
  setRefreshKey,
}: PreviewPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-black" : "flex-1",
      )}
    >
      <WebPreview
        defaultUrl={currentChat?.demo || ""}
        onUrlChange={() => {
          // URL change handler - no action needed
        }}
      >
        <WebPreviewNavigation>
          <WebPreviewNavigationButton
            onClick={() => {
              // Force refresh the iframe by updating the refresh key
              setRefreshKey((prev) => prev + 1);
            }}
            tooltip="Refresh preview"
            disabled={!currentChat?.demo}
          >
            <RefreshCw className="h-4 w-4" />
          </WebPreviewNavigationButton>
          <WebPreviewUrl
            readOnly
            placeholder="Your app will appear here..."
            value={currentChat?.demo || ""}
          />
          <WebPreviewNavigationButton
            onClick={() => setIsFullscreen(!isFullscreen)}
            tooltip={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            disabled={!currentChat?.demo}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </WebPreviewNavigationButton>
        </WebPreviewNavigation>
        {currentChat?.demo ? (
          <WebPreviewBody key={refreshKey} src={currentChat.demo} />
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-black">
            <div className="text-center text-border dark:text-input">
              <div className="mb-2">
                <Monitor className="mx-auto h-12 w-12 stroke-border text-border dark:stroke-input dark:text-input" />
              </div>
              <p className="font-medium text-sm">No preview available</p>
              <p className="text-xs">
                Start a conversation to see your app here
              </p>
            </div>
          </div>
        )}
      </WebPreview>
    </div>
  );
}
