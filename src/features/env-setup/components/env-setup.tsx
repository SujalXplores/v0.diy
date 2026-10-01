"use client";

import {
  Copy01Icon,
  Settings01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { RequiredEnvVar } from "../lib/env-check";

interface EnvSetupProps {
  envVars: RequiredEnvVar[];
  envFileContent: string;
}

const STEPS = [
  "Copy the snippet below",
  "Paste it into .env in the project root and fill in the values",
  "Restart the dev server",
];

export function EnvSetup({ envVars, envFileContent }: EnvSetupProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="mask-radial-fade pointer-events-none absolute inset-0 bg-dot-grid" />

      <div className="relative w-full max-w-lg space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex w-fit items-center gap-2">
            <LogoMark className="size-8 text-[0.6875rem]" />
            <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
            </span>
          </div>
          <h1 className="font-semibold text-2xl tracking-tight">
            Finish setting up v0.diy
          </h1>
          <p className="text-muted-foreground text-sm">
            {envVars.length === 1
              ? "One environment variable is missing."
              : `${envVars.length} environment variables are missing.`}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
          <ol className="space-y-2 border-b p-4">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-xs">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-medium font-mono text-[0.625rem] text-muted-foreground">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-1.5">
            <span className="font-mono text-muted-foreground text-xs">
              .env
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(envFileContent)}
              aria-label="Copy environment variables"
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs/relaxed">
            {envFileContent}
          </pre>

          <dl className="space-y-3 border-t p-4">
            {envVars.map((envVar) => (
              <div key={envVar.name} className="space-y-0.5">
                <dt>
                  <code className="font-medium font-mono text-xs">
                    {envVar.name}
                  </code>
                </dt>
                <dd className="text-muted-foreground text-xs">
                  {envVar.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-center text-muted-foreground text-xs">
          This screen only appears in development.
        </p>
      </div>
    </div>
  );
}
