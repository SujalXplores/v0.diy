"use client";

import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/**
 * Keeps a ref pointing at the latest value, for callbacks that are invoked
 * later (event listeners, browser APIs) and must not see stale props.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
