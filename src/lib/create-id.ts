let fallbackCounter = 0;

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
