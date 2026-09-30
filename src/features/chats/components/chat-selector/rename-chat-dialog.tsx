"use client";

import { Input } from "@/components/ui/input";
import { ChatDialog, type ChatDialogStateProps } from "./chat-dialog";

interface RenameChatDialogProps extends ChatDialogStateProps {
  name: string;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
}

export function RenameChatDialog({
  name,
  onNameChange,
  onConfirm,
  ...dialogProps
}: RenameChatDialogProps) {
  return (
    <ChatDialog
      {...dialogProps}
      title="Rename Chat"
      description="Enter a new name for this chat."
      confirmLabel="Rename Chat"
      pendingLabel="Renaming..."
      onConfirm={onConfirm}
      confirmDisabled={!name.trim()}
    >
      <Input
        placeholder="Chat name"
        aria-label="Chat name"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onConfirm();
          }
        }}
        disabled={dialogProps.isPending}
      />
    </ChatDialog>
  );
}
