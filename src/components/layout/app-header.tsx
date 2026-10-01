"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatSelector } from "@/features/chats/components/chat-selector/chat-selector";
import { useSearchParamFlag } from "@/hooks/use-search-param-flag";
import { REPOSITORY_URL } from "@/lib/links";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const AvatarSkeleton = () => <Skeleton className="size-8 rounded-full" />;

const UserNav = dynamic(() => import("./user-nav").then((mod) => mod.UserNav), {
  ssr: false,
  loading: AvatarSkeleton,
});

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/chats", label: "Chats" },
] as const;

function SessionRefreshListener() {
  const { update } = useSession();
  useSearchParamFlag("refresh", "session", () => {
    update();
  });
  return null;
}

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Button key={href} asChild variant={isActive ? "secondary" : "ghost"}>
            <Link href={href} aria-current={isActive ? "page" : undefined}>
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

function SignedOutActions() {
  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost">
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Sign up</Link>
      </Button>
    </div>
  );
}

export function AppHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b bg-background">
      <Suspense fallback={null}>
        <SessionRefreshListener />
      </Suspense>

      <div className="flex h-12 items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href="/"
            className="shrink-0 rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            aria-label="v0.diy home"
          >
            <Logo />
          </Link>
          {status === "authenticated" && <ChatSelector />}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {status === "authenticated" && <NavLinks />}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="max-sm:hidden"
              >
                <Link
                  href={REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source on GitHub"
                >
                  <GitHubIcon size={14} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View source on GitHub</TooltipContent>
          </Tooltip>
          <ThemeToggle />
          {status === "loading" && <AvatarSkeleton />}
          {status === "authenticated" && <UserNav session={session} />}
          {status === "unauthenticated" && <SignedOutActions />}
        </div>
      </div>
    </header>
  );
}
