import type { ReactNode } from "react";
import { TaskItem, TaskItemFile } from "@/components/ai-elements/task";
import type {
  TaskPart,
  TaskPartChangedFile,
  TaskPartInspiration,
} from "@/types/chat";

/**
 * Renders a task part based on its type.
 * Returns a ReactNode to be rendered inside a TaskContent component.
 */
export function renderTaskPart(part: TaskPart, index: number): ReactNode {
  const { type } = part;

  switch (type) {
    case "starting-repo-search":
      if (part.query) {
        return <TaskItem key={index}>Searching: "{part.query}"</TaskItem>;
      }
      break;

    case "select-files":
      if (Array.isArray(part.filePaths)) {
        return (
          <TaskItem key={index}>
            Read{" "}
            {part.filePaths.map((file: string) => (
              <TaskItemFile key={file}>{file.split("/").pop()}</TaskItemFile>
            ))}
          </TaskItem>
        );
      }
      break;

    case "fetching-diagnostics":
      return <TaskItem key={index}>Checking for issues...</TaskItem>;

    case "diagnostics-passed":
      return <TaskItem key={index}>✓ No issues found</TaskItem>;

    case "reading-file":
      if (part.filePath) {
        return (
          <TaskItem key={index}>
            Reading file <TaskItemFile>{part.filePath}</TaskItemFile>
          </TaskItem>
        );
      }
      break;

    case "code-project":
      if (part.changedFiles) {
        return (
          <TaskItem key={index}>
            Editing{" "}
            {part.changedFiles.map((file: TaskPartChangedFile) => (
              <TaskItemFile
                key={file.fileName || file.baseName || Math.random()}
              >
                {file.fileName || file.baseName}
              </TaskItemFile>
            ))}
          </TaskItem>
        );
      }
      break;

    case "launch-tasks":
      return <TaskItem key={index}>Starting tasks...</TaskItem>;

    case "starting-web-search":
      if (part.query) {
        return <TaskItem key={index}>Searching: "{part.query}"</TaskItem>;
      }
      break;

    case "got-results":
      if (part.count) {
        return <TaskItem key={index}>Found {part.count} results</TaskItem>;
      }
      break;

    case "finished-web-search":
      if (part.answer) {
        return (
          <TaskItem key={index}>
            <div className="text-gray-700 text-sm leading-relaxed dark:text-gray-300">
              {part.answer}
            </div>
          </TaskItem>
        );
      }
      break;

    case "generating-design-inspiration":
      return <TaskItem key={index}>Generating design inspiration...</TaskItem>;

    case "design-inspiration-complete":
      if (Array.isArray(part.inspirations)) {
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
      break;

    case "analyzing-requirements":
      return <TaskItem key={index}>Analyzing requirements...</TaskItem>;

    case "requirements-complete":
      if (part.requirements) {
        return (
          <TaskItem key={index}>
            <div className="text-gray-700 text-sm dark:text-gray-300">
              Analyzed{" "}
              {Array.isArray(part.requirements)
                ? part.requirements.length
                : "several"}{" "}
              requirements
            </div>
          </TaskItem>
        );
      }
      break;

    case "thinking":
    case "analyzing":
      return (
        <TaskItem key={index}>
          <div className="text-gray-600 text-sm italic dark:text-gray-400">
            Thinking...
          </div>
        </TaskItem>
      );

    case "processing":
    case "working":
      return (
        <TaskItem key={index}>
          <div className="text-gray-600 text-sm dark:text-gray-400">
            Processing...
          </div>
        </TaskItem>
      );

    case "complete":
    case "finished":
      return (
        <TaskItem key={index}>
          <div className="text-green-600 text-sm dark:text-green-400">
            ✓ Complete
          </div>
        </TaskItem>
      );

    case "error":
    case "failed":
      return (
        <TaskItem key={index}>
          <div className="text-red-600 text-sm dark:text-red-400">
            ✗ {part.error || part.message || "Task failed"}
          </div>
        </TaskItem>
      );
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
