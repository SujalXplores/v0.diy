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

/** State and actions behind the "Set your v0 API key" dialog. */
export function useV0ApiKeyForm({ isOpen, onSaved }: UseV0ApiKeyFormOptions) {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only fetch the key status while the dialog is visible.
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
  ) => {
    setError(null);
    setPending(true);
    try {
      await action();
    } catch (actionError) {
      setError(toErrorMessage(actionError, fallbackError));
    }
    setPending(false);
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

  /** Clears transient state when the dialog is dismissed. */
  const reset = () => setError(null);

  return {
    apiKey,
    setApiKey,
    error,
    hasExistingKey: Boolean(status?.hasKey),
    isSaving,
    isDeleting,
    canSave: Boolean(apiKey.trim()) && !isSaving && !isDeleting,
    save,
    remove,
    reset,
  };
}
