"use client";

import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

export function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
