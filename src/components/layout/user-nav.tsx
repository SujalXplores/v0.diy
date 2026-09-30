"use client";

import {
  FolderKanban,
  KeyRound,
  LogOut,
  MessageSquare,
  User,
} from "lucide-react";
import Link from "next/link";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
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
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";

interface UserNavProps {
  session: Session | null;
}

function getInitials(email: string | null | undefined): string {
  return email?.split("@")[0]?.slice(0, 2).toUpperCase() || "U";
}

function SignedInItems() {
  const { openKeyModal } = useV0ApiKeyModal();

  return (
    <>
      <DropdownMenuItem asChild>
        <Link href="/projects" className="cursor-pointer">
          <FolderKanban className="mr-2 h-4 w-4" />
          <span>Projects</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/chats" className="cursor-pointer">
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Chats</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => openKeyModal()}
        className="cursor-pointer"
      >
        <KeyRound className="mr-2 h-4 w-4" />
        <span>API Key</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => signOut({ redirectTo: "/" })}
        className="cursor-pointer"
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Sign out</span>
      </DropdownMenuItem>
    </>
  );
}

function SignedOutItems() {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link href="/register" className="cursor-pointer">
          <span>Create Account</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/login" className="cursor-pointer">
          <span>Sign In</span>
        </Link>
      </DropdownMenuItem>
    </>
  );
}

export function UserNav({ session }: UserNavProps) {
  const isSignedIn = Boolean(session);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {isSignedIn ? (
                getInitials(session?.user?.email)
              ) : (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">
              {isSignedIn ? "User" : "Not signed in"}
            </p>
            {session?.user?.email && (
              <p className="text-muted-foreground text-xs leading-none">
                {session.user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isSignedIn ? <SignedInItems /> : <SignedOutItems />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
