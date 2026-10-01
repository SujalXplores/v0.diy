"use client";

import { useEffect } from "react";
import { useLatestRef } from "./use-latest-ref";

export function useWindowEvent<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const handlerRef = useLatestRef(handler);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener = (event: WindowEventMap[K]) => handlerRef.current(event);
    window.addEventListener(eventName, listener);

    return () => window.removeEventListener(eventName, listener);
  }, [eventName, enabled, handlerRef]);
}
