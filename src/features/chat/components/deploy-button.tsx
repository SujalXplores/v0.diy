"use client";

import { Rocket01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { deployChat } from "../lib/chat-api";
import { describeChatError } from "../lib/chat-errors";

const VERCEL_DASHBOARD_URL = "https://vercel.com/dashboard";

export function DeployButton({
  chatId,
  disabled,
}: {
  chatId: string;
  disabled: boolean;
}) {
  const [isDeploying, setIsDeploying] = useState(false);

  const deploy = async () => {
    setIsDeploying(true);
    try {
      const { vercelProjectId } = await deployChat(chatId);
      toast.success("Deployment started", {
        description: `Vercel is building project ${vercelProjectId}. It's usually live within a minute.`,
        action: {
          label: "Open Vercel",
          onClick: () =>
            window.open(VERCEL_DASHBOARD_URL, "_blank", "noopener"),
        },
      });
    } catch (error) {
      toast.error("Couldn't deploy", {
        description: describeChatError(error).message,
      });
    }
    setIsDeploying(false);
  };

  return (
    <Button
      size="sm"
      onClick={deploy}
      disabled={disabled || isDeploying}
      title={disabled ? "Wait for v0 to finish before deploying" : undefined}
    >
      {isDeploying ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <HugeiconsIcon
          icon={Rocket01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
      )}
      {isDeploying ? "Deploying…" : "Deploy"}
    </Button>
  );
}
