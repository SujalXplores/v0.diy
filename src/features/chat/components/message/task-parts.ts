/** A file touched by a v0 task. */
export interface TaskPartChangedFile {
  fileName?: string;
  baseName?: string;
}

export interface TaskPartInspiration {
  title?: string;
  description?: string;
}

/** One step of a v0 task section, as streamed by the v0 API. */
export interface TaskPart {
  type: string;
  query?: string;
  filePaths?: string[];
  filePath?: string;
  count?: number;
  answer?: string;
  changedFiles?: TaskPartChangedFile[];
  inspirations?: TaskPartInspiration[];
  requirements?: unknown[];
  status?: string;
  message?: string;
  description?: string;
  text?: string;
  error?: string;
  source?: string;
}

export function isTaskPart(value: unknown): value is TaskPart {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

/** Treats untyped objects as "unknown" parts so they still get rendered. */
export function toTaskPart(value: object): TaskPart {
  return isTaskPart(value) ? value : { ...value, type: "unknown" };
}

export function getChangedFileName(
  file: TaskPartChangedFile,
): string | undefined {
  return file.fileName || file.baseName;
}

/** "select-files" → "Select files", "fooBar" → "Foo bar". */
export function toReadableLabel(value: string): string {
  const spaced = value
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** "task-read-file-v1" → "Read File". */
export function toTaskTitle(taskType: string): string {
  return taskType
    .replace("task-", "")
    .replace("-v1", "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
