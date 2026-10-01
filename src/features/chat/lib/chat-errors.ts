import { V0ResponseError } from "@v0-sdk/react";
import { isApiKeyErrorCode } from "@/lib/api-error-codes";
import { ApiRequestError } from "@/lib/http-client";

export interface ChatErrorInfo {
  message: string;
  code: string | undefined;
  status: number | undefined;
  wasRejected: boolean;
  needsApiKey: boolean;
}

function readBodyField(body: unknown, field: "error" | "message" | "code") {
  if (body && typeof body === "object" && field in body) {
    const value = (body as Record<string, unknown>)[field];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

export function describeChatError(error: unknown): ChatErrorInfo {
  let message = "Something went wrong. Please try again.";
  let code: string | undefined;
  let status: number | undefined;

  if (error instanceof V0ResponseError) {
    status = error.status;
    code = readBodyField(error.body, "code");
    message =
      readBodyField(error.body, "error") ??
      readBodyField(error.body, "message") ??
      message;
  } else if (error instanceof ApiRequestError) {
    status = error.status;
    code = error.code;
    message = error.message;
  } else if (error instanceof Error && error.message) {
    message =
      error.name === "TypeError" && /fetch/i.test(error.message)
        ? "Couldn't reach the server. Check your connection."
        : error.message;
  }

  return {
    message,
    code,
    status,
    wasRejected: status !== undefined,
    needsApiKey: isApiKeyErrorCode(code),
  };
}
