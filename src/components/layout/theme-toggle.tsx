"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ComponentProps, MouseEvent } from "react";
import { Button } from "@/components/ui/button";

type ThemeToggleProps = ComponentProps<typeof Button>;

export function ThemeToggle({ onClick, ...props }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // resolvedTheme accounts for "system", so the toggle always flips.
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    onClick?.(event);
  };

  return (
    <Button
      variant="ghost"
      type="button"
      size="icon"
      className="cursor-pointer px-2"
      onClick={handleClick}
      aria-label="Toggle theme"
      {...props}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200" />
      <Moon className="hidden h-[1.2rem] w-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200" />
    </Button>
  );
}
