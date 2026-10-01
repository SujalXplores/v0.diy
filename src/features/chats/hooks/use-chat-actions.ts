"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { USER_CHATS_CACHE_KEY } from "@/features/chat/lib/chat-api";
import {
  deleteChat,
  duplicateChat,
  renameChat,
  updateChatVisibility,
} from "../lib/chat-actions-api";
import { getPrivacyOption } from "../lib/chat-privacy";
import type { ChatPrivacy, ChatSummary, ChatsResponse } from "../types";

export type ChatAction = "rename" | "delete" | "duplicate" | "visibility";

const FAILURE_MESSAGES: Record<ChatAction, string> = {
  rename: "Couldn't rename the chat",
  delete: "Couldn't delete the chat",
  duplicate: "Couldn't duplicate the chat",
  visibility: "Couldn't change the chat's visibility",
};

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
      (current) => current && { ...current, chats: update(current.chats) },
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
      router.refresh();
    } catch (error) {
      console.error(`Chat action "${action}" failed:`, error);
      toast.error(FAILURE_MESSAGES[action], {
        description: error instanceof Error ? error.message : undefined,
      });
    }
    setPendingAction(null);
  };

  const openRenameDialog = () => {
    setNewName(chat.title ?? "");
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
      await patchChat({ title: updated.title });
      toast.success("Chat renamed");
    });
  };

  const remove = () =>
    run("delete", async () => {
      await deleteChat(chat.id);
      await updateChatList((chats) =>
        chats.filter((item) => item.id !== chat.id),
      );
      router.push("/");
      toast.success("Chat deleted");
    });

  const duplicate = () =>
    run("duplicate", async () => {
      const forked = await duplicateChat(chat.id);
      await mutate(USER_CHATS_CACHE_KEY);
      router.push(`/chats/${forked.id}`);
      toast.success("Chat duplicated", {
        description: "You're now in the copy.",
      });
    });

  const changeVisibility = () =>
    run("visibility", async () => {
      const updated = await updateChatVisibility(chat.id, selectedPrivacy);
      await patchChat({ privacy: updated.privacy });
      toast.success(
        `Visibility set to ${getPrivacyOption(updated.privacy).label}`,
      );
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
