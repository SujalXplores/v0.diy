export const V0_MODEL_IDS = [
  "v0-mini",
  "v0-pro",
  "v0-max",
  "v0-max-fast",
] as const;

export type V0ModelId = (typeof V0_MODEL_IDS)[number];

export interface V0ModelOption {
  id: V0ModelId;
  label: string;
  description: string;
}

export const V0_MODELS: readonly V0ModelOption[] = [
  {
    id: "v0-mini",
    label: "v0 Mini",
    description: "Fastest and cheapest, for small edits",
  },
  {
    id: "v0-pro",
    label: "v0 Pro",
    description: "Balanced speed and quality",
  },
  {
    id: "v0-max",
    label: "v0 Max",
    description: "Most capable, for complex apps",
  },
  {
    id: "v0-max-fast",
    label: "v0 Max Fast",
    description: "Max quality with lower latency",
  },
];

export function isV0ModelId(value: unknown): value is V0ModelId {
  return (V0_MODEL_IDS as readonly unknown[]).includes(value);
}

export const MAX_PROMPT_LENGTH = 30_000;
export const MAX_ATTACHMENTS = 5;
export const MAX_SOURCE_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_ATTACHMENT_URL_LENGTH = 1_500_000;
export const MAX_TOTAL_ATTACHMENT_URL_LENGTH = 3_500_000;
