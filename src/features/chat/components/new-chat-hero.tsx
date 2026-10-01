"use client";

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import type { SentPrompt } from "../hooks/use-chat-session";
import type { ModelSettings } from "../hooks/use-model-settings";
import type { PromptComposerState } from "../hooks/use-prompt-composer";
import { ImportMenu } from "./import-menu";
import { PromptComposer } from "./prompt-composer";
import { PromptSuggestions } from "./prompt-suggestions";

interface NewChatHeroProps {
  composer: PromptComposerState;
  modelSettings: ModelSettings;
  onModelSettingsChange: (patch: Partial<ModelSettings>) => void;
  isCreating: boolean;
  pendingPrompt: string | null;
  error: string | null;
  onDismissError: () => void;
  onSubmit: (prompt: SentPrompt) => Promise<boolean>;
}

export function NewChatHero({
  composer,
  modelSettings,
  onModelSettingsChange,
  isCreating,
  pendingPrompt,
  error,
  onDismissError,
  onSubmit,
}: NewChatHeroProps) {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="mask-radial-fade pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-dot-grid opacity-70" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Badge variant="outline" asChild>
              <Link
                href="https://v0.app/docs/api/v2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Built on the v0 Platform API
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  strokeWidth={2}
                  data-icon="inline-end"
                />
              </Link>
            </Badge>
            <h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-5xl">
              What do you want to build?
            </h1>
            <p className="max-w-md text-balance text-muted-foreground text-sm sm:text-base">
              Describe an app, page or component, or start from a GitHub repo.
              v0 writes the code and you see it running instantly.
            </p>
          </div>

          {isCreating && pendingPrompt ? (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
              <Spinner className="size-5" />
              <p className="font-medium text-sm">Starting your chat…</p>
              <p className="line-clamp-2 max-w-md text-muted-foreground text-xs">
                {pendingPrompt}
              </p>
            </div>
          ) : (
            <>
              <PromptComposer
                composer={composer}
                modelSettings={modelSettings}
                onModelSettingsChange={onModelSettingsChange}
                onSubmit={onSubmit}
                isBusy={isCreating}
                placeholder="Ask v0 to build a dashboard for tracking habits…"
                leadingTools={<ImportMenu disabled={isCreating} />}
                autoFocus
                className="shadow-foreground/5 shadow-lg"
                textareaClassName="min-h-24"
              />

              <p className="mt-2.5 hidden items-center justify-end gap-1.5 text-muted-foreground text-xs sm:flex">
                <Kbd>Enter</Kbd> to send
                <span aria-hidden="true">·</span>
                <Kbd>Shift</Kbd>
                <span aria-hidden="true">+</span>
                <Kbd>Enter</Kbd> for a new line
              </p>
            </>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
              <AlertAction>
                <Button size="sm" variant="ghost" onClick={onDismissError}>
                  Dismiss
                </Button>
              </AlertAction>
            </Alert>
          )}

          {!isCreating && (
            <div className="mt-8">
              <PromptSuggestions
                onSelect={(text) =>
                  onSubmit({ text, attachments: [] }).then((sent) => {
                    if (!sent) {
                      composer.setMessage(text);
                    }
                  })
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
