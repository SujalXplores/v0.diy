"use client";

import Link from "next/link";
import type { PromptComposer as PromptComposerState } from "../hooks/use-prompt-composer";
import { PromptComposer } from "./prompt-composer";
import { PromptSuggestions } from "./prompt-suggestions";

interface NewChatHeroProps {
  composer: PromptComposerState;
  isLoading: boolean;
  onSubmit: (text?: string) => void;
}

/** The empty homepage: headline, prompt input and suggestions. */
export function NewChatHero({
  composer,
  isLoading,
  onSubmit,
}: NewChatHeroProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
            What can we build together?
          </h2>
        </div>

        <div className="mx-auto max-w-2xl">
          <PromptComposer
            composer={composer}
            onSubmit={() => onSubmit()}
            isLoading={isLoading}
            placeholder="Describe what you want to build..."
            lockWhileLoading
            className="relative w-full"
            textareaClassName="min-h-20 text-base"
          />
        </div>

        <div className="mx-auto mt-4 max-w-2xl">
          <PromptSuggestions onSelect={onSubmit} />
        </div>

        <div className="mt-16 text-center text-muted-foreground text-sm">
          <p>
            Powered by{" "}
            <Link
              href="https://v0-sdk.dev"
              className="text-foreground hover:underline"
            >
              v0 SDK
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
