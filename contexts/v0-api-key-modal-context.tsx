"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { V0ApiKeyModal } from "@/components/dialogs/v0-api-key-modal";

interface V0ApiKeyModalContextType {
  openKeyModal: (onSaved?: () => void) => void;
  requireV0ApiKey: () => Promise<boolean>;
}

const V0ApiKeyModalContext = createContext<V0ApiKeyModalContextType | null>(
  null,
);

export function useV0ApiKeyModal(): V0ApiKeyModalContextType {
  const context = useContext(V0ApiKeyModalContext);

  if (!context) {
    throw new Error(
      "useV0ApiKeyModal must be used within a <V0ApiKeyModalProvider />",
    );
  }

  return context;
}

interface V0ApiKeyModalProviderProps {
  children: ReactNode;
}

export function V0ApiKeyModalProvider({
  children,
}: V0ApiKeyModalProviderProps) {
  const [open, setOpen] = useState(false);
  const [onSaved, setOnSaved] = useState<(() => void) | undefined>(undefined);

  const openKeyModal = useCallback((savedCallback?: () => void) => {
    setOnSaved(() => savedCallback);
    setOpen(true);
  }, []);

  const requireV0ApiKey = useCallback(async () => {
    try {
      const response = await fetch("/api/user/v0-key", { method: "GET" });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data?.hasKey) {
        return true;
      }

      setOpen(true);
      return false;
    } catch (error) {
      console.error("Failed to verify v0 API key status:", error);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      openKeyModal,
      requireV0ApiKey,
    }),
    [openKeyModal, requireV0ApiKey],
  );

  const handleSaved = useCallback(() => {
    onSaved?.();
  }, [onSaved]);

  return (
    <V0ApiKeyModalContext.Provider value={value}>
      {children}
      <V0ApiKeyModal open={open} onOpenChange={setOpen} onSaved={handleSaved} />
    </V0ApiKeyModalContext.Provider>
  );
}
