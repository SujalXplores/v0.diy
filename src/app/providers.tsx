"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SWRProvider } from "@/components/providers/swr-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { V0ApiKeyModalProvider } from "@/features/v0-api-key/components/v0-api-key-modal-provider";

/** Client-side context shared by every page. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SWRProvider>
          <V0ApiKeyModalProvider>{children}</V0ApiKeyModalProvider>
        </SWRProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
