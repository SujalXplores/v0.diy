"use client";

import { useEffect, useState } from "react";

const RESET_DELAY_MS = 2000;

/** Copies text and reports `copied: true` for a short moment afterwards. */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(false), RESET_DELAY_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return { copied, copy };
}
