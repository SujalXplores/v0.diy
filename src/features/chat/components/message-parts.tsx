"use client";

import {
  AiBrain01Icon,
  AiMagicIcon,
  Alert02Icon,
  ArrowDown01Icon,
  CommandLineIcon,
  FileAddIcon,
  FileEditIcon,
  FileRemoveIcon,
  FileSyncIcon,
  Globe02Icon,
  Search01Icon,
  ViewIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { V0UIMessage } from "@v0-sdk/react";
import { type ReactNode, useState } from "react";
import { Response } from "@/components/ai-elements/response";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ChatMessagePart } from "../lib/v0-messages";

type FileEditPart = Extract<ChatMessagePart, { type: "data-v0-file-edit" }>;
type AgentActionPart = Extract<
  ChatMessagePart,
  { type: "data-v0-agent-action" }
>;
type FilePart = Extract<ChatMessagePart, { type: "file" }>;

const INTERACTIVE_ACTIONS = new Set([
  "ask_user_questions",
  "exit_plan_mode",
  "get_or_request_integration",
  "configure_vercel_connect",
]);

const FILE_EDIT_LABELS: Record<FileEditPart["data"]["operation"], string> = {
  create: "Created",
  update: "Edited",
  patch: "Edited",
  delete: "Deleted",
  rename: "Renamed",
};

const FILE_EDIT_ICONS: Record<
  FileEditPart["data"]["operation"],
  IconSvgElement
> = {
  create: FileAddIcon,
  update: FileEditIcon,
  patch: FileEditIcon,
  delete: FileRemoveIcon,
  rename: FileSyncIcon,
};

function humanize(value: string): string {
  return value
    .replaceAll(/[-_]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function visibleAssistantText(text: string): string {
  const start = text.indexOf("<CodeProject");
  if (start === -1) {
    return text;
  }
  const end = text.indexOf("</CodeProject>", start);
  if (end === -1) {
    return text.slice(0, start).trim();
  }
  return `${text.slice(0, start)}${text.slice(end + "</CodeProject>".length)}`.trim();
}

const RAIL_CLASS = "mt-1 ml-1.5 border-l-2 pl-3.5";

interface ActivityProps {
  icon: IconSvgElement;
  title: string;
  detail?: string | undefined;
  details?: string | undefined;
  isError?: boolean;
  isActive?: boolean;
}

function Activity({
  icon,
  title,
  detail,
  details,
  isError = false,
  isActive = false,
}: ActivityProps) {
  const row = (
    <span className="flex min-w-0 items-center gap-2 py-0.5 text-xs">
      <HugeiconsIcon
        icon={isError ? Alert02Icon : icon}
        strokeWidth={2}
        className={cn(
          "size-3.5 shrink-0",
          isError ? "text-destructive" : "text-muted-foreground",
          isActive && "animate-pulse",
        )}
      />
      <span
        className={cn("shrink-0 font-medium", isError && "text-destructive")}
      >
        {title}
      </span>
      {detail && (
        <span className="min-w-0 truncate font-mono text-[0.6875rem] text-muted-foreground">
          {detail}
        </span>
      )}
    </span>
  );

  if (!details) {
    return row;
  }

  return (
    <Collapsible className="group/activity min-w-0">
      <CollapsibleTrigger className="flex w-full min-w-0 items-center gap-1 rounded-md text-left outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30">
        {row}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/activity:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className={RAIL_CLASS}>
        <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-md bg-muted/50 p-2 font-mono text-[0.6875rem] text-muted-foreground leading-relaxed">
          {details}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ThinkingPart({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!text) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="group/thinking flex items-center gap-2 rounded-md py-0.5 text-muted-foreground text-xs outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30">
        <HugeiconsIcon
          icon={AiBrain01Icon}
          strokeWidth={2}
          className={cn("size-3.5 shrink-0", isStreaming && "animate-pulse")}
        />
        <span>{isStreaming ? "Thinking…" : "Thought process"}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="-ml-1 size-3.5 transition-transform group-data-[state=open]/thinking:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(RAIL_CLASS, "text-muted-foreground text-xs/relaxed")}
      >
        <Response
          mode={isStreaming ? "streaming" : "static"}
          isAnimating={isStreaming}
          parseIncompleteMarkdown={isStreaming}
        >
          {text}
        </Response>
      </CollapsibleContent>
    </Collapsible>
  );
}

function AttachmentPart({ part }: { part: FilePart }) {
  if (part.mediaType.startsWith("image/")) {
    return (
      <a
        href={part.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg ring-1 ring-foreground/10"
      >
        {/* biome-ignore lint/performance/noImgElement: see comment above */}
        <img
          src={part.url}
          alt={part.filename ?? "Attached image"}
          className="max-h-48 w-auto object-contain"
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <Activity
      icon={FileAddIcon}
      title="Attached"
      detail={part.filename ?? part.url}
    />
  );
}

function renderPart(
  part: ChatMessagePart,
  { isAssistant, isStreaming }: { isAssistant: boolean; isStreaming: boolean },
): ReactNode {
  switch (part.type) {
    case "text": {
      const text = isAssistant ? visibleAssistantText(part.text) : part.text;
      if (!text) {
        return null;
      }
      if (!isAssistant) {
        return <p className="whitespace-pre-wrap break-words">{text}</p>;
      }
      const streaming = isStreaming && part.state === "streaming";
      return (
        <Response
          className="text-sm/relaxed"
          mode={streaming ? "streaming" : "static"}
          isAnimating={streaming}
          parseIncompleteMarkdown={streaming}
        >
          {text}
        </Response>
      );
    }
    case "reasoning":
      return (
        <ThinkingPart
          text={part.text}
          isStreaming={isStreaming && part.state === "streaming"}
        />
      );
    case "file":
      return <AttachmentPart part={part} />;
    case "data-v0-file-read":
      return (
        <Activity
          icon={ViewIcon}
          title={
            part.data.paths.length === 1
              ? "Read"
              : `Read ${part.data.paths.length} files`
          }
          detail={part.data.paths.join(", ")}
        />
      );
    case "data-v0-file-edit": {
      const { operation, path, toPath } = part.data;
      return (
        <Activity
          icon={FILE_EDIT_ICONS[operation]}
          title={FILE_EDIT_LABELS[operation]}
          detail={
            operation === "rename" && toPath ? `${path} → ${toPath}` : path
          }
          isActive={isStreaming && !part.data.finishedAt}
        />
      );
    }
    case "data-v0-search":
      return (
        <Activity
          icon={part.data.scope === "web" ? Globe02Icon : Search01Icon}
          title={
            part.data.scope === "web" ? "Searched the web" : "Searched code"
          }
          detail={part.data.query}
        />
      );
    case "data-v0-bash":
      return (
        <Activity
          icon={CommandLineIcon}
          title="Ran"
          detail={part.data.command}
          details={part.data.output}
        />
      );
    case "data-v0-tool-call": {
      const isError = part.data.status === "error";
      const details = [
        part.data.input !== undefined &&
          `Input\n${formatValue(part.data.input)}`,
        part.data.output !== undefined &&
          `Output\n${formatValue(part.data.output)}`,
      ]
        .filter(Boolean)
        .join("\n\n");
      return (
        <Activity
          icon={Wrench01Icon}
          title={isError ? "Tool failed" : "Used"}
          detail={part.data.toolDisplayName ?? humanize(part.data.name)}
          details={details || undefined}
          isError={isError}
        />
      );
    }
    case "data-v0-agent-action":
      return <AgentActionRow part={part} />;
    default:
      return null;
  }
}

function AgentActionRow({ part }: { part: AgentActionPart }) {
  if (INTERACTIVE_ACTIONS.has(part.data.name) && part.data.data) {
    return null;
  }
  return (
    <Activity
      icon={AiMagicIcon}
      title={humanize(part.data.name)}
      detail={part.data.summary}
    />
  );
}

function isActivityPart(part: ChatMessagePart): boolean {
  return part.type.startsWith("data-v0-");
}

export function MessageParts({
  message,
  isStreaming = false,
}: {
  message: V0UIMessage;
  isStreaming?: boolean;
}) {
  const isAssistant = message.role === "assistant";
  const blocks: ReactNode[] = [];
  let activity: ReactNode[] = [];

  const flushActivity = (key: string) => {
    if (activity.length > 0) {
      blocks.push(
        <div key={`activity-${key}`} className="flex min-w-0 flex-col gap-0.5">
          {activity}
        </div>,
      );
      activity = [];
    }
  };

  message.parts.forEach((part, index) => {
    const key = `${message.id}-${index}`;
    const node = renderPart(part, { isAssistant, isStreaming });
    if (node === null) {
      return;
    }
    if (isActivityPart(part)) {
      activity.push(<div key={key}>{node}</div>);
      return;
    }
    flushActivity(key);
    blocks.push(<div key={key}>{node}</div>);
  });
  flushActivity("end");

  return <div className="flex min-w-0 flex-col gap-3">{blocks}</div>;
}
