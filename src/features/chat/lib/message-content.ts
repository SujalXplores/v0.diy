import type { MessageBinaryFormat } from "@v0-sdk/react";

// v0 embeds file markers and shell placeholders that aren't meant for display.
const V0_FILE_MARKER_WITH_PATH = /\[V0_FILE\][^:]*:file="[^"]*"\n?/g;
const V0_FILE_MARKER = /\[V0_FILE\][^\n]*\n?/g;
const SHELL_PLACEHOLDER = /\.\.\.\s*shell\s*\.\.\./g;
const EXTRA_BLANK_LINES = /\n\s*\n\s*\n/g;

function cleanText(text: string): string {
  return text
    .replace(V0_FILE_MARKER_WITH_PATH, "")
    .replace(V0_FILE_MARKER, "")
    .replace(SHELL_PLACEHOLDER, "")
    .replace(EXTRA_BLANK_LINES, "\n\n")
    .trim();
}

/** Removes v0 file markers and shell placeholders from message text. */
export function stripV0Markers(
  content: MessageBinaryFormat,
): MessageBinaryFormat {
  return content.map(([type, ...items]): MessageBinaryFormat[number] => [
    type,
    ...items.map((item: unknown) =>
      typeof item === "string" ? cleanText(item) : item,
    ),
  ]);
}
