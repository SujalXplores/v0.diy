"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface EnvSetupProps {
  /** The `.env` lines the developer still needs to add. */
  envFileContent: string;
}

export function EnvSetup({ envFileContent }: EnvSetupProps) {
  const { copied, copy } = useCopyToClipboard();
  const CopyIcon = copied ? Check : Copy;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 dark:text-white">
              Setup Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add these environment variables to your{" "}
              <code className="rounded bg-gray-200 px-1 dark:bg-gray-800">
                .env
              </code>{" "}
              file:
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-[oklch(0.922_0_0)] p-6 dark:bg-[oklch(1_0_0/15%)]">
            <pre className="whitespace-pre-wrap break-all text-gray-900 text-sm dark:text-gray-100">
              {envFileContent}
            </pre>
          </div>

          <div className="space-y-4 text-center">
            <Button
              onClick={() => copy(envFileContent)}
              className="flex w-full items-center justify-center gap-2"
            >
              <CopyIcon className="h-4 w-4" />
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>

            <p className="text-gray-500 text-sm dark:text-gray-400">
              After adding the variables, restart your server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
