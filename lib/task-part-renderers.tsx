import type { ReactNode } from "react";
import { TaskItem, TaskItemFile } from "@/components/ai-elements/task";
import type {
  TaskPart,
  TaskPartChangedFile,
  TaskPartInspiration,
} from "@/types/chat";

// Renderer functions for each task type
function renderSearchQuery(part: TaskPart, index: number): ReactNode {
  return part.query ? (
    <TaskItem key={index}>Searching: "{part.query}"</TaskItem>
  ) : null;
}

function renderSelectFiles(part: TaskPart, index: number): ReactNode {
  if (!Array.isArray(part.filePaths)) {
    return null;
  }
  return (
    <TaskItem key={index}>
      Read{" "}
      {part.filePaths.map((file: string) => (
        <TaskItemFile key={file}>{file.split("/").pop()}</TaskItemFile>
      ))}
    </TaskItem>
  );
}

function renderReadingFile(part: TaskPart, index: number): ReactNode {
  return part.filePath ? (
    <TaskItem key={index}>
      Reading file <TaskItemFile>{part.filePath}</TaskItemFile>
    </TaskItem>
  ) : null;
}

function renderCodeProject(part: TaskPart, index: number): ReactNode {
  if (!part.changedFiles) {
    return null;
  }
  return (
    <TaskItem key={index}>
      Editing{" "}
      {part.changedFiles.map((file: TaskPartChangedFile) => (
        <TaskItemFile key={file.fileName || file.baseName || Math.random()}>
          {file.fileName || file.baseName}
        </TaskItemFile>
      ))}
    </TaskItem>
  );
}

function renderWebSearchAnswer(part: TaskPart, index: number): ReactNode {
  return part.answer ? (
    <TaskItem key={index}>
      <div className="text-gray-700 text-sm leading-relaxed dark:text-gray-300">
        {part.answer}
      </div>
    </TaskItem>
  ) : null;
}

function renderDesignInspiration(part: TaskPart, index: number): ReactNode {
  if (!Array.isArray(part.inspirations)) {
    return null;
  }
  return (
    <TaskItem key={index}>
      <div className="space-y-2">
        <div className="text-gray-700 text-sm dark:text-gray-300">
          Generated {part.inspirations.length} design inspirations
        </div>
        {part.inspirations
          .slice(0, 3)
          .map((inspiration: TaskPartInspiration, i: number) => (
            <div
              key={
                inspiration.title ||
                inspiration.description ||
                `inspiration-${i}`
              }
              className="rounded bg-gray-100 p-2 text-gray-600 text-xs dark:bg-gray-800 dark:text-gray-400"
            >
              {inspiration.title ||
                inspiration.description ||
                `Inspiration ${i + 1}`}
            </div>
          ))}
      </div>
    </TaskItem>
  );
}

function renderRequirementsComplete(part: TaskPart, index: number): ReactNode {
  return part.requirements ? (
    <TaskItem key={index}>
      <div className="text-gray-700 text-sm dark:text-gray-300">
        Analyzed{" "}
        {Array.isArray(part.requirements)
          ? part.requirements.length
          : "several"}{" "}
        requirements
      </div>
    </TaskItem>
  ) : null;
}

// Static task renderers (no conditional content)
const staticRenderers: Record<string, (index: number) => ReactNode> = {
  "fetching-diagnostics": (i) => (
    <TaskItem key={i}>Checking for issues...</TaskItem>
  ),
  "diagnostics-passed": (i) => <TaskItem key={i}>✓ No issues found</TaskItem>,
  "launch-tasks": (i) => <TaskItem key={i}>Starting tasks...</TaskItem>,
  "generating-design-inspiration": (i) => (
    <TaskItem key={i}>Generating design inspiration...</TaskItem>
  ),
  "analyzing-requirements": (i) => (
    <TaskItem key={i}>Analyzing requirements...</TaskItem>
  ),
  thinking: (i) => (
    <TaskItem key={i}>
      <div className="text-gray-600 text-sm italic dark:text-gray-400">
        Thinking...
      </div>
    </TaskItem>
  ),
  analyzing: (i) => (
    <TaskItem key={i}>
      <div className="text-gray-600 text-sm italic dark:text-gray-400">
        Thinking...
      </div>
    </TaskItem>
  ),
  processing: (i) => (
    <TaskItem key={i}>
      <div className="text-gray-600 text-sm dark:text-gray-400">
        Processing...
      </div>
    </TaskItem>
  ),
  working: (i) => (
    <TaskItem key={i}>
      <div className="text-gray-600 text-sm dark:text-gray-400">
        Processing...
      </div>
    </TaskItem>
  ),
  complete: (i) => (
    <TaskItem key={i}>
      <div className="text-green-600 text-sm dark:text-green-400">
        ✓ Complete
      </div>
    </TaskItem>
  ),
  finished: (i) => (
    <TaskItem key={i}>
      <div className="text-green-600 text-sm dark:text-green-400">
        ✓ Complete
      </div>
    </TaskItem>
  ),
};

// Dynamic task renderers (need part data)
const dynamicRenderers: Record<
  string,
  (part: TaskPart, index: number) => ReactNode
> = {
  "starting-repo-search": renderSearchQuery,
  "starting-web-search": renderSearchQuery,
  "select-files": renderSelectFiles,
  "reading-file": renderReadingFile,
  "code-project": renderCodeProject,
  "finished-web-search": renderWebSearchAnswer,
  "design-inspiration-complete": renderDesignInspiration,
  "requirements-complete": renderRequirementsComplete,
  "got-results": (part, i) =>
    part.count ? <TaskItem key={i}>Found {part.count} results</TaskItem> : null,
  error: (part, i) => (
    <TaskItem key={i}>
      <div className="text-red-600 text-sm dark:text-red-400">
        ✗ {part.error || part.message || "Task failed"}
      </div>
    </TaskItem>
  ),
  failed: (part, i) => (
    <TaskItem key={i}>
      <div className="text-red-600 text-sm dark:text-red-400">
        ✗ {part.error || part.message || "Task failed"}
      </div>
    </TaskItem>
  ),
};

/**
 * Renders a task part based on its type.
 * Returns a ReactNode to be rendered inside a TaskContent component.
 */
export function renderTaskPart(part: TaskPart, index: number): ReactNode {
  const { type } = part;

  // Check static renderers first
  const staticRenderer = staticRenderers[type];
  if (staticRenderer) {
    return staticRenderer(index);
  }

  // Check dynamic renderers
  const dynamicRenderer = dynamicRenderers[type];
  if (dynamicRenderer) {
    return dynamicRenderer(part, index);
  }

  return null;
}

/**
 * Renders a fallback for unknown task parts.
 */
export function renderFallbackTaskPart(
  part: TaskPart,
  index: number,
): ReactNode {
  const taskType = part.type || "unknown";
  const { status, message, description, text } = part;
  const displayMessage = message || description || text;

  if (displayMessage) {
    return (
      <TaskItem key={index}>
        <div className="text-gray-700 text-sm dark:text-gray-300">
          {displayMessage}
        </div>
      </TaskItem>
    );
  }

  if (status) {
    return (
      <TaskItem key={index}>
        <div className="text-gray-600 text-sm capitalize dark:text-gray-400">
          {status.replace(/-/g, " ")}...
        </div>
      </TaskItem>
    );
  }

  if (taskType !== "unknown") {
    const readableType = taskType
      .replace(/-/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .replace(/^\w/, (c: string) => c.toUpperCase());

    return (
      <TaskItem key={index}>
        <div className="text-gray-600 text-sm dark:text-gray-400">
          {readableType}
        </div>
      </TaskItem>
    );
  }

  return (
    <TaskItem key={index}>
      <details className="text-xs">
        <summary className="cursor-pointer text-gray-500 dark:text-gray-400">
          Unknown task part (click to expand)
        </summary>
        <div className="mt-2 rounded bg-gray-100 p-2 font-mono dark:bg-gray-800">
          {JSON.stringify(part, null, 2)}
        </div>
      </details>
    </TaskItem>
  );
}
