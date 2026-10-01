import "server-only";

import { unstable_rethrow } from "next/navigation";
import { toErrorResponse } from "./errors";

export function handleRoute<Args extends unknown[]>(
  logContext: string,
  fallbackMessage: string,
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      unstable_rethrow(error);
      return toErrorResponse(error, logContext, fallbackMessage);
    }
  };
}
