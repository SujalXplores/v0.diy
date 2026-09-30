import { CodeBlock, MathPart, type MessageProps } from "@v0-sdk/react";
import { CodeProjectPart } from "./code-project-part";
import { TaskSection } from "./task-section";
import { ThinkingSection } from "./thinking-section";

/**
 * Component overrides passed to v0's Message and StreamingMessage renderers:
 * AI Elements for structured parts, plus classNames for plain HTML elements.
 */
export const messageComponents = {
  ThinkingSection,
  TaskSection,
  CodeProjectPart,
  CodeBlock,
  MathPart,

  p: {
    className: "mb-4 text-gray-700 dark:text-gray-200 leading-relaxed",
  },
  h1: {
    className: "mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100",
  },
  h2: {
    className: "mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100",
  },
  h3: {
    className: "mb-3 text-lg font-medium text-gray-900 dark:text-gray-100",
  },
  h4: {
    className: "mb-3 text-base font-medium text-gray-900 dark:text-gray-100",
  },
  h5: {
    className: "mb-2 text-sm font-medium text-gray-900 dark:text-gray-100",
  },
  h6: {
    className: "mb-2 text-sm font-medium text-gray-900 dark:text-gray-100",
  },
  ul: {
    className: "mb-4 ml-6 list-disc space-y-1 text-gray-700 dark:text-gray-200",
  },
  ol: {
    className:
      "mb-4 ml-6 list-decimal space-y-1 text-gray-700 dark:text-gray-200",
  },
  li: {
    className: "text-gray-700 dark:text-gray-200",
  },
  blockquote: {
    className:
      "mb-4 border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400",
  },
  code: {
    className:
      "rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono text-gray-900 dark:text-gray-100",
  },
  pre: {
    className:
      "mb-4 overflow-x-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-4",
  },
  a: {
    className: "text-blue-600 dark:text-blue-400 hover:underline",
  },
  strong: {
    className: "font-semibold text-gray-900 dark:text-gray-100",
  },
  em: {
    className: "italic text-gray-700 dark:text-gray-300",
  },
} satisfies MessageProps["components"];
