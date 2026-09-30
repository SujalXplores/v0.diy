"use client";

import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { useSearchParamFlag } from "@/hooks/use-search-param-flag";
import { useNewChat } from "../hooks/use-new-chat";
import { RESET_PARAM } from "../lib/reset-param";
import { ChatWorkspace } from "./chat-workspace";
import { NewChatHero } from "./new-chat-hero";

/** Resets the homepage when the header logo links to `/?reset=true`. */
function ResetListener({ onReset }: { onReset: () => void }) {
  useSearchParamFlag(RESET_PARAM.name, RESET_PARAM.value, onReset);
  return null;
}

export function NewChatView() {
  const {
    composer,
    conversation,
    preview,
    hasStarted,
    submit,
    handleChatData,
    handleStreamingComplete,
    reset,
  } = useNewChat();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
      <Suspense fallback={null}>
        <ResetListener onReset={reset} />
      </Suspense>

      <AppHeader />

      {hasStarted ? (
        <ChatWorkspace
          conversation={conversation}
          composer={composer}
          preview={preview}
          onSubmit={submit}
          onStreamingComplete={handleStreamingComplete}
          onChatData={handleChatData}
        />
      ) : (
        <NewChatHero
          composer={composer}
          isLoading={conversation.isLoading}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
