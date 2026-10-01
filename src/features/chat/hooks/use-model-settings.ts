"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_MODEL_ID, isV0ModelId, type V0ModelId } from "@/lib/v0-models";

const STORAGE_KEY = "v0diy:model-settings";
const CHANGE_EVENT = "v0diy:model-settings-change";

export interface ModelSettings {
  modelId: V0ModelId;
  imageGenerations: boolean;
}

const DEFAULT_SETTINGS: ModelSettings = {
  modelId: DEFAULT_MODEL_ID,
  imageGenerations: false,
};

let cachedRaw: string | null | undefined;
let cachedSettings: ModelSettings = DEFAULT_SETTINGS;
let memorySettings: ModelSettings | null = null;

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): ModelSettings {
  if (memorySettings) {
    return memorySettings;
  }
  const raw = readStored();
  if (raw === cachedRaw) {
    return cachedSettings;
  }
  cachedRaw = raw;
  try {
    const parsed = JSON.parse(raw ?? "null") as Partial<ModelSettings> | null;
    cachedSettings = {
      modelId: isV0ModelId(parsed?.modelId)
        ? parsed.modelId
        : DEFAULT_SETTINGS.modelId,
      imageGenerations: parsed?.imageGenerations === true,
    };
  } catch {
    cachedSettings = DEFAULT_SETTINGS;
  }
  return cachedSettings;
}

const getServerSnapshot = () => DEFAULT_SETTINGS;

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useModelSettings() {
  const settings = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const update = (patch: Partial<ModelSettings>) => {
    const next = { ...settings, ...patch };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      memorySettings = next;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return { settings, update };
}
