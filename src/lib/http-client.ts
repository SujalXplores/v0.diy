import type { ApiErrorBody } from "@/lib/api-error-codes";

/** An API call that returned a non-2xx status. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: ApiErrorBody["code"];

  constructor(message: string, status: number, code?: ApiErrorBody["code"]) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

function isApiErrorBody(value: unknown): value is Partial<ApiErrorBody> {
  return typeof value === "object" && value !== null;
}

/** Reads the `{ error, code }` body of a failed response, if there is one. */
export async function readApiError(
  response: Response,
): Promise<Partial<ApiErrorBody>> {
  const body: unknown = await response.json().catch(() => null);
  return isApiErrorBody(body) ? body : {};
}

/**
 * Sends a request and parses the JSON response.
 * @throws ApiRequestError for non-2xx responses
 */
export async function requestJson<T>(
  url: string,
  init: RequestInit & { json?: unknown } = {},
  fallbackErrorMessage = "Request failed",
): Promise<T> {
  const { json, headers, ...rest } = init;
  const response = await fetch(url, {
    ...rest,
    headers:
      json === undefined
        ? headers
        : { "Content-Type": "application/json", ...headers },
    body: json === undefined ? rest.body : JSON.stringify(json),
  });

  if (!response.ok) {
    const { error, code } = await readApiError(response);
    throw new ApiRequestError(
      error ?? fallbackErrorMessage,
      response.status,
      code,
    );
  }

  return (await response.json()) as T;
}
