"use client";

import { useEffect, useState } from "react";
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

interface V0ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function V0ApiKeyModal({
  open,
  onOpenChange,
  onSaved,
}: V0ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }

    const loadStatus = async () => {
      try {
        const response = await fetch("/api/user/v0-key", { method: "GET" });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setHasExistingKey(Boolean(data?.hasKey));
      } catch (loadError) {
        console.error("Failed to load v0 key status:", loadError);
      }
    };

    loadStatus();
  }, [open]);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/v0-key", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to save API key");
      }

      setApiKey("");
      setHasExistingKey(true);
      onOpenChange(false);
      onSaved?.();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save API key",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/v0-key", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to remove API key");
      }

      setHasExistingKey(false);
      setApiKey("");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to remove API key",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your v0 API key</DialogTitle>
          <DialogDescription>
            This app uses bring your own key. Get your key from{" "}
            <a
              href="https://v0.app/chat/settings/keys"
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
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="v0_..."
            autoFocus
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          {hasExistingKey && (
            <p className="text-muted-foreground text-xs">
              A key is already saved for your account.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          {hasExistingKey && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
            >
              {isDeleting ? "Removing..." : "Remove Key"}
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={!apiKey.trim() || isSaving || isDeleting}
          >
            {isSaving ? "Saving..." : "Save Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
