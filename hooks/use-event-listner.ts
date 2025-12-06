import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

// Helper type mapping between targets and event maps
type EventMapOf<T> = T extends Window
  ? WindowEventMap
  : T extends Document
    ? DocumentEventMap
    : T extends HTMLElement
      ? HTMLElementEventMap
      : Record<string, Event>;

export function useEventListener<
  T extends EventTarget,
  K extends keyof EventMapOf<T>,
>(
  eventName: K,
  handler: (event: EventMapOf<T>[K]) => void,
  target?: T | React.RefObject<T> | null,
) {
  const savedHandler = useRef(handler);

  // Keep handler ref up to date
  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement =
      (target && "current" in target ? target.current : target) || window;

    if (!targetElement?.addEventListener) {
      return;
    }

    const eventListener = (event: EventMapOf<T>[K]) =>
      savedHandler.current(event);

    targetElement.addEventListener(
      eventName as string,
      eventListener as EventListener,
    );

    return () => {
      targetElement.removeEventListener(
        eventName as string,
        eventListener as EventListener,
      );
    };
  }, [eventName, target]);
}
