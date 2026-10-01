"use client";

import {
  Add01Icon,
  FileZipIcon,
  Folder01Icon,
  GithubIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { PromptInputButton } from "@/components/ai-elements/prompt-input/prompt-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";
import { MAX_TOTAL_ATTACHMENT_URL_LENGTH } from "@/lib/v0-models";
import {
  type ImportSource,
  importChat,
  USER_CHATS_CACHE_KEY,
} from "../lib/chat-api";
import { describeChatError } from "../lib/chat-errors";

const MAX_IMPORT_FILE_BYTES = 1024 * 1024;
const SKIPPED_FOLDERS = /(^|\/)(node_modules|\.git|\.next|dist|build)\//;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImportMenu({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { requireV0ApiKey, openKeyModal } = useV0ApiKeyModal();
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isRepoDialogOpen, setIsRepoDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const runImport = async (
    label: string,
    getSource: () => Promise<ImportSource | null>,
  ): Promise<boolean> => {
    if (isImporting || !(await requireV0ApiKey())) {
      return false;
    }
    setIsImporting(true);
    const toastId = toast.loading(`Importing ${label}…`);

    const chatId = await getSource()
      .then((source) => (source ? importChat(source) : null))
      .catch((error: unknown): undefined => {
        const info = describeChatError(error);
        if (info.needsApiKey) {
          openKeyModal();
        }
        toast.error("Import failed", {
          id: toastId,
          description: info.message,
        });
        return undefined;
      });
    setIsImporting(false);

    if (chatId === null) {
      toast.dismiss(toastId);
    }
    if (!chatId) {
      return false;
    }
    toast.success("Imported", {
      id: toastId,
      description: "Opening your new chat…",
    });
    mutate(USER_CHATS_CACHE_KEY);
    router.push(`/chats/${encodeURIComponent(chatId)}`);
    return true;
  };

  const importZip = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    runImport(file.name, async () => {
      const url = await readAsDataUrl(file);
      if (url.length > MAX_TOTAL_ATTACHMENT_URL_LENGTH) {
        throw new Error(
          "That ZIP is too large. Try importing from GitHub instead.",
        );
      }
      return { kind: "zip", url, title: file.name.replace(/\.zip$/i, "") };
    });
  };

  const importFolder = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) {
      return;
    }
    runImport(`${picked.length} files`, async () => {
      const files = picked.filter(
        (file) =>
          file.size <= MAX_IMPORT_FILE_BYTES &&
          !SKIPPED_FOLDERS.test(file.webkitRelativePath || file.name),
      );
      if (files.length === 0) {
        throw new Error("No importable text files found.");
      }
      return {
        kind: "files",
        files: await Promise.all(
          files.map(async (file) => ({
            name: (file.webkitRelativePath || file.name).replace(
              /^[^/]+\//,
              "",
            ),
            content: await file.text(),
          })),
        ),
      };
    });
  };

  const importRepo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const url = String(form.get("url") ?? "").trim();
    const branch = String(form.get("branch") ?? "").trim();
    const imported = await runImport("repository", async () => ({
      kind: "repo",
      url,
      ...(branch && { branch }),
    }));
    if (imported) {
      setIsRepoDialogOpen(false);
    }
  };

  return (
    <>
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={importZip}
        aria-label="Import ZIP"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={importFolder}
        aria-label="Import folder"
        {...{ webkitdirectory: "" }}
      />

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <PromptInputButton
                aria-label="Start from existing code"
                disabled={disabled || isImporting}
              >
                {isImporting ? (
                  <Spinner />
                ) : (
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                )}
              </PromptInputButton>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Start from existing code</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Import</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsRepoDialogOpen(true)}>
            <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />
            GitHub repository
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => zipInputRef.current?.click()}>
            <HugeiconsIcon icon={FileZipIcon} strokeWidth={2} />
            ZIP file
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => folderInputRef.current?.click()}>
            <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
            Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRepoDialogOpen} onOpenChange={setIsRepoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={importRepo} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Import a GitHub repository</DialogTitle>
              <DialogDescription>
                Public repositories, or private ones connected to your Vercel
                account.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="import-repo-url">
                  Repository URL
                </FieldLabel>
                <Input
                  id="import-repo-url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://github.com/vercel/next.js"
                  disabled={isImporting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="import-repo-branch">Branch</FieldLabel>
                <Input
                  id="import-repo-branch"
                  name="branch"
                  placeholder="main"
                  disabled={isImporting}
                />
                <FieldDescription>
                  Leave empty for the default branch.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" disabled={isImporting}>
                {isImporting && <Spinner data-icon="inline-start" />}
                {isImporting ? "Importing…" : "Import"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
