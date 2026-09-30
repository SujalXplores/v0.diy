"use client";

import { createContext, use } from "react";

interface V0ApiKeyModalContextValue {
  /** Opens the key dialog; `onSaved` runs once a key is stored. */
  openKeyModal: (onSaved?: () => void) => void;
  /** Resolves true when a key is saved, otherwise opens the dialog. */
  requireV0ApiKey: () => Promise<boolean>;
}

export const V0ApiKeyModalContext =
  createContext<V0ApiKeyModalContextValue | null>(null);

export function useV0ApiKeyModal(): V0ApiKeyModalContextValue {
  const context = use(V0ApiKeyModalContext);

  if (!context) {
    throw new Error(
      "useV0ApiKeyModal must be used within a <V0ApiKeyModalProvider />",
    );
  }

  return context;
}
