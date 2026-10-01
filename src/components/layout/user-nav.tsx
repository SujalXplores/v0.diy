"use client";

import { Key01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitHubIcon } from "@/components/ui/icons";
import { CreditsSummary } from "@/features/credits/components/credits-summary";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";
import { REPOSITORY_URL } from "@/lib/links";

interface UserNavProps {
  session: Session | null;
}

function getInitials(email: string | null | undefined): string {
  return email?.split("@")[0]?.slice(0, 2).toUpperCase() || "U";
}

export function UserNav({ session }: UserNavProps) {
  const { openKeyModal } = useV0ApiKeyModal();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const email = session?.user?.email;
  const initials = getInitials(email);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirectTo: "/" });
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full"
            aria-label="Account menu"
          >
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="end">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="truncate">{email ?? "Signed in"}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <CreditsSummary />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openKeyModal()}>
            <HugeiconsIcon icon={Key01Icon} strokeWidth={2} />
            v0 API key
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="sm:hidden">
            <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
              <GitHubIcon size={14} />
              Source on GitHub
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsSignOutOpen(true)}>
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={isSignOutOpen}
        onOpenChange={setIsSignOutOpen}
        icon={Logout01Icon}
        title="Sign out of v0.diy?"
        description="You'll need to sign in again to see your projects and keep chatting."
        confirmLabel="Sign out"
        pendingLabel="Signing out..."
        isPending={isSigningOut}
        onConfirm={handleSignOut}
      />
    </>
  );
}
