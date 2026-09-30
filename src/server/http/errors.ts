import "server-only";

import {
  API_ERROR_CODES,
  type ApiErrorBody,
  type ApiErrorCode,
} from "@/lib/api-error-codes";

/** An error that maps directly onto an HTTP error response. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | undefined;

  constructor(status: number, message: string, code?: ApiErrorCode) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }

  toResponse(): Response {
    const body: ApiErrorBody = { error: this.message };
    if (this.code) {
      body.code = this.code;
    }
    return Response.json(body, { status: this.status });
  }
}

export const unauthorizedError = () =>
  new HttpError(401, "Authentication required", API_ERROR_CODES.unauthorized);

export const badRequestError = (message: string) => new HttpError(400, message);

/**
 * Converts anything thrown inside a route handler into a JSON response.
 * Unexpected errors are logged and reported as a 500.
 */
export function toErrorResponse(
  error: unknown,
  logContext: string,
  fallbackMessage: string,
): Response {
  if (error instanceof HttpError) {
    return error.toResponse();
  }

  console.error(`${logContext}:`, error);

  const body: ApiErrorBody = {
    error: fallbackMessage,
    details: error instanceof Error ? error.message : "Unknown error",
  };
  return Response.json(body, { status: 500 });
}
