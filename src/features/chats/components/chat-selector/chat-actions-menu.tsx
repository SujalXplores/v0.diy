"use client";

import {
  ArrowUpRight01Icon,
  Copy01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatActions } from "../../hooks/use-chat-actions";
import { getV0ChatUrl } from "../../lib/chat-display";
import { getPrivacyOption } from "../../lib/chat-privacy";
import type { ChatSummary } from "../../types";
import { ChatDialog } from "./chat-dialog";
import { RenameChatDialog } from "./rename-chat-dialog";
import { VisibilityDialog } from "./visibility-dialog";

interface ChatActionsMenuProps {
  chat: ChatSummary;
}

export function ChatActionsMenu({ chat }: ChatActionsMenuProps) {
  const actions = useChatActions(chat);
  const { openDialog, setOpenDialog, pendingAction } = actions;
  const isBusy = pendingAction !== null;
  const privacyIcon = getPrivacyOption(chat.privacy).icon;

  const dialogProps = (dialog: typeof openDialog) => ({
    open: openDialog === dialog,
    onOpenChange: (open: boolean) => setOpenDialog(open ? dialog : null),
    isPending: pendingAction === dialog,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isBusy}
            aria-label="Chat options"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={actions.openRenameDialog}>
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("duplicate")}>
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={actions.openVisibilityDialog}>
            <HugeiconsIcon icon={privacyIcon} strokeWidth={2} />
            Change visibility
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={getV0ChatUrl(chat.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
              Open in v0.app
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenDialog("delete")}
            variant="destructive"
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameChatDialog
        {...dialogProps("rename")}
        name={actions.newName}
        onNameChange={actions.setNewName}
        onConfirm={actions.rename}
      />

      <ConfirmDialog
        {...dialogProps("delete")}
        icon={Delete02Icon}
        title="Delete this chat?"
        description="This permanently removes the chat, its messages and its preview. This can't be undone."
        confirmLabel="Delete chat"
        pendingLabel="Deleting..."
        destructive
        onConfirm={actions.remove}
      />

      <ChatDialog
        {...dialogProps("duplicate")}
        title="Duplicate chat"
        description="We'll create a copy of this chat and take you to it once it's ready."
        confirmLabel="Duplicate"
        pendingLabel="Duplicating..."
        onConfirm={actions.duplicate}
      />

      <VisibilityDialog
        {...dialogProps("visibility")}
        privacy={actions.selectedPrivacy}
        onPrivacyChange={actions.setSelectedPrivacy}
        onConfirm={actions.changeVisibility}
      />
    </>
  );
}
