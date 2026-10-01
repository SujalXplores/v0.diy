"use client";

import { useChat } from "@ai-sdk/react";
import { V0Transport, type V0UIMessage } from "@v0-sdk/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";
import { chatUrls, USER_CHATS_CACHE_KEY } from "../lib/chat-api";
import { describeChatError } from "../lib/chat-errors";
import { toFileParts } from "../lib/image-attachments";
import type { SentPrompt } from "./use-chat-session";
import type { ModelSettings } from "./use-model-settings";

const LOGIN_URL = "/login?callbackUrl=/";
const NEW_CHAT_ID = "new-chat";

interface UseNewChatOptions {
  onPromptRejected: (prompt: SentPrompt) => void;
}

export function useNewChat({ onPromptRejected }: UseNewChatOptions) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { mutate } = useSWRConfig();
  const { requireV0ApiKey, openKeyModal } = useV0ApiKeyModal();
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const inFlightRef = useRef(false);
  const pendingPromptRef = useRef<SentPrompt | null>(null);

  const transport = useMemo(
    () =>
      new V0Transport({
        urls: {
          create: chatUrls.create,
          send: chatUrls.messages,
          resume: chatUrls.resume,
        },
        onChatCreated: (chatId, { stop }) => {
          stop();
          setIsNavigating(true);
          mutate(USER_CHATS_CACHE_KEY);
          router.push(`/chats/${encodeURIComponent(chatId)}`);
        },
      }),
    [router, mutate],
  );

  const chat = useChat<V0UIMessage>({
    id: NEW_CHAT_ID,
    transport,
    onError: (streamError) => {
      const info = describeChatError(streamError);
      chat.setMessages([]);
      if (pendingPromptRef.current) {
        onPromptRejected(pendingPromptRef.current);
      }
      if (info.needsApiKey) {
        openKeyModal();
      }
      setError(info.message);
    },
  });

  const isCreating =
    chat.status === "submitted" || chat.status === "streaming" || isNavigating;

  async function create(
    prompt: SentPrompt,
    modelSettings: ModelSettings,
  ): Promise<boolean> {
    if (inFlightRef.current || isCreating || !prompt.text.trim()) {
      return false;
    }
    if (sessionStatus === "loading") {
      return false;
    }
    if (sessionStatus !== "authenticated") {
      router.push(LOGIN_URL);
      return false;
    }

    inFlightRef.current = true;
    const sendPrompt = async () => {
      if (!(await requireV0ApiKey())) {
        return false;
      }
      setError(null);
      chat.clearError();
      pendingPromptRef.current = prompt;

      await chat.sendMessage(
        {
          text: prompt.text,
          ...(prompt.attachments.length > 0 && {
            files: toFileParts(prompt.attachments),
          }),
        },
        {
          body: {
            modelConfiguration: {
              modelId: modelSettings.modelId,
              imageGenerations: modelSettings.imageGenerations,
            },
          },
        },
      );
      return true;
    };

    const sent = await sendPrompt().catch(() => false);
    inFlightRef.current = false;
    return sent;
  }

  return {
    messages: chat.messages,
    isCreating,
    error,
    dismissError: () => setError(null),
    create,
  };
}
