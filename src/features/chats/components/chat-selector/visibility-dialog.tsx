"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPrivacyOption,
  isChatPrivacy,
  PRIVACY_OPTIONS,
  type PrivacyOption,
} from "../../lib/chat-privacy";
import type { ChatPrivacy } from "../../types";
import { ChatDialog, type ChatDialogStateProps } from "./chat-dialog";

interface VisibilityDialogProps extends ChatDialogStateProps {
  privacy: ChatPrivacy;
  onPrivacyChange: (privacy: ChatPrivacy) => void;
  onConfirm: () => void;
}

function PrivacyOptionLabel({
  option,
  showDescription,
}: {
  option: PrivacyOption;
  showDescription: boolean;
}) {
  const Icon = option.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      {showDescription ? (
        <div>
          <div>{option.label}</div>
          <div className="text-muted-foreground text-xs">
            {option.description}
          </div>
        </div>
      ) : (
        <span>{option.label}</span>
      )}
    </div>
  );
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
      title="Change Chat Visibility"
      description="Choose who can see and access this chat."
      confirmLabel="Change Visibility"
      pendingLabel="Changing..."
      onConfirm={onConfirm}
    >
      <Select
        value={privacy}
        onValueChange={(value) => {
          if (isChatPrivacy(value)) {
            onPrivacyChange(value);
          }
        }}
      >
        <SelectTrigger aria-label="Chat visibility">
          <SelectValue>
            <PrivacyOptionLabel
              option={getPrivacyOption(privacy)}
              showDescription={false}
            />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PRIVACY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <PrivacyOptionLabel option={option} showDescription />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ChatDialog>
  );
}
