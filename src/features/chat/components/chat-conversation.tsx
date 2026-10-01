"use client";

import {
  AlertCircleIcon,
  ArrowTurnBackwardIcon,
  Coins01Icon,
  Copy01Icon,
  RefreshIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { V0UIMessage } from "@v0-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message } from "@/components/ai-elements/message";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ChatSession, ResolveTask } from "../hooks/use-chat-session";
import { formatCredits, getMessageText } from "../lib/v0-messages";
import { MessageParts } from "./message-parts";
import { PendingTask } from "./pending-task";

interface ChatConversationProps {
  chatId: string;
  session: ChatSession;
  vercelProjectId: string | undefined;
  onResolveTask: (task: ResolveTask) => void;
  onRejectPermission: () => void;
}

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => copy(text)}
          aria-label="Copy message"
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            strokeWidth={2}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
    </Tooltip>
  );
}

function MessageFooter({
  message,
  session,
}: {
  message: V0UIMessage;
  session: ChatSession;
}) {
  const text = getMessageText(message);
  const credits = formatCredits(message);
  const canRestore = message.metadata?.restorable === true;
  const isRestoring = session.restoringMessageId === message.id;

  if (!(text || credits || canRestore)) {
    return null;
  }

  return (
    <div className="-ml-1.5 flex items-center gap-0.5 text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
      {text && <CopyButton text={text} />}
      {canRestore && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => session.restore(message.id)}
              disabled={isRestoring || session.isBusy}
            >
              {isRestoring ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <HugeiconsIcon
                  icon={ArrowTurnBackwardIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
              )}
              Restore
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rewind the code to this version</TooltipContent>
        </Tooltip>
      )}
      {credits && (
        <span
          className="ml-1 inline-flex items-center gap-1 text-[0.6875rem] tabular-nums"
          title="Credits used by this response"
        >
          <HugeiconsIcon
            icon={Coins01Icon}
            strokeWidth={2}
            className="size-3"
          />
          {credits}
        </span>
      )}
    </div>
  );
}

function StreamingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2 text-muted-foreground text-xs">
      <Spinner className="size-3.5" />
      <span className="animate-pulse">{label}</span>
    </div>
  );
}

export function ChatConversation({
  chatId,
  session,
  vercelProjectId,
  onResolveTask,
  onRejectPermission,
}: ChatConversationProps) {
  const { messages } = session;
  const lastMessage = messages.at(-1);
  const isWaitingForAssistant =
    session.isBusy &&
    (lastMessage?.role === "user" || lastMessage === undefined);

  return (
    <Conversation aria-busy={session.isBusy}>
      <ConversationContent>
        {session.hasOlder && (
          <div className="flex justify-center pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => session.loadOlder()}
              disabled={session.isLoadingOlder}
            >
              {session.isLoadingOlder && <Spinner data-icon="inline-start" />}
              Load earlier messages
            </Button>
          </div>
        )}

        {messages.map((message) => {
          const isLast = message.id === lastMessage?.id;
          const isStreaming = session.activeAssistantId === message.id;
          return (
            <Message
              from={message.role === "user" ? "user" : "assistant"}
              key={message.id}
            >
              <div className="flex min-w-0 flex-col gap-2">
                <span className="sr-only">
                  {message.role === "user" ? "You said:" : "v0 replied:"}
                </span>
                <MessageParts message={message} isStreaming={isStreaming} />
                {message.role === "assistant" && isLast && !session.isBusy && (
                  <PendingTask
                    chatId={chatId}
                    message={message}
                    vercelProjectId={vercelProjectId}
                    disabled={session.isBusy}
                    onResolve={onResolveTask}
                    onRejectPermission={onRejectPermission}
                  />
                )}
                {message.role === "assistant" && !isStreaming && (
                  <MessageFooter message={message} session={session} />
                )}
              </div>
            </Message>
          );
        })}

        {isWaitingForAssistant && (
          <StreamingIndicator
            label={
              session.externalStream === "resume"
                ? "Reconnecting to v0…"
                : "v0 is working…"
            }
          />
        )}

        {session.error && (
          <Alert variant="destructive" className="my-3">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
            <AlertDescription>{session.error.message}</AlertDescription>
            <AlertAction className="flex gap-1">
              {session.error.canResume && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => session.resume()}
                  disabled={session.isBusy}
                >
                  <HugeiconsIcon
                    icon={RefreshIcon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  Reconnect
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={session.dismissError}>
                Dismiss
              </Button>
            </AlertAction>
          </Alert>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
