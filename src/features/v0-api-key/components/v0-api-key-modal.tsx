"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useV0ApiKeyForm } from "../hooks/use-v0-api-key-form";

const V0_KEYS_URL = "https://v0.app/chat/settings/keys";

interface V0ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function V0ApiKeyModal({
  open,
  onOpenChange,
  onSaved,
}: V0ApiKeyModalProps) {
  const form = useV0ApiKeyForm({
    isOpen: open,
    onSaved: () => {
      onOpenChange(false);
      onSaved();
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your v0 API key</DialogTitle>
          <DialogDescription>
            This app uses bring your own key. Get your key from{" "}
            <a
              href={V0_KEYS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              v0.app/chat/settings/keys
            </a>{" "}
            and paste it below to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            type="password"
            value={form.apiKey}
            onChange={(event) => form.setApiKey(event.target.value)}
            placeholder="v0_..."
            aria-label="v0 API key"
            autoFocus
          />

          {form.error && (
            <p className="text-destructive text-sm">{form.error}</p>
          )}

          {form.hasExistingKey && (
            <p className="text-muted-foreground text-xs">
              A key is already saved for your account.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          {form.hasExistingKey && (
            <Button
              type="button"
              variant="outline"
              onClick={form.remove}
              disabled={form.isDeleting || form.isSaving}
            >
              {form.isDeleting ? "Removing..." : "Remove Key"}
            </Button>
          )}

          <Button type="button" onClick={form.save} disabled={!form.canSave}>
            {form.isSaving ? "Saving..." : "Save Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
