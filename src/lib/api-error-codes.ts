export const API_ERROR_CODES = {
  unauthorized: "unauthorized",
  rateLimited: "rate_limited",
  v0ApiKeyRequired: "v0_api_key_required",
  v0ApiKeyInvalid: "v0_api_key_invalid",
  migrationRequired: "migration_required",
  legacyChat: "legacy_chat",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export interface ApiErrorBody {
  error: string;
  message?: string;
  code?: ApiErrorCode;
  details?: string;
}

export function isApiKeyErrorCode(code: string | undefined): boolean {
  return (
    code === API_ERROR_CODES.v0ApiKeyRequired ||
    code === API_ERROR_CODES.v0ApiKeyInvalid
  );
}
