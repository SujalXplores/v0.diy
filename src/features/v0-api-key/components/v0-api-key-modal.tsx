"use client";

import {
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  ClipboardIcon,
  Key01Icon,
  SquareLock02Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { V0_KEYS_URL } from "@/lib/links";
import { useV0ApiKeyForm } from "../hooks/use-v0-api-key-form";

interface V0ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  onRemoved: () => void;
}

type ApiKeyForm = ReturnType<typeof useV0ApiKeyForm>;

function ConnectedKey({
  form,
  onRemoved,
}: {
  form: ApiKeyForm;
  onRemoved: () => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleRemove = async () => {
    if (await form.remove()) {
      setIsConfirming(false);
      onRemoved();
    }
  };

  return (
    <Item variant="outline" size="sm">
      <ItemMedia variant="icon">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {isConfirming ? "Remove your key?" : "Key connected"}
        </ItemTitle>
        <ItemDescription>
          {isConfirming
            ? "Generating will stop until you add a new one."
            : form.lastUpdatedAt &&
              `Updated ${formatRelativeTime(form.lastUpdatedAt)}`}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {isConfirming ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirming(false)}
              disabled={form.isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={form.isDeleting}
            >
              {form.isDeleting && <Spinner data-icon="inline-start" />}
              Remove
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsConfirming(true)}
            disabled={form.isSaving}
          >
            Remove
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}

export function V0ApiKeyModal({
  open,
  onOpenChange,
  onSaved,
  onRemoved,
}: V0ApiKeyModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
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
      setIsKeyVisible(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.canSave) {
      form.save();
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setApiKey(text.trim());
    } catch {
      // Clipboard access was denied; the field is still there to paste into.
    }
    inputRef.current?.focus();
  };

  const hasError = Boolean(form.error);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Key01Icon} strokeWidth={2} />
              v0 API key
            </DialogTitle>
            <DialogDescription>
              v0.diy generates apps with your own v0 account, so usage and
              billing stay with you.
            </DialogDescription>
          </DialogHeader>

          {form.hasExistingKey && (
            <ConnectedKey form={form} onRemoved={onRemoved} />
          )}

          <Field data-invalid={hasError || undefined}>
            <FieldLabel htmlFor="v0-api-key">
              {form.hasExistingKey ? "Replace with a new key" : "API key"}
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                ref={inputRef}
                id="v0-api-key"
                type={isKeyVisible ? "text" : "password"}
                value={form.apiKey}
                onChange={(event) => form.setApiKey(event.target.value)}
                placeholder="Paste your key"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={hasError}
                aria-describedby="v0-api-key-help"
                autoFocus
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setIsKeyVisible((visible) => !visible)}
                      aria-label={isKeyVisible ? "Hide key" : "Show key"}
                      aria-pressed={isKeyVisible}
                    >
                      <HugeiconsIcon
                        icon={isKeyVisible ? ViewOffIcon : ViewIcon}
                        strokeWidth={2}
                      />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isKeyVisible ? "Hide key" : "Show key"}
                  </TooltipContent>
                </Tooltip>
                <InputGroupButton onClick={pasteFromClipboard}>
                  <HugeiconsIcon icon={ClipboardIcon} strokeWidth={2} />
                  Paste
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {hasError ? (
              <FieldError>{form.error}</FieldError>
            ) : (
              <FieldDescription id="v0-api-key-help">
                Create one in{" "}
                <a href={V0_KEYS_URL} target="_blank" rel="noopener noreferrer">
                  v0 settings
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    strokeWidth={2}
                    className="ml-0.5 inline size-3 align-[-1px]"
                  />
                </a>
                . We check it with v0 before saving.
              </FieldDescription>
            )}
          </Field>

          <DialogFooter className="items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <HugeiconsIcon
                icon={SquareLock02Icon}
                strokeWidth={2}
                className="size-3.5"
              />
              Encrypted at rest, never shown again
            </p>
            <div className="flex gap-2 max-sm:w-full max-sm:*:flex-1">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!form.canSave}>
                {form.isSaving && <Spinner data-icon="inline-start" />}
                {form.isSaving ? "Checking..." : "Save key"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
