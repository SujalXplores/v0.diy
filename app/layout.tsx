import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { SWRProvider } from "@/components/providers/swr-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { StreamingProvider } from "@/contexts/streaming-context";
import { V0ApiKeyModalProvider } from "@/contexts/v0-api-key-modal-context";

export const metadata: Metadata = {
  title: "v0.diy - AI for Developers",
  description:
    "A clone of v0.app built with the v0 SDK - Generate and preview React components with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider>
          <SessionProvider>
            <SWRProvider>
              <V0ApiKeyModalProvider>
                <StreamingProvider>{children}</StreamingProvider>
              </V0ApiKeyModalProvider>
            </SWRProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
