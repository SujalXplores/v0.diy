"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { type MouseEvent, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons";
import { RESET_PARAM } from "@/features/chat/lib/reset-param";
import { ChatSelector } from "@/features/chats/components/chat-selector/chat-selector";
import { useSearchParamFlag } from "@/hooks/use-search-param-flag";
import { ThemeToggle } from "./theme-toggle";

const UserNav = dynamic(() => import("./user-nav").then((mod) => mod.UserNav), {
  ssr: false,
});

const REPOSITORY_URL = "https://github.com/SujalXplores/v0.diy";

/** Refreshes the client session after the auth actions redirect here. */
function SessionRefreshListener() {
  const { update } = useSession();
  useSearchParamFlag("refresh", "session", () => {
    update();
  });
  return null;
}

export function AppHeader() {
  const { data: session } = useSession();

  // On the homepage the logo starts over instead of navigating nowhere.
  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === "/") {
      event.preventDefault();
      window.location.href = `/?${RESET_PARAM.name}=${RESET_PARAM.value}`;
    }
  };

  return (
    <div className="border-border border-b dark:border-input">
      <Suspense fallback={null}>
        <SessionRefreshListener />
      </Suspense>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="font-semibold text-gray-900 text-lg hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
            >
              v0.diy
            </Link>
            <ChatSelector />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              className="h-fit px-2 py-1.5 text-sm"
              asChild
            >
              <Link
                href={REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon size={16} />
                sujalxplores/v0.diy
              </Link>
            </Button>
            <UserNav session={session} />
          </div>
        </div>
      </div>
    </div>
  );
}
