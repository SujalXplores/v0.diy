"use client";

import { ArrowDown01Icon, Image02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isV0ModelId, V0_MODELS } from "@/lib/v0-models";
import type { ModelSettings } from "../hooks/use-model-settings";

const ACCOUNT_DEFAULT = "default";

interface ModelPickerProps {
  settings: ModelSettings;
  onChange: (patch: Partial<ModelSettings>) => void;
  disabled?: boolean;
}

export function ModelPicker({
  settings,
  onChange,
  disabled,
}: ModelPickerProps) {
  const current = V0_MODELS.find((model) => model.id === settings.modelId);
  const label = current?.label ?? "Default model";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={`Model: ${label}`}
          className="text-muted-foreground"
        >
          {settings.imageGenerations && (
            <HugeiconsIcon
              icon={Image02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          )}
          {label}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            data-icon="inline-end"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Model</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={settings.modelId ?? ACCOUNT_DEFAULT}
          onValueChange={(value) =>
            onChange({ modelId: isV0ModelId(value) ? value : null })
          }
        >
          <DropdownMenuRadioItem value={ACCOUNT_DEFAULT}>
            <span className="grid">
              <span className="font-medium">Default model</span>
              <span className="text-muted-foreground">
                Whatever your v0 plan uses by default
              </span>
            </span>
          </DropdownMenuRadioItem>
          {V0_MODELS.map((model) => (
            <DropdownMenuRadioItem key={model.id} value={model.id}>
              <span className="grid">
                <span className="font-medium">{model.label}</span>
                <span className="text-muted-foreground">
                  {model.description}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <p className="px-2 pt-1 pb-1.5 text-[0.6875rem] text-muted-foreground">
          Some models need a paid v0 plan. v0 rejects the prompt if yours
          doesn't include the one you pick.
        </p>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={settings.imageGenerations}
          disabled={settings.modelId === null}
          onCheckedChange={(checked) => onChange({ imageGenerations: checked })}
        >
          <span className="grid">
            <span className="font-medium">Generate images</span>
            <span className="text-muted-foreground">
              {settings.modelId === null
                ? "Pick a model to turn this on"
                : "Let v0 create up to 5 images per version"}
            </span>
          </span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
