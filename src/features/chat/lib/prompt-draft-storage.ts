import type { ImageAttachment } from "./image-attachments";

const STORAGE_PREFIX = "v0diy:draft:";

export interface PromptDraft {
  message: string;
  attachments: ImageAttachment[];
}

const keyFor = (scope: string) => `${STORAGE_PREFIX}${scope}`;

function isDraft(value: unknown): value is PromptDraft {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const draft = value as Partial<PromptDraft>;
  return typeof draft.message === "string" && Array.isArray(draft.attachments);
}

export function savePromptDraft(scope: string, draft: PromptDraft): void {
  try {
    sessionStorage.setItem(keyFor(scope), JSON.stringify(draft));
  } catch {
    try {
      sessionStorage.setItem(
        keyFor(scope),
        JSON.stringify({ message: draft.message, attachments: [] }),
      );
    } catch {
      // Storage unavailable (private mode); drafts just won't persist.
    }
  }
}

export function loadPromptDraft(scope: string): PromptDraft | null {
  try {
    const stored = sessionStorage.getItem(keyFor(scope));
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPromptDraft(scope: string): void {
  try {
    sessionStorage.removeItem(keyFor(scope));
  } catch {
    // Storage unavailable; nothing to clear.
  }
}
