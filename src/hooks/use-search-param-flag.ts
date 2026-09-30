"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useLatestRef } from "./use-latest-ref";

/**
 * Runs `onMatch` when the URL has `?name=value`, then removes the param
 * without triggering a navigation. Callers must render inside <Suspense>.
 */
export function useSearchParamFlag(
  name: string,
  value: string,
  onMatch: () => void,
) {
  const searchParams = useSearchParams();
  const onMatchRef = useLatestRef(onMatch);
  const isMatch = searchParams.get(name) === value;

  useEffect(() => {
    if (!isMatch) {
      return;
    }

    onMatchRef.current();

    const url = new URL(window.location.href);
    url.searchParams.delete(name);
    window.history.replaceState(null, "", url);
  }, [isMatch, name, onMatchRef]);
}
