"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { isChatPrivacy, PRIVACY_OPTIONS } from "../../lib/chat-privacy";
import type { ChatPrivacy } from "../../types";
import { ChatDialog, type ChatDialogStateProps } from "./chat-dialog";

interface VisibilityDialogProps extends ChatDialogStateProps {
  privacy: ChatPrivacy;
  onPrivacyChange: (privacy: ChatPrivacy) => void;
  onConfirm: () => void;
}

export function VisibilityDialog({
  privacy,
  onPrivacyChange,
  onConfirm,
  ...dialogProps
}: VisibilityDialogProps) {
  return (
    <ChatDialog
      {...dialogProps}
      title="Chat visibility"
      description="Choose who can see and access this chat."
      confirmLabel="Save"
      pendingLabel="Saving..."
      onConfirm={onConfirm}
    >
      <RadioGroup
        value={privacy}
        onValueChange={(value) => {
          if (isChatPrivacy(value)) {
            onPrivacyChange(value);
          }
        }}
        aria-label="Chat visibility"
        className="gap-2"
        disabled={dialogProps.isPending}
      >
        {PRIVACY_OPTIONS.map((option) => {
          const id = `privacy-${option.value}`;
          return (
            <FieldLabel key={option.value} htmlFor={id}>
              <Field orientation="horizontal">
                <HugeiconsIcon
                  icon={option.icon}
                  strokeWidth={2}
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <FieldContent>
                  <FieldTitle>{option.label}</FieldTitle>
                  <FieldDescription>{option.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={option.value} id={id} />
              </Field>
            </FieldLabel>
          );
        })}
      </RadioGroup>
    </ChatDialog>
  );
}
