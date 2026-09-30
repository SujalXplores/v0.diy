"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { USER_CHATS_CACHE_KEY } from "@/features/chat/lib/chat-api";
import {
  deleteChat,
  duplicateChat,
  renameChat,
  updateChatVisibility,
} from "../lib/chat-actions-api";
import type { ChatPrivacy, ChatSummary, ChatsResponse } from "../types";

export type ChatAction = "rename" | "delete" | "duplicate" | "visibility";

/** Dialog state and API calls behind the current chat's options menu. */
export function useChatActions(chat: ChatSummary) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [openDialog, setOpenDialog] = useState<ChatAction | null>(null);
  const [pendingAction, setPendingAction] = useState<ChatAction | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedPrivacy, setSelectedPrivacy] = useState<ChatPrivacy>(
    chat.privacy,
  );

  const updateChatList = (update: (chats: ChatSummary[]) => ChatSummary[]) =>
    mutate<ChatsResponse>(
      USER_CHATS_CACHE_KEY,
      (current) => current && { ...current, data: update(current.data) },
      { revalidate: false },
    );

  const patchChat = (patch: Partial<ChatSummary>) =>
    updateChatList((chats) =>
      chats.map((item) => (item.id === chat.id ? { ...item, ...patch } : item)),
    );

  const run = async (action: ChatAction, task: () => Promise<void>) => {
    setPendingAction(action);
    try {
      await task();
      setOpenDialog(null);
    } catch (error) {
      console.error(`Chat action "${action}" failed:`, error);
    }
    setPendingAction(null);
  };

  const openRenameDialog = () => {
    setNewName(chat.name ?? "");
    setOpenDialog("rename");
  };

  const openVisibilityDialog = () => {
    setSelectedPrivacy(chat.privacy);
    setOpenDialog("visibility");
  };

  const rename = async () => {
    const name = newName.trim();
    if (!name || pendingAction) {
      return;
    }

    await run("rename", async () => {
      const updated = await renameChat(chat.id, name);
      await patchChat({ name: updated.name });
    });
  };

  const remove = () =>
    run("delete", async () => {
      await deleteChat(chat.id);
      await updateChatList((chats) =>
        chats.filter((item) => item.id !== chat.id),
      );
      router.push("/");
    });

  const duplicate = () =>
    run("duplicate", async () => {
      const forked = await duplicateChat(chat.id);
      await mutate(USER_CHATS_CACHE_KEY);
      router.push(`/chats/${forked.id}`);
    });

  const changeVisibility = () =>
    run("visibility", async () => {
      const updated = await updateChatVisibility(chat.id, selectedPrivacy);
      await patchChat({ privacy: updated.privacy });
    });

  return {
    openDialog,
    setOpenDialog,
    pendingAction,
    newName,
    setNewName,
    selectedPrivacy,
    setSelectedPrivacy,
    openRenameDialog,
    openVisibilityDialog,
    rename,
    remove,
    duplicate,
    changeVisibility,
  };
}

export type ChatActions = ReturnType<typeof useChatActions>;
