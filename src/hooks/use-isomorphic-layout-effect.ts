import { useEffect, useLayoutEffect } from "react";

/** useLayoutEffect in the browser, useEffect during SSR (avoids a warning). */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
