"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { USER_CHATS_CACHE_KEY } from "@/features/chat/lib/chat-api";
import type { ChatsResponse } from "../types";

export function useUserChats() {
  const { data: session, status } = useSession();
  const isSignedIn = Boolean(session?.user?.id);

  const { data, error, isLoading, mutate } = useSWR<ChatsResponse>(
    isSignedIn ? USER_CHATS_CACHE_KEY : null,
  );

  return {
    chats: data?.chats ?? [],
    error: error instanceof Error ? error : undefined,
    isLoading: status === "loading" || isLoading,
    isSignedIn,
    mutate,
  };
}
