"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ChatDialogStateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
}

interface ChatDialogProps extends ChatDialogStateProps {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  destructive?: boolean;
  children?: ReactNode;
}

/** Shared layout of the chat action dialogs: text, optional body, buttons. */
export function ChatDialog({
  open,
  onOpenChange,
  isPending,
  title,
  description,
  confirmLabel,
  pendingLabel,
  onConfirm,
  confirmDisabled = false,
  destructive = false,
  children,
}: ChatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending || confirmDisabled}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
