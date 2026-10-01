"use client";

import { useChat } from "@ai-sdk/react";
import {
  type Message,
  type MessagesResolveStreamData,
  prependV0UIMessageHistory,
  toV0UIMessages,
  V0Transport,
  type V0UIMessage,
} from "@v0-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";
import {
  chatUrls,
  fetchMessagesPage,
  restoreMessage,
  stopMessage,
  USER_CHATS_CACHE_KEY,
} from "../lib/chat-api";
import { describeChatError } from "../lib/chat-errors";
import { type ImageAttachment, toFileParts } from "../lib/image-attachments";
import {
  consumeV0Response,
  findActiveAssistant,
  mayBeGenerating,
  upsertMessage,
} from "../lib/v0-messages";
import type { ModelSettings } from "./use-model-settings";

export type ResolveTask = MessagesResolveStreamData["body"]["task"];

export interface SentPrompt {
  text: string;
  attachments: ImageAttachment[];
}

export interface ChatSessionError {
  message: string;
  canResume: boolean;
}

interface UseChatSessionOptions {
  chatId: string;
  initialMessages: Message[];
  initialCursor: string | null;
  onContentChange: () => void;
  onPromptRejected: (prompt: SentPrompt) => void;
}

const SYNC_LIMIT = 100;
const STOP_MESSAGE = "Do not run this action. Continue without it.";

type ExternalStream = "resume" | "resolve";

function createdTime(message: V0UIMessage): number {
  const createdAt = message.metadata?.createdAt;
  return createdAt ? new Date(createdAt).getTime() : Number.NaN;
}

export function useChatSession({
  chatId,
  initialMessages,
  initialCursor,
  onContentChange,
  onPromptRejected,
}: UseChatSessionOptions) {
  const { mutate } = useSWRConfig();
  const { requireV0ApiKey, openKeyModal } = useV0ApiKeyModal();

  const transport = useMemo(
    () =>
      new V0Transport({
        chatId,
        urls: {
          create: chatUrls.create,
          send: chatUrls.messages,
          resume: chatUrls.resume,
        },
      }),
    [chatId],
  );
  const initialUiMessages = useMemo(
    () => toV0UIMessages(initialMessages),
    [initialMessages],
  );

  const [cursor, setCursor] = useState(initialCursor);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [externalStream, setExternalStream] = useState<ExternalStream | null>(
    null,
  );
  const [externalMessageId, setExternalMessageId] = useState<string | null>(
    null,
  );
  const [isStopping, setIsStopping] = useState(false);
  const [restoringMessageId, setRestoringMessageId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<ChatSessionError | null>(null);

  const inFlightRef = useRef(false);
  const pendingPromptRef = useRef<SentPrompt | null>(null);
  const externalAbortRef = useRef<AbortController | null>(null);

  const chat = useChat<V0UIMessage>({
    id: chatId,
    messages: initialUiMessages,
    transport,
    throttle: 50,
    onFinish: ({ isError }) => {
      if (!isError) {
        syncFromServer();
      }
    },
    onError: (streamError) => {
      const info = describeChatError(streamError);

      if (info.wasRejected) {
        chat.setMessages((current) =>
          current.at(-1)?.role === "user" ? current.slice(0, -1) : current,
        );
        if (pendingPromptRef.current) {
          onPromptRejected(pendingPromptRef.current);
        }
      }
      if (info.needsApiKey) {
        openKeyModal();
      }
      setError({ message: info.message, canResume: !info.wasRejected });
    },
  });

  const isSending = chat.status === "submitted" || chat.status === "streaming";
  const isBusy = isSending || externalStream !== null;
  const activeAssistant = externalMessageId
    ? chat.messages.find((message) => message.id === externalMessageId)
    : isBusy
      ? findActiveAssistant(chat.messages)
      : undefined;

  async function syncFromServer(): Promise<Message[] | null> {
    try {
      const page = await fetchMessagesPage(chatId, { limit: SYNC_LIMIT });
      const fresh = toV0UIMessages(page.messages);
      const oldestFresh = fresh[0]
        ? createdTime(fresh[0])
        : Number.POSITIVE_INFINITY;

      chat.setMessages((current) => [
        ...current.filter((message) => createdTime(message) < oldestFresh),
        ...fresh,
      ]);
      onContentChange();
      mutate(USER_CHATS_CACHE_KEY);
      return page.messages;
    } catch (syncError) {
      console.error("Failed to refresh messages:", syncError);
      return null;
    }
  }

  async function runExternalStream(
    kind: ExternalStream,
    request: (signal: AbortSignal) => Promise<Response>,
  ): Promise<void> {
    if (externalAbortRef.current) {
      return;
    }
    const controller = new AbortController();
    externalAbortRef.current = controller;
    setExternalStream(kind);
    setError(null);

    const failure = await request(controller.signal)
      .then((response) =>
        consumeV0Response(response, {
          chatId,
          signal: controller.signal,
          onMessage: (message) => {
            setExternalMessageId(message.id);
            chat.setMessages((current) => upsertMessage(current, message));
          },
        }),
      )
      .then(
        () => null,
        (streamError: unknown) => streamError ?? new Error("Request failed"),
      );

    if (failure && !controller.signal.aborted) {
      const info = describeChatError(failure);
      if (info.needsApiKey) {
        openKeyModal();
      }
      setError({
        message: info.message,
        canResume: kind === "resume" && !info.wasRejected,
      });
    }

    externalAbortRef.current = null;
    setExternalStream(null);
    setExternalMessageId(null);
    await syncFromServer();
  }

  const resume = () =>
    runExternalStream("resume", (signal) =>
      fetch(chatUrls.resume(chatId), { method: "POST", signal }),
    );

  const didAutoResumeRef = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per mounted chat; the page remounts this per chat ID
  useEffect(() => {
    if (didAutoResumeRef.current) {
      return;
    }
    didAutoResumeRef.current = true;
    if (mayBeGenerating(initialMessages)) {
      resume();
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    return () => {
      isMounted = false;
      setTimeout(() => {
        if (!isMounted) {
          externalAbortRef.current?.abort();
        }
      }, 0);
    };
  }, []);

  async function send(
    prompt: SentPrompt,
    modelSettings: ModelSettings,
  ): Promise<boolean> {
    if (inFlightRef.current || isBusy || !prompt.text.trim()) {
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

  async function stop(): Promise<void> {
    if (isStopping) {
      return;
    }
    setIsStopping(true);
    try {
      if (activeAssistant) {
        await stopMessage(chatId, activeAssistant.id);
      }
    } catch (stopError) {
      toast.error(describeChatError(stopError).message);
    }

    externalAbortRef.current?.abort();
    await chat.stop();
    const fresh = await syncFromServer();

    const newest = fresh?.[0];
    if (
      !activeAssistant &&
      newest?.role === "assistant" &&
      newest.finishReason === null
    ) {
      await stopMessage(chatId, newest.id).catch(() => undefined);
      await syncFromServer();
    }
    setIsStopping(false);
  }

  const resolveTask = (task: ResolveTask, modelSettings: ModelSettings) =>
    runExternalStream("resolve", (signal) =>
      fetch(chatUrls.resolve(chatId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          modelConfiguration: {
            modelId: modelSettings.modelId,
            imageGenerations: modelSettings.imageGenerations,
          },
        }),
        signal,
      }),
    );

  const rejectPermission = (modelSettings: ModelSettings) =>
    send({ text: STOP_MESSAGE, attachments: [] }, modelSettings);

  async function restore(messageId: string): Promise<void> {
    if (restoringMessageId || isBusy) {
      return;
    }
    setRestoringMessageId(messageId);
    try {
      await restoreMessage(chatId, messageId);
      await syncFromServer();
      toast.success("Restored that version");
    } catch (restoreError) {
      toast.error(describeChatError(restoreError).message);
    }
    setRestoringMessageId(null);
  }

  async function loadOlder(): Promise<void> {
    if (!cursor || isLoadingOlder) {
      return;
    }
    setIsLoadingOlder(true);
    try {
      const page = await fetchMessagesPage(chatId, { cursor });
      chat.setMessages((current) =>
        prependV0UIMessageHistory(current, page.messages),
      );
      setCursor(page.cursor);
    } catch (loadError) {
      toast.error(describeChatError(loadError).message);
    }
    setIsLoadingOlder(false);
  }

  return {
    messages: chat.messages,
    status: chat.status,
    isBusy,
    isStreaming: isBusy && activeAssistant !== undefined,
    activeAssistantId: activeAssistant?.id ?? null,
    externalStream,
    isStopping,
    restoringMessageId,
    error,
    dismissError: () => {
      setError(null);
      chat.clearError();
    },
    hasOlder: cursor !== null,
    isLoadingOlder,
    send,
    stop,
    resume,
    resolveTask,
    rejectPermission,
    restore,
    loadOlder,
  };
}

export type ChatSession = ReturnType<typeof useChatSession>;
