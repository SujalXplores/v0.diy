import { requestJson } from "@/lib/http-client";

const V0_KEY_ENDPOINT = "/api/user/v0-key";

/** SWR cache key for the signed-in user's key status. */
export const V0_API_KEY_STATUS_CACHE_KEY = "v0-api-key-status";

export interface V0ApiKeyStatus {
  hasKey: boolean;
  lastUpdatedAt: string | null;
}

export function fetchV0ApiKeyStatus(): Promise<V0ApiKeyStatus> {
  return requestJson<V0ApiKeyStatus>(V0_KEY_ENDPOINT);
}

export async function saveV0ApiKey(apiKey: string): Promise<void> {
  await requestJson(
    V0_KEY_ENDPOINT,
    { method: "PUT", json: { apiKey: apiKey.trim() } },
    "Failed to save API key",
  );
}

export async function deleteV0ApiKey(): Promise<void> {
  await requestJson(
    V0_KEY_ENDPOINT,
    { method: "DELETE" },
    "Failed to remove API key",
  );
}
