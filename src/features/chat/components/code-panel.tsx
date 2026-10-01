"use client";

import {
  Cancel01Icon,
  Download01Icon,
  Edit02Icon,
  File01Icon,
  Folder01Icon,
  SourceCodeIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Files } from "@v0-sdk/react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { chatUrls, fetchFiles, updateFiles } from "../lib/chat-api";
import { describeChatError } from "../lib/chat-errors";

type ChatFile = Files["files"][number];

interface CodePanelProps {
  chatId: string;
  revision: number;
  isBusy: boolean;
  onSaved: () => void;
}

const LANGUAGES: Record<string, string> = {
  ts: "ts",
  tsx: "tsx",
  js: "js",
  jsx: "jsx",
  mjs: "js",
  cjs: "js",
  json: "json",
  css: "css",
  scss: "scss",
  html: "html",
  md: "md",
  mdx: "mdx",
  yml: "yaml",
  yaml: "yaml",
  sh: "bash",
  py: "python",
  sql: "sql",
  svg: "xml",
  toml: "toml",
};

function languageOf(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGES[extension] ?? "text";
}

function sortFiles(files: ChatFile[]): ChatFile[] {
  return [...files].sort((a, b) => {
    const aDepth = a.path.split("/").length;
    const bDepth = b.path.split("/").length;
    const aDir = a.path.slice(0, a.path.lastIndexOf("/"));
    const bDir = b.path.slice(0, b.path.lastIndexOf("/"));
    if (aDir !== bDir) {
      return aDir.localeCompare(bDir);
    }
    return aDepth - bDepth || a.path.localeCompare(b.path);
  });
}

function groupByFolder(files: ChatFile[]): [string, ChatFile[]][] {
  const groups = new Map<string, ChatFile[]>();
  for (const file of sortFiles(files)) {
    const folder = file.path.includes("/")
      ? file.path.slice(0, file.path.lastIndexOf("/"))
      : "";
    groups.set(folder, [...(groups.get(folder) ?? []), file]);
  }
  return [...groups.entries()];
}

function FileTree({
  files,
  selectedPath,
  onSelect,
}: {
  files: ChatFile[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <nav
      aria-label="Files"
      className="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto border-r p-2 max-md:w-44"
    >
      {groupByFolder(files).map(([folder, folderFiles]) => (
        <div key={folder || "root"} className="space-y-0.5">
          {folder && (
            <p className="flex items-center gap-1.5 truncate px-1.5 py-0.5 font-medium text-[0.6875rem] text-muted-foreground">
              <HugeiconsIcon
                icon={Folder01Icon}
                strokeWidth={2}
                className="size-3"
              />
              {folder}
            </p>
          )}
          {folderFiles.map((file) => {
            const name = file.path.slice(file.path.lastIndexOf("/") + 1);
            const isSelected = file.path === selectedPath;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => onSelect(file.path)}
                aria-current={isSelected ? "true" : undefined}
                title={file.path}
                className={cn(
                  "flex w-full items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-left font-mono text-[0.6875rem] outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30",
                  folder && "pl-4",
                  isSelected && "bg-muted font-medium text-foreground",
                  !isSelected && "text-muted-foreground",
                )}
              >
                <HugeiconsIcon
                  icon={File01Icon}
                  strokeWidth={2}
                  className="size-3 shrink-0"
                />
                <span className="truncate">{name}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function CodeViewer({
  file,
  isBusy,
  onSave,
}: {
  file: ChatFile;
  isBusy: boolean;
  onSave: (content: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = draft !== null;
  const isBinary = file.encoding === "base64";

  const save = async () => {
    if (draft === null) {
      return;
    }
    setIsSaving(true);
    if (await onSave(draft)) {
      setDraft(null);
    }
    setIsSaving(false);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b px-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[0.6875rem] text-muted-foreground">
          {file.path}
        </span>
        {!isBinary &&
          (isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDraft(null)}
                disabled={isSaving}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={isSaving || draft === file.content}
              >
                {isSaving ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                )}
                Save
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDraft(file.content)}
              disabled={isBusy}
              title={
                isBusy ? "Wait for v0 to finish before editing" : undefined
              }
            >
              <HugeiconsIcon
                icon={Edit02Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Edit
            </Button>
          ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {isBinary ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Binary file</EmptyTitle>
              <EmptyDescription>
                Download the project to open it.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : isEditing ? (
          <textarea
            aria-label={`Edit ${file.path}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "s") {
                event.preventDefault();
                save();
              }
            }}
            className="size-full resize-none bg-transparent p-3 font-mono text-xs/relaxed outline-none"
          />
        ) : (
          <Response className="text-xs [&_pre]:rounded-none [&_pre]:border-0">
            {`\`\`\`${languageOf(file.path)}\n${file.content}\n\`\`\``}
          </Response>
        )}
      </div>
    </div>
  );
}

export function CodePanel({
  chatId,
  revision,
  isBusy,
  onSaved,
}: CodePanelProps) {
  const { data, error, isLoading, mutate } = useSWR(
    [chatUrls.files(chatId), revision],
    () => fetchFiles(chatId),
    { keepPreviousData: true, revalidateOnFocus: false },
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const files = data?.files ?? [];
  const selected =
    files.find((file) => file.path === selectedPath) ??
    files.find((file) => /(^|\/)page\.tsx$/.test(file.path)) ??
    files[0];

  const save = async (content: string) => {
    if (!selected) {
      return false;
    }
    try {
      await updateFiles(chatId, [{ path: selected.path, content }]);
      await mutate();
      toast.success("Saved", { description: selected.path });
      onSaved();
      return true;
    } catch (saveError) {
      toast.error(describeChatError(saveError).message);
      return false;
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex min-h-0 flex-1">
        <div className="w-56 space-y-2 border-r p-3">
          {["w-3/4", "w-1/2", "w-2/3", "w-3/5", "w-1/2"].map((width) => (
            <Skeleton key={width} className={cn("h-3.5", width)} />
          ))}
        </div>
        <div className="flex-1 space-y-2 p-4">
          {["w-1/3", "w-2/3", "w-1/2", "w-3/4"].map((width) => (
            <Skeleton key={width} className={cn("h-3", width)} />
          ))}
        </div>
      </div>
    );
  }

  if (error || files.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={SourceCodeIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>
            {error ? "Couldn't load the code" : "No code yet"}
          </EmptyTitle>
          <EmptyDescription>
            {error
              ? describeChatError(error).message
              : "Files appear here once v0 writes the first version."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex shrink-0 flex-col">
        <FileTree
          files={files}
          selectedPath={selected?.path ?? null}
          onSelect={setSelectedPath}
        />
        <div className="border-t border-r p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <a href={chatUrls.download(chatId)} download>
              <HugeiconsIcon
                icon={Download01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Download ZIP
            </a>
          </Button>
        </div>
      </div>
      {selected && (
        <CodeViewer
          key={selected.path}
          file={selected}
          isBusy={isBusy}
          onSave={save}
        />
      )}
    </div>
  );
}
