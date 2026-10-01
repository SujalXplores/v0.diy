"use client";

import { createContext, use } from "react";

interface V0ApiKeyModalContextValue {
  openKeyModal: (onSaved?: () => void) => void;
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
