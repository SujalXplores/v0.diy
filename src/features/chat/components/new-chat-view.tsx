"use client";

import { AppHeader } from "@/components/layout/app-header";
import { useModelSettings } from "../hooks/use-model-settings";
import { useNewChat } from "../hooks/use-new-chat";
import { usePromptComposer } from "../hooks/use-prompt-composer";
import { NewChatHero } from "./new-chat-hero";

const NEW_CHAT_DRAFT_SCOPE = "new-chat";

export function NewChatView() {
  const composer = usePromptComposer(NEW_CHAT_DRAFT_SCOPE);
  const { settings, update } = useModelSettings();
  const newChat = useNewChat({
    onPromptRejected: (prompt) =>
      composer.restore(prompt.text, prompt.attachments),
  });

  const pendingPrompt =
    newChat.messages
      .findLast((message) => message.role === "user")
      ?.parts.find((part) => part.type === "text")?.text ?? null;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <NewChatHero
        composer={composer}
        modelSettings={settings}
        onModelSettingsChange={update}
        isCreating={newChat.isCreating}
        pendingPrompt={pendingPrompt}
        error={newChat.error}
        onDismissError={newChat.dismissError}
        onSubmit={(prompt) => newChat.create(prompt, settings)}
      />
    </div>
  );
}
