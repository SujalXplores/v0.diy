"use client";

import {
  ArrowRight01Icon,
  Cancel01Icon,
  Copy01Icon,
  Edit02Icon,
  Folder01Icon,
  FolderOpenIcon,
  Maximize01Icon,
  Minimize01Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SourceCodeIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Files } from "@v0-sdk/react";
import { type ReactNode, useState } from "react";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useWindowEvent } from "@/hooks/use-window-event";
import { cn } from "@/lib/utils";
import { chatUrls, fetchFiles, updateFiles } from "../lib/chat-api";
import { describeChatError } from "../lib/chat-errors";
import { getFileIcon } from "../lib/file-icons";

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
  mts: "ts",
  cts: "ts",
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
  xml: "xml",
  toml: "toml",
};

function languageOf(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGES[extension] ?? "text";
}

interface FolderNode {
  kind: "folder";
  name: string;
  path: string;
  children: TreeNode[];
}

interface FileNode {
  kind: "file";
  name: string;
  path: string;
}

type TreeNode = FolderNode | FileNode;

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .sort((a, b) =>
      a.kind === b.kind
        ? a.name.localeCompare(b.name)
        : a.kind === "folder"
          ? -1
          : 1,
    )
    .map((node) =>
      node.kind === "folder"
        ? { ...node, children: sortTree(node.children) }
        : node,
    );
}

function buildTree(files: ChatFile[]): TreeNode[] {
  const root: FolderNode = {
    kind: "folder",
    name: "",
    path: "",
    children: [],
  };

  for (const file of files) {
    const segments = file.path.split("/");
    let folder = root;
    segments.slice(0, -1).forEach((segment, index) => {
      const path = segments.slice(0, index + 1).join("/");
      let next = folder.children.find(
        (child): child is FolderNode =>
          child.kind === "folder" && child.path === path,
      );
      if (!next) {
        next = { kind: "folder", name: segment, path, children: [] };
        folder.children.push(next);
      }
      folder = next;
    });
    folder.children.push({
      kind: "file",
      name: segments.at(-1) ?? file.path,
      path: file.path,
    });
  }

  return sortTree(root.children);
}

const indent = (depth: number) => ({ paddingLeft: `${depth * 12 + 6}px` });

function TreeItems({
  nodes,
  depth,
  selectedPath,
  collapsed,
  onToggleFolder,
  onSelect,
}: {
  nodes: TreeNode[];
  depth: number;
  selectedPath: string | null;
  collapsed: ReadonlySet<string>;
  onToggleFolder: (path: string) => void;
  onSelect: (path: string) => void;
}) {
  return nodes.map((node) => {
    if (node.kind === "folder") {
      const isOpen = !collapsed.has(node.path);
      return (
        <li key={node.path}>
          <button
            type="button"
            aria-expanded={isOpen}
            onClick={() => onToggleFolder(node.path)}
            title={node.path}
            style={indent(depth)}
            className="flex h-6 w-full items-center gap-1 rounded-md pr-1.5 text-left text-muted-foreground text-xs outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className={cn(
                "size-3 shrink-0 transition-transform",
                isOpen && "rotate-90",
              )}
            />
            <HugeiconsIcon
              icon={isOpen ? FolderOpenIcon : Folder01Icon}
              strokeWidth={2}
              className="size-3.5 shrink-0"
            />
            <span className="truncate">{node.name}</span>
          </button>
          {isOpen && (
            <ul>
              <TreeItems
                nodes={node.children}
                depth={depth + 1}
                selectedPath={selectedPath}
                collapsed={collapsed}
                onToggleFolder={onToggleFolder}
                onSelect={onSelect}
              />
            </ul>
          )}
        </li>
      );
    }

    const isSelected = node.path === selectedPath;
    const fileIcon = getFileIcon(node.path);
    return (
      <li key={node.path}>
        <button
          type="button"
          onClick={() => onSelect(node.path)}
          aria-current={isSelected ? "true" : undefined}
          title={node.path}
          style={{ paddingLeft: `${depth * 12 + 22}px` }}
          className={cn(
            "flex h-6 w-full items-center gap-1.5 rounded-md pr-1.5 text-left text-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30",
            isSelected
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <HugeiconsIcon
            icon={fileIcon.icon}
            strokeWidth={2}
            className={cn("size-3.5 shrink-0", fileIcon.className)}
          />
          <span className="truncate">{node.name}</span>
        </button>
      </li>
    );
  });
}

function FileTree({
  files,
  selectedPath,
  onSelect,
  onClose,
  className,
}: {
  files: ChatFile[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onClose: () => void;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

  const toggleFolder = (path: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(path)) {
        next.add(path);
      }
      return next;
    });

  return (
    <nav
      aria-label="Files"
      className={cn("flex w-60 shrink-0 flex-col border-r", className)}
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b pr-1.5 pl-3">
        <span className="font-medium text-xs">Files</span>
        <span className="text-[0.6875rem] text-muted-foreground tabular-nums">
          {files.length}
        </span>
        <div className="flex-1" />
        <IconButton label="Hide files" onClick={onClose}>
          <HugeiconsIcon icon={PanelLeftCloseIcon} strokeWidth={2} />
        </IconButton>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="p-1.5">
          <TreeItems
            nodes={buildTree(files)}
            depth={0}
            selectedPath={selectedPath}
            collapsed={collapsed}
            onToggleFolder={toggleFolder}
            onSelect={onSelect}
          />
        </ul>
      </ScrollArea>
    </nav>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
          className={cn("text-muted-foreground", className)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function FileBreadcrumb({ path }: { path: string }) {
  const segments = path.split("/");
  const fileIcon = getFileIcon(path);
  return (
    <span
      className="flex min-w-0 flex-1 items-center gap-1.5 text-xs"
      title={path}
    >
      <HugeiconsIcon
        icon={fileIcon.icon}
        strokeWidth={2}
        className={cn("size-3.5 shrink-0", fileIcon.className)}
      />
      <span className="truncate text-muted-foreground">
        {segments.slice(0, -1).map((segment, index) => (
          <span key={segments.slice(0, index + 1).join("/")}>
            {segment}
            <span className="px-1 text-muted-foreground/50">/</span>
          </span>
        ))}
        <span className="font-medium text-foreground">{segments.at(-1)}</span>
      </span>
    </span>
  );
}

function EditActions({
  canSave,
  isSaving,
  onCancel,
  onSave,
}: {
  canSave: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
        <HugeiconsIcon
          icon={Cancel01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Cancel
      </Button>
      <Button size="sm" onClick={onSave} disabled={!canSave}>
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
  );
}

function ViewActions({
  content,
  isBusy,
  onEdit,
}: {
  content: string;
  isBusy: boolean;
  onEdit: () => void;
}) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <>
      <IconButton
        label={copied ? "Copied" : "Copy file"}
        onClick={() => copy(content)}
      >
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          strokeWidth={2}
        />
      </IconButton>
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        disabled={isBusy}
        title={isBusy ? "Wait for v0 to finish before editing" : undefined}
      >
        <HugeiconsIcon
          icon={Edit02Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Edit
      </Button>
    </>
  );
}

function CodeViewer({
  file,
  isBusy,
  isFullscreen,
  treeToggleClassName,
  onOpenTree,
  onToggleFullscreen,
  onSave,
}: {
  file: ChatFile;
  isBusy: boolean;
  isFullscreen: boolean;
  treeToggleClassName: string;
  onOpenTree: () => void;
  onToggleFullscreen: () => void;
  onSave: (content: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = draft !== null;
  const isBinary = file.encoding === "base64";

  const save = () => {
    if (draft === null) {
      return;
    }
    setIsSaving(true);
    return onSave(draft)
      .then((saved) => {
        if (saved) {
          setDraft(null);
        }
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b pr-1.5 pl-2">
        <IconButton
          label="Show files"
          onClick={onOpenTree}
          className={treeToggleClassName}
        >
          <HugeiconsIcon icon={PanelLeftOpenIcon} strokeWidth={2} />
        </IconButton>
        <div className="flex min-w-0 flex-1 px-1">
          <FileBreadcrumb path={file.path} />
        </div>
        {!isBinary &&
          (isEditing ? (
            <EditActions
              canSave={!isSaving && draft !== file.content}
              isSaving={isSaving}
              onCancel={() => setDraft(null)}
              onSave={save}
            />
          ) : (
            <ViewActions
              content={file.content}
              isBusy={isBusy}
              onEdit={() => setDraft(file.content)}
            />
          ))}
        <IconButton
          label={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          onClick={onToggleFullscreen}
        >
          <HugeiconsIcon
            icon={isFullscreen ? Minimize01Icon : Maximize01Icon}
            strokeWidth={2}
          />
        </IconButton>
      </div>

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
          className="min-h-0 flex-1 resize-none bg-transparent px-4 py-3 font-mono text-xs/relaxed outline-none"
        />
      ) : (
        <ScrollArea className="code-viewer min-h-0 flex-1">
          <Response codeBlockMaxHeight={0} controls={false}>
            {`\`\`\`${languageOf(file.path)}\n${file.content}\n\`\`\``}
          </Response>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}

const TREE_SKELETON = [
  { id: "tree-1", width: "w-3/4" },
  { id: "tree-2", width: "w-1/2" },
  { id: "tree-3", width: "w-2/3" },
  { id: "tree-4", width: "w-3/5" },
  { id: "tree-5", width: "w-2/5" },
];

const CODE_SKELETON = [
  { id: "code-1", width: "w-1/3" },
  { id: "code-2", width: "w-2/3" },
  { id: "code-3", width: "w-1/2" },
  { id: "code-4", width: "w-3/4" },
];

function CodePanelEmpty({ error }: { error: unknown }) {
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

function CodePanelSkeleton() {
  return (
    <div aria-busy="true" className="flex min-h-0 flex-1">
      <span className="sr-only">Loading code</span>
      <div className="w-60 space-y-2 border-r p-3 max-md:hidden">
        {TREE_SKELETON.map(({ id, width }) => (
          <Skeleton key={id} className={cn("h-3.5", width)} />
        ))}
      </div>
      <div className="flex-1 space-y-2 p-4">
        {CODE_SKELETON.map(({ id, width }) => (
          <Skeleton key={id} className={cn("h-3", width)} />
        ))}
      </div>
    </div>
  );
}

function CodeWorkspace({
  files,
  isBusy,
  onSaveFile,
}: {
  files: ChatFile[];
  isBusy: boolean;
  onSaveFile: (path: string, content: string) => Promise<boolean>;
}) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isTreeVisible, setIsTreeVisible] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useWindowEvent(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    },
    { enabled: isFullscreen },
  );

  const selected =
    files.find((file) => file.path === selectedPath) ??
    files.find((file) => /(^|\/)page\.tsx$/.test(file.path)) ??
    files[0];

  const openTree = () => {
    setIsTreeVisible(true);
    setIsDrawerOpen(true);
  };
  const closeTree = () => {
    setIsTreeVisible(false);
    setIsDrawerOpen(false);
  };
  const selectFile = (path: string) => {
    setSelectedPath(path);
    setIsDrawerOpen(false);
  };

  return (
    <div
      className={cn(
        "@container/code relative flex min-h-0 flex-1 bg-background",
        isFullscreen && "fixed inset-0 z-50",
      )}
    >
      <FileTree
        files={files}
        selectedPath={selected?.path ?? null}
        onSelect={selectFile}
        onClose={closeTree}
        className={cn(
          "bg-background",
          !isTreeVisible && "@2xl/code:hidden",
          "@max-2xl/code:absolute @max-2xl/code:inset-y-0 @max-2xl/code:left-0 @max-2xl/code:z-20 @max-2xl/code:w-64 @max-2xl/code:max-w-[85%] @max-2xl/code:shadow-lg",
          !isDrawerOpen && "@max-2xl/code:hidden",
        )}
      />
      {isDrawerOpen && (
        <button
          type="button"
          aria-label="Close files"
          onClick={() => setIsDrawerOpen(false)}
          className="fade-in absolute inset-0 z-10 @2xl/code:hidden animate-in bg-background/60"
        />
      )}
      {selected && (
        <CodeViewer
          key={selected.path}
          file={selected}
          isBusy={isBusy}
          isFullscreen={isFullscreen}
          treeToggleClassName={cn(
            isTreeVisible && "@2xl/code:hidden",
            isDrawerOpen && "@max-2xl/code:hidden",
          )}
          onOpenTree={openTree}
          onToggleFullscreen={() => setIsFullscreen((value) => !value)}
          onSave={(content) => onSaveFile(selected.path, content)}
        />
      )}
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

  const saveFile = async (path: string, content: string) => {
    try {
      await updateFiles(chatId, [{ path, content }]);
      await mutate();
      toast.success("Saved", { description: path });
      onSaved();
      return true;
    } catch (saveError) {
      toast.error(describeChatError(saveError).message);
      return false;
    }
  };

  if (isLoading && !data) {
    return <CodePanelSkeleton />;
  }

  const files = data?.files ?? [];
  if (error || files.length === 0) {
    return <CodePanelEmpty error={error} />;
  }

  return <CodeWorkspace files={files} isBusy={isBusy} onSaveFile={saveFile} />;
}
