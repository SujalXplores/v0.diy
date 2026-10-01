"use client";

import {
  AlertCircleIcon,
  Key01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useV0ApiKeyModal } from "@/features/v0-api-key/context";

export function MissingKeyState({ resource }: { resource: string }) {
  const { openKeyModal } = useV0ApiKeyModal();

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Key01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>Connect your v0 API key</EmptyTitle>
        <EmptyDescription>
          Your {resource} live in your v0 account. Add your API key to see them
          here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => openKeyModal()}>Connect API key</Button>
      </EmptyContent>
    </Empty>
  );
}

export function LoadErrorState({ title }: { title: string }) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          Something went wrong while talking to v0. It's usually temporary.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          disabled={isRetrying}
          onClick={() => startRetry(() => router.refresh())}
        >
          {isRetrying ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <HugeiconsIcon
              icon={RefreshIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
          )}
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
