"use client";

import { BubbleChatIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LoginNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("callbackUrl") !== "/") {
    return null;
  }

  return (
    <Alert>
      <HugeiconsIcon icon={BubbleChatIcon} strokeWidth={2} />
      <AlertTitle>Sign in to start chatting</AlertTitle>
      <AlertDescription>
        Your prompt is saved and will be waiting when you&apos;re back.
      </AlertDescription>
    </Alert>
  );
}
