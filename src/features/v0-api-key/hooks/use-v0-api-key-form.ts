"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  deleteV0ApiKey,
  fetchV0ApiKeyStatus,
  saveV0ApiKey,
  V0_API_KEY_STATUS_CACHE_KEY,
} from "../lib/v0-api-key-api";

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

interface UseV0ApiKeyFormOptions {
  isOpen: boolean;
  onSaved: () => void;
}

export function useV0ApiKeyForm({ isOpen, onSaved }: UseV0ApiKeyFormOptions) {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: status, mutate } = useSWR(
    isOpen ? V0_API_KEY_STATUS_CACHE_KEY : null,
    fetchV0ApiKeyStatus,
    {
      onError: (loadError) =>
        console.error("Failed to load v0 key status:", loadError),
    },
  );

  const runAction = async (
    setPending: (pending: boolean) => void,
    action: () => Promise<void>,
    fallbackError: string,
  ): Promise<boolean> => {
    setError(null);
    setPending(true);
    let succeeded = true;
    try {
      await action();
    } catch (actionError) {
      setError(toErrorMessage(actionError, fallbackError));
      succeeded = false;
    }
    setPending(false);
    return succeeded;
  };

  const save = () =>
    runAction(
      setIsSaving,
      async () => {
        await saveV0ApiKey(apiKey);
        setApiKey("");
        await mutate({ hasKey: true, lastUpdatedAt: new Date().toISOString() });
        onSaved();
      },
      "Failed to save API key",
    );

  const remove = () =>
    runAction(
      setIsDeleting,
      async () => {
        await deleteV0ApiKey();
        setApiKey("");
        await mutate({ hasKey: false, lastUpdatedAt: null });
      },
      "Failed to remove API key",
    );

  const reset = () => setError(null);

  return {
    apiKey,
    setApiKey,
    error,
    hasExistingKey: Boolean(status?.hasKey),
    lastUpdatedAt: status?.lastUpdatedAt ?? null,
    isSaving,
    isDeleting,
    canSave: Boolean(apiKey.trim()) && !isSaving && !isDeleting,
    save,
    remove,
    reset,
  };
}
