"use client";

import {
  Copy,
  Edit2,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
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

/** "More" menu for the open chat and the dialogs its items open. */
export function ChatActionsMenu({ chat }: ChatActionsMenuProps) {
  const actions = useChatActions(chat);
  const { openDialog, setOpenDialog, pendingAction } = actions;
  const isBusy = pendingAction !== null;
  const PrivacyIcon = getPrivacyOption(chat.privacy).icon;

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
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isBusy}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Chat options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a
              href={getV0ChatUrl(chat.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on v0.app
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenDialog("duplicate")}
            disabled={isBusy}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Chat
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={actions.openVisibilityDialog}
            disabled={isBusy}
          >
            <PrivacyIcon className="mr-2 h-4 w-4" />
            Change Visibility
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={actions.openRenameDialog}
            disabled={isBusy}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Rename Chat
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenDialog("delete")}
            disabled={isBusy}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameChatDialog
        {...dialogProps("rename")}
        name={actions.newName}
        onNameChange={actions.setNewName}
        onConfirm={actions.rename}
      />

      <ChatDialog
        {...dialogProps("delete")}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone and will permanently remove the chat and all its messages."
        confirmLabel="Delete Chat"
        pendingLabel="Deleting..."
        destructive
        onConfirm={actions.remove}
      />

      <ChatDialog
        {...dialogProps("duplicate")}
        title="Duplicate Chat"
        description="This will create a copy of the current chat. You'll be redirected to the new chat once it's created."
        confirmLabel="Duplicate Chat"
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
