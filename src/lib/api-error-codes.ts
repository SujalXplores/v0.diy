/** Machine-readable error codes shared by API routes and their client callers. */
export const API_ERROR_CODES = {
  unauthorized: "unauthorized",
  rateLimited: "rate_limited",
  v0ApiKeyRequired: "v0_api_key_required",
  migrationRequired: "migration_required",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

/** JSON body returned by every API route on failure. */
export interface ApiErrorBody {
  error: string;
  code?: ApiErrorCode;
  details?: string;
}
