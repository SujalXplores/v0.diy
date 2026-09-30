"use client";

import { useState } from "react";
import { useWindowEvent } from "@/hooks/use-window-event";

/** Fullscreen toggle and manual reload for the live preview iframe. */
export function usePreviewControls() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Changing the iframe key remounts it, which reloads the preview.
  const [reloadKey, setReloadKey] = useState(0);

  useWindowEvent(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    },
    { enabled: isFullscreen },
  );

  return {
    isFullscreen,
    toggleFullscreen: () => setIsFullscreen((fullscreen) => !fullscreen),
    reloadKey,
    reload: () => setReloadKey((key) => key + 1),
  };
}
