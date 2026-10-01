"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SWRProvider } from "@/components/providers/swr-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { V0ApiKeyModalProvider } from "@/features/v0-api-key/components/v0-api-key-modal-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SWRProvider>
          <TooltipProvider>
            <V0ApiKeyModalProvider>{children}</V0ApiKeyModalProvider>
            <Toaster />
          </TooltipProvider>
        </SWRProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
