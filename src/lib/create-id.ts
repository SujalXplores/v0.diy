let fallbackCounter = 0;

/**
 * A unique client-side ID. `crypto.randomUUID` only exists in secure
 * contexts (HTTPS or localhost), so plain-HTTP origins get a fallback.
 */
export function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  fallbackCounter += 1;
  return `${Date.now().toString(36)}-${fallbackCounter}-${Math.random().toString(36).slice(2)}`;
}
