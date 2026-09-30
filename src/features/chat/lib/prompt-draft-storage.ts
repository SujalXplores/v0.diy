import type { ImageAttachment } from "../types";

const STORAGE_KEY = "v0-prompt-data";

/** An unsent prompt kept in sessionStorage so it survives reloads. */
export interface PromptDraft {
  message: string;
  attachments: ImageAttachment[];
}

interface StoredAttachment {
  id: string;
  fileName: string;
  dataUrl: string;
}

interface StoredDraft {
  message: string;
  attachments: StoredAttachment[];
}

function isStoredDraft(value: unknown): value is StoredDraft {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const draft = value as Partial<StoredDraft>;
  return typeof draft.message === "string" && Array.isArray(draft.attachments);
}

export function savePromptDraft({ message, attachments }: PromptDraft): void {
  const draft: StoredDraft = {
    message,
    attachments: attachments.map(({ id, name, dataUrl }) => ({
      id,
      fileName: name,
      dataUrl,
    })),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.warn("Failed to save prompt to sessionStorage:", error);
  }
}

export function loadPromptDraft(): PromptDraft | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;

    if (!isStoredDraft(parsed)) {
      return null;
    }

    return {
      message: parsed.message,
      attachments: parsed.attachments.map(({ id, fileName, dataUrl }) => ({
        id,
        name: fileName,
        dataUrl,
      })),
    };
  } catch (error) {
    console.warn("Failed to load prompt from sessionStorage:", error);
    return null;
  }
}

export function clearPromptDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear prompt from sessionStorage:", error);
  }
}
