"use client";

import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { useWindowEvent } from "@/hooks/use-window-event";
import { cn } from "@/lib/utils";

interface SearchFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function SearchField({
  value,
  onValueChange,
  placeholder,
  className,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useWindowEvent("keydown", (event) => {
    if (
      event.key === "/" &&
      !event.metaKey &&
      !event.ctrlKey &&
      !isTypingTarget(event.target)
    ) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  });

  const clear = () => {
    onValueChange("");
    inputRef.current?.focus();
  };

  return (
    <InputGroup className={cn("max-w-sm", className)}>
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        role="searchbox"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (value) {
              onValueChange("");
            } else {
              event.currentTarget.blur();
            }
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        {value ? (
          <InputGroupButton
            size="icon-xs"
            onClick={clear}
            aria-label="Clear search"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </InputGroupButton>
        ) : (
          <Kbd className="max-sm:hidden">/</Kbd>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
