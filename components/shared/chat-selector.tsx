"use client";

import {
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Chat {
  id: string;
  name?: string;
  privacy?: "public" | "private" | "team" | "team-edit" | "unlisted";
  createdAt: string;
  url?: string;
}

type PrivacyType = "public" | "private" | "team" | "team-edit" | "unlisted";

const getChatDisplayName = (chat: Chat): string =>
  chat.name || `Chat ${chat.id.slice(0, 8)}...`;

const privacyConfig: Record<
  PrivacyType,
  { icon: typeof Eye; label: string; description: string }
> = {
  public: {
    icon: Eye,
    label: "Public",
    description: "Anyone can see this chat",
  },
  private: {
    icon: EyeOff,
    label: "Private",
    description: "Only you can see this chat",
  },
  team: {
    icon: Users,
    label: "Team",
    description: "Team members can see this chat",
  },
  "team-edit": {
    icon: Users,
    label: "Team Edit",
    description: "Team members can see and edit this chat",
  },
  unlisted: {
    icon: Lock,
    label: "Unlisted",
    description: "Only people with the link can see this chat",
  },
};

const getPrivacyIcon = (privacy: string) => {
  const config = privacyConfig[privacy as PrivacyType] || privacyConfig.private;
  const Icon = config.icon;
  return <Icon className="h-4 w-4" />;
};

const getPrivacyDisplayName = (privacy: string) =>
  privacyConfig[privacy as PrivacyType]?.label || "Private";

export function ChatSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);
  const [renameChatName, setRenameChatName] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState<
    "public" | "private" | "team" | "team-edit" | "unlisted"
  >("private");
  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isDuplicatingChat, setIsDuplicatingChat] = useState(false);
  const [isChangingVisibility, setIsChangingVisibility] = useState(false);

  // Get current chat ID if on a chat page
  const currentChatId = pathname?.startsWith("/chats/")
    ? pathname.split("/")[2]
    : null;

  // Fetch user's chats
  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    const fetchChats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/chats");
        if (response.ok) {
          const data = await response.json();
          setChats(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [session?.user?.id]);

  const handleValueChange = useCallback(
    (chatId: string) => router.push(`/chats/${chatId}`),
    [router],
  );

  const handleRenameChat = useCallback(async () => {
    if (!(renameChatName.trim() && currentChatId)) {
      return;
    }

    setIsRenamingChat(true);
    try {
      const response = await fetch(`/api/chats/${currentChatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameChatName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename chat");
      }

      const updatedChat = await response.json();
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId ? { ...c, name: updatedChat.name } : c,
        ),
      );
      setIsRenameDialogOpen(false);
      setRenameChatName("");
    } catch (error) {
      console.error("Error renaming chat:", error);
    } finally {
      setIsRenamingChat(false);
    }
  }, [renameChatName, currentChatId]);

  const handleDeleteChat = useCallback(async () => {
    if (!currentChatId) {
      return;
    }

    setIsDeletingChat(true);
    try {
      const response = await fetch(`/api/chats/${currentChatId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      setChats((prev) => prev.filter((c) => c.id !== currentChatId));
      setIsDeleteDialogOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeletingChat(false);
    }
  }, [currentChatId, router]);

  const handleDuplicateChat = useCallback(async () => {
    if (!currentChatId) {
      return;
    }

    setIsDuplicatingChat(true);
    try {
      const response = await fetch("/api/chat/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: currentChatId }),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate chat");
      }

      const result = await response.json();
      setIsDuplicateDialogOpen(false);
      router.push(`/chats/${result.id}`);
    } catch (error) {
      console.error("Error duplicating chat:", error);
    } finally {
      setIsDuplicatingChat(false);
    }
  }, [currentChatId, router]);

  const handleChangeVisibility = useCallback(async () => {
    if (!currentChatId) {
      return;
    }

    setIsChangingVisibility(true);
    try {
      const response = await fetch(`/api/chats/${currentChatId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy: selectedVisibility }),
      });

      if (!response.ok) {
        throw new Error("Failed to change chat visibility");
      }

      const updatedChat = await response.json();
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId ? { ...c, privacy: updatedChat.privacy } : c,
        ),
      );
      setIsVisibilityDialogOpen(false);
    } catch (error) {
      console.error("Error changing chat visibility:", error);
    } finally {
      setIsChangingVisibility(false);
    }
  }, [currentChatId, selectedVisibility]);

  const isAnyActionPending =
    isRenamingChat ||
    isDeletingChat ||
    isDuplicatingChat ||
    isChangingVisibility;

  // Don't show if user is not authenticated
  if (!session?.user?.id) {
    return null;
  }

  const currentChat = currentChatId
    ? chats.find((c) => c.id === currentChatId)
    : null;

  return (
    <>
      <div className="flex items-center gap-1">
        <Select value={currentChatId || ""} onValueChange={handleValueChange}>
          <SelectTrigger
            className="w-fit min-w-[150px] max-w-[250px]"
            size="sm"
          >
            <SelectValue placeholder="Select chat">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="truncate">
                  {currentChat
                    ? getChatDisplayName(currentChat)
                    : "Select chat"}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {chats.length > 0 ? (
              chats.slice(0, 15).map((chat) => (
                <SelectItem key={chat.id} value={chat.id}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{getChatDisplayName(chat)}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-muted-foreground text-sm">
                No chats yet
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Chat Context Menu */}
        {currentChat && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isAnyActionPending}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Chat options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a
                  href={`https://v0.app/chat/${currentChatId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on v0.dev
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDuplicateDialogOpen(true)}
                disabled={isAnyActionPending}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Chat
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedVisibility(currentChat.privacy || "private");
                  setIsVisibilityDialogOpen(true);
                }}
                disabled={isAnyActionPending}
              >
                {getPrivacyIcon(currentChat.privacy || "private")}
                <span className="ml-2">Change Visibility</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setRenameChatName(currentChat.name || "");
                  setIsRenameDialogOpen(true);
                }}
                disabled={isAnyActionPending}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Rename Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isAnyActionPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Rename Chat Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Chat name"
              value={renameChatName}
              onChange={(e) => setRenameChatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRenamingChat) {
                  handleRenameChat();
                }
              }}
              disabled={isRenamingChat}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setRenameChatName("");
              }}
              disabled={isRenamingChat}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameChat}
              disabled={isRenamingChat || !renameChatName.trim()}
            >
              {isRenamingChat ? "Renaming..." : "Rename Chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone and will permanently remove the chat and all its messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingChat}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChat}
              disabled={isDeletingChat}
            >
              {isDeletingChat ? "Deleting..." : "Delete Chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Chat Dialog */}
      <Dialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Chat</DialogTitle>
            <DialogDescription>
              This will create a copy of the current chat. You'll be redirected
              to the new chat once it's created.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDuplicateDialogOpen(false)}
              disabled={isDuplicatingChat}
            >
              Cancel
            </Button>
            <Button onClick={handleDuplicateChat} disabled={isDuplicatingChat}>
              {isDuplicatingChat ? "Duplicating..." : "Duplicate Chat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Visibility Dialog */}
      <Dialog
        open={isVisibilityDialogOpen}
        onOpenChange={setIsVisibilityDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Chat Visibility</DialogTitle>
            <DialogDescription>
              Choose who can see and access this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedVisibility}
              onValueChange={(
                value: "public" | "private" | "team" | "team-edit" | "unlisted",
              ) => setSelectedVisibility(value)}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getPrivacyIcon(selectedVisibility)}
                    <span>{getPrivacyDisplayName(selectedVisibility)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <div>
                      <div>Private</div>
                      <div className="text-muted-foreground text-xs">
                        Only you can see this chat
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div>Public</div>
                      <div className="text-muted-foreground text-xs">
                        Anyone can see this chat
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="team">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div>Team</div>
                      <div className="text-muted-foreground text-xs">
                        Team members can see this chat
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="team-edit">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div>Team Edit</div>
                      <div className="text-muted-foreground text-xs">
                        Team members can see and edit this chat
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="unlisted">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <div>
                      <div>Unlisted</div>
                      <div className="text-muted-foreground text-xs">
                        Only people with the link can see this chat
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVisibilityDialogOpen(false)}
              disabled={isChangingVisibility}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeVisibility}
              disabled={isChangingVisibility}
            >
              {isChangingVisibility ? "Changing..." : "Change Visibility"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
