import "server-only";

const DEFAULT_V0_API_URL = "https://api.v0.dev/v1";

export const isDevelopment = process.env.NODE_ENV === "development";

/** Base URL of the v0 Platform API, overridable for self-hosted proxies. */
export function getV0ApiUrl(): string {
  return process.env.V0_API_URL || DEFAULT_V0_API_URL;
}
