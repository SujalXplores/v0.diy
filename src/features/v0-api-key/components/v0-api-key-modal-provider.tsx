"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { V0ApiKeyModalContext } from "../context";
import {
  fetchV0ApiKeyStatus,
  V0_API_KEY_STATUS_CACHE_KEY,
} from "../lib/v0-api-key-api";
import { V0ApiKeyModal } from "./v0-api-key-modal";

interface V0ApiKeyModalProviderProps {
  children: ReactNode;
}

export function V0ApiKeyModalProvider({
  children,
}: V0ApiKeyModalProviderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const onSavedRef = useRef<(() => void) | undefined>(undefined);
  const { mutate } = useSWRConfig();

  const openKeyModal = (onSaved?: () => void) => {
    onSavedRef.current = onSaved;
    setOpen(true);
  };

  const requireV0ApiKey = async () => {
    try {
      const status = await fetchV0ApiKeyStatus();
      await mutate(V0_API_KEY_STATUS_CACHE_KEY, status, { revalidate: false });

      if (status.hasKey) {
        return true;
      }

      setOpen(true);
      return false;
    } catch (error) {
      console.error("Failed to verify v0 API key status:", error);
      return false;
    }
  };

  const handleSaved = () => {
    toast.success("API key saved", {
      description: "You're all set to start generating.",
    });
    router.refresh();
    onSavedRef.current?.();
  };

  const handleRemoved = () => {
    toast.success("API key removed");
    router.refresh();
  };

  return (
    <V0ApiKeyModalContext value={{ openKeyModal, requireV0ApiKey }}>
      {children}
      <V0ApiKeyModal
        open={open}
        onOpenChange={setOpen}
        onSaved={handleSaved}
        onRemoved={handleRemoved}
      />
    </V0ApiKeyModalContext>
  );
}
