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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={`Model: ${current?.label ?? settings.modelId}`}
          className="text-muted-foreground"
        >
          {settings.imageGenerations && (
            <HugeiconsIcon
              icon={Image02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          )}
          {current?.label ?? settings.modelId}
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
          value={settings.modelId}
          onValueChange={(value) => {
            if (isV0ModelId(value)) {
              onChange({ modelId: value });
            }
          }}
        >
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
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={settings.imageGenerations}
          onCheckedChange={(checked) => onChange({ imageGenerations: checked })}
        >
          <span className="grid">
            <span className="font-medium">Generate images</span>
            <span className="text-muted-foreground">
              Let v0 create up to 5 images per version
            </span>
          </span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
