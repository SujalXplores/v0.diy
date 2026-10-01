import "server-only";

const DEFAULT_V0_API_URL = "https://api.v0.dev/v2";

export const LEGACY_V0_API_URL = "https://api.v0.dev/v1";

export const isDevelopment = process.env.NODE_ENV === "development";

let hasWarnedAboutV1Url = false;

export function getV0ApiUrl(): string {
  const configured = process.env.V0_API_URL?.trim().replace(/\/+$/, "");

  if (!configured) {
    return DEFAULT_V0_API_URL;
  }

  if (configured.endsWith("/v1")) {
    if (!hasWarnedAboutV1Url) {
      hasWarnedAboutV1Url = true;
      console.warn(
        `V0_API_URL points at the v1 API (${configured}); using ${DEFAULT_V0_API_URL} instead.`,
      );
    }
    return DEFAULT_V0_API_URL;
  }

  return configured;
}
