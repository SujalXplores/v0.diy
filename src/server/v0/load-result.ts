import "server-only";

import { API_ERROR_CODES } from "@/lib/api-error-codes";
import type { LoadResult } from "@/lib/load-result";
import { HttpError } from "@/server/http/errors";

export async function loadV0Data<T>(
  load: () => Promise<T>,
  errorMessage: string,
): Promise<LoadResult<T>> {
  try {
    return { status: "ok", data: await load() };
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.code === API_ERROR_CODES.v0ApiKeyRequired
    ) {
      return { status: "missing-key" };
    }

    console.error(errorMessage, error);
    return { status: "error", message: errorMessage };
  }
}
