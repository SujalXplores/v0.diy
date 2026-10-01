"use client";

import { Field, FieldLabel } from "@/components/ui/field";
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
      title="Rename chat"
      description="Give this chat a name you'll recognize later."
      confirmLabel="Save"
      pendingLabel="Saving..."
      onConfirm={onConfirm}
      confirmDisabled={!name.trim()}
    >
      <Field>
        <FieldLabel htmlFor="chat-name">Name</FieldLabel>
        <Input
          id="chat-name"
          placeholder="My landing page"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && name.trim()) {
              onConfirm();
            }
          }}
          disabled={dialogProps.isPending}
        />
      </Field>
    </ChatDialog>
  );
}
