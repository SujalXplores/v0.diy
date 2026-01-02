"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { ChatSelector } from "./chat-selector";

const UserNav = dynamic(
  () => import("@/components/user-nav").then((mod) => mod.UserNav),
  { ssr: false },
);

interface AppHeaderProps {
  className?: string;
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const { update } = useSession();

  // Force session refresh when redirected after auth
  useEffect(() => {
    const shouldRefresh = searchParams.get("refresh") === "session";

    if (shouldRefresh) {
      // Force session update
      update();

      // Clean up URL without causing navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("refresh");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams, update]);

  return null;
}

export function AppHeader({ className = "" }: AppHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isHomepage = pathname === "/";

  // Handle logo click - reset UI if on homepage, otherwise navigate to homepage
  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomepage) {
      e.preventDefault();
      // Add reset parameter to trigger UI reset
      window.location.href = "/?reset=true";
    }
    // If not on homepage, let the Link component handle navigation normally
  };

  return (
    <div className={cn("border-border border-b dark:border-input", className)}>
      <Suspense fallback={null}>
        <SearchParamsHandler />
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
                href="https://github.com/SujalXplores/v0.diy"
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
