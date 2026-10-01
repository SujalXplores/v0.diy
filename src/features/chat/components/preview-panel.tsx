"use client";

import {
  ArrowUpRight01Icon,
  ComputerIcon,
  Maximize01Icon,
  Minimize01Icon,
  RefreshIcon,
  SmartPhone01Icon,
  Tablet01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useRef, useState } from "react";
import { WebPreviewNavigationButton } from "@/components/ai-elements/web-preview";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useWindowEvent } from "@/hooks/use-window-event";
import { requestJson } from "@/lib/http-client";
import { cn } from "@/lib/utils";
import { chatUrls } from "../lib/chat-api";

export interface PreviewTarget {
  url: string;
  origin: string;
}

type Device = "desktop" | "tablet" | "mobile";

const DEVICES: {
  value: Device;
  label: string;
  icon: IconSvgElement;
  width?: number;
}[] = [
  { value: "desktop", label: "Desktop", icon: ComputerIcon },
  { value: "tablet", label: "Tablet", icon: Tablet01Icon, width: 768 },
  { value: "mobile", label: "Phone", icon: SmartPhone01Icon, width: 390 },
];

const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-presentation";

const SETTLE_MS = 700;

interface PreviewPanelProps {
  chatId: string;
  target: PreviewTarget | null;
  revision: number;
  isGenerating: boolean;
}

function PreviewUnavailable() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>Previews need a preview domain</EmptyTitle>
        <EmptyDescription>
          Generated apps run on a separate site for security. Set{" "}
          <code className="font-mono">PREVIEW_ORIGIN</code> to a domain that
          points at this deployment to enable previews.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function PreviewPanel({
  chatId,
  target: initialTarget,
  revision,
  isGenerating,
}: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [target, setTarget] = useState(initialTarget);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState<Device>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const width = DEVICES.find((option) => option.value === device)?.width;

  const [loadedRevision, setLoadedRevision] = useState(revision);
  if (revision !== loadedRevision) {
    setLoadedRevision(revision);
    setIsLoading(true);
  }

  useWindowEvent("message", (event) => {
    if (
      event.origin !== target?.origin ||
      event.source !== iframeRef.current?.contentWindow ||
      (event.data as { type?: unknown } | null)?.type !==
        "v0diy-preview-loading"
    ) {
      return;
    }
    clearTimeout(settleTimerRef.current);
    setIsLoading(true);
  });

  useWindowEvent(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    },
    { enabled: isFullscreen },
  );

  const handleLoad = () => {
    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => setIsLoading(false), SETTLE_MS);
  };

  const reload = async () => {
    setIsLoading(true);
    try {
      const { preview } = await requestJson<{ preview: PreviewTarget | null }>(
        chatUrls.previewUrl(chatId),
      );
      setTarget(preview);
    } catch {
      // Keep the current URL; reloading it is still worth a try.
    }
    setReloadKey((key) => key + 1);
  };

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col bg-background",
        isFullscreen && "fixed inset-0 z-50",
      )}
    >
      <div className="flex h-11 shrink-0 items-center gap-1 border-b px-2">
        <div
          role="radiogroup"
          aria-label="Preview size"
          className="flex items-center gap-0.5"
        >
          {DEVICES.map((option) => (
            <WebPreviewNavigationButton
              key={option.value}
              tooltip={option.label}
              role="radio"
              aria-checked={device === option.value}
              variant={device === option.value ? "secondary" : "ghost"}
              onClick={() => setDevice(option.value)}
              disabled={!target}
            >
              <HugeiconsIcon icon={option.icon} strokeWidth={2} />
            </WebPreviewNavigationButton>
          ))}
        </div>
        <div className="flex-1" />
        <WebPreviewNavigationButton
          tooltip="Reload preview"
          onClick={reload}
          disabled={!target}
        >
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
        </WebPreviewNavigationButton>
        {target && (
          <WebPreviewNavigationButton tooltip="Open in new tab" asChild>
            <a
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open preview in new tab"
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
            </a>
          </WebPreviewNavigationButton>
        )}
        <WebPreviewNavigationButton
          tooltip={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          onClick={() => setIsFullscreen((value) => !value)}
          disabled={!target}
        >
          <HugeiconsIcon
            icon={isFullscreen ? Minimize01Icon : Maximize01Icon}
            strokeWidth={2}
          />
        </WebPreviewNavigationButton>
      </div>

      <div className="relative flex min-h-0 flex-1 justify-center overflow-auto bg-dot-grid bg-muted/30">
        {target ? (
          <>
            <div
              className={cn(
                "h-full w-full bg-white transition-[max-width] duration-300",
                width &&
                  "my-3 h-[calc(100%-1.5rem)] rounded-lg shadow-sm ring-1 ring-foreground/10",
              )}
              style={width ? { maxWidth: width } : undefined}
            >
              <iframe
                key={`${revision}-${reloadKey}`}
                ref={iframeRef}
                src={target.url}
                title="App preview"
                className={cn("size-full", width && "rounded-lg")}
                sandbox={IFRAME_SANDBOX}
                allow="clipboard-read; clipboard-write; fullscreen"
                onLoad={handleLoad}
              />
            </div>
            {isLoading && (
              <div className="fade-in absolute inset-0 flex animate-in items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Spinner className="size-3.5" />
                  {isGenerating
                    ? "v0 is building your app…"
                    : "Starting preview…"}
                </div>
              </div>
            )}
          </>
        ) : (
          <PreviewUnavailable />
        )}
      </div>
    </div>
  );
}
