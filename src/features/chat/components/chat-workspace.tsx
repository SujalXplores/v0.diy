"use client";

import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Chat, Message } from "@v0-sdk/react";
import { useState } from "react";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useChatSession } from "../hooks/use-chat-session";
import { useModelSettings } from "../hooks/use-model-settings";
import { usePromptComposer } from "../hooks/use-prompt-composer";
import { chatUrls } from "../lib/chat-api";
import { ChatConversation } from "./chat-conversation";
import { CodePanel } from "./code-panel";
import { DeployButton } from "./deploy-button";
import { PreviewPanel, type PreviewTarget } from "./preview-panel";
import { PromptComposer } from "./prompt-composer";

type WorkspaceView = "preview" | "code";
type MobilePanel = "chat" | WorkspaceView;

const MOBILE_PANELS: { value: MobilePanel; label: string }[] = [
  { value: "chat", label: "Chat" },
  { value: "preview", label: "Preview" },
  { value: "code", label: "Code" },
];

const VIEWS: { value: WorkspaceView; label: string }[] = [
  { value: "preview", label: "Preview" },
  { value: "code", label: "Code" },
];

interface ChatWorkspaceProps {
  chat: Chat;
  initialMessages: Message[];
  initialCursor: string | null;
  previewTarget: PreviewTarget | null;
}

function SegmentedControl<Value extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: Value;
  options: { value: Value; label: string }[];
  onChange: (value: Value) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex gap-0.5 rounded-lg bg-muted p-0.5", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-6 flex-1 rounded-md px-2.5 font-medium text-muted-foreground text-xs outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30",
            value === option.value &&
              "bg-background text-foreground shadow-xs ring-1 ring-foreground/10",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ChatWorkspace({
  chat,
  initialMessages,
  initialCursor,
  previewTarget,
}: ChatWorkspaceProps) {
  const [view, setView] = useState<WorkspaceView>("preview");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("chat");
  const [revision, setRevision] = useState(0);
  const composer = usePromptComposer(chat.id);
  const { settings, update: updateSettings } = useModelSettings();

  const session = useChatSession({
    chatId: chat.id,
    initialMessages,
    initialCursor,
    onContentChange: () => setRevision((current) => current + 1),
    onPromptRejected: (prompt) =>
      composer.restore(prompt.text, prompt.attachments),
  });

  const activeView: WorkspaceView = mobilePanel === "chat" ? view : mobilePanel;
  const [hasOpenedCode, setHasOpenedCode] = useState(false);
  if (activeView === "code" && !hasOpenedCode) {
    setHasOpenedCode(true);
  }
  const bumpRevision = () => setRevision((current) => current + 1);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 border-b p-2 md:hidden">
        <SegmentedControl
          label="Workspace view"
          value={mobilePanel}
          options={MOBILE_PANELS}
          onChange={setMobilePanel}
          className="w-full"
        />
      </div>

      <ResizableLayout
        className="min-h-0 flex-1"
        defaultLeftWidth={36}
        minLeftWidth={26}
        leftClassName={cn(mobilePanel !== "chat" && "max-md:hidden")}
        rightClassName={cn(mobilePanel === "chat" && "max-md:hidden")}
        leftPanel={
          <>
            <ChatConversation
              chatId={chat.id}
              session={session}
              vercelProjectId={chat.vercelProjectId}
              onResolveTask={(task) => session.resolveTask(task, settings)}
              onRejectPermission={() => session.rejectPermission(settings)}
            />
            <div className="shrink-0 px-3 pt-1 pb-3">
              <PromptComposer
                composer={composer}
                modelSettings={settings}
                onModelSettingsChange={updateSettings}
                onSubmit={(prompt) => session.send(prompt, settings)}
                isBusy={session.isBusy}
                onStop={() => session.stop()}
                isStopping={session.isStopping}
                placeholder="Ask v0 for changes…"
                className="mx-auto w-full max-w-3xl"
              />
            </div>
          </>
        }
        rightPanel={
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-11 shrink-0 items-center gap-2 border-b px-2">
              <SegmentedControl
                label="Workspace view"
                value={view}
                options={VIEWS}
                onChange={setView}
                className="max-md:hidden"
              />
              <div className="flex-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon">
                    <a
                      href={chatUrls.download(chat.id)}
                      download
                      aria-label="Download code as ZIP"
                    >
                      <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download ZIP</TooltipContent>
              </Tooltip>
              <DeployButton chatId={chat.id} disabled={session.isBusy} />
            </div>
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col",
                activeView !== "preview" && "hidden",
              )}
            >
              <PreviewPanel
                chatId={chat.id}
                target={previewTarget}
                revision={revision}
                isGenerating={session.isBusy}
              />
            </div>
            {hasOpenedCode && (
              <div
                className={cn(
                  "flex min-h-0 flex-1 flex-col",
                  activeView !== "code" && "hidden",
                )}
              >
                <CodePanel
                  chatId={chat.id}
                  revision={revision}
                  isBusy={session.isBusy}
                  onSaved={bumpRevision}
                />
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
