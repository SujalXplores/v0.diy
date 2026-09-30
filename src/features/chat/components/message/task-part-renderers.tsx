import type { ReactNode } from "react";
import { TaskItem, TaskItemFile } from "@/components/ai-elements/task";
import {
  getChangedFileName,
  type TaskPart,
  toReadableLabel,
} from "./task-parts";

const MAX_INSPIRATIONS_SHOWN = 3;

function MutedText({ children }: { children: ReactNode }) {
  return (
    <div className="text-gray-600 text-sm dark:text-gray-400">{children}</div>
  );
}

function BodyText({ children }: { children: ReactNode }) {
  return (
    <div className="text-gray-700 text-sm dark:text-gray-300">{children}</div>
  );
}

const thinkingItem = (
  <TaskItem>
    <div className="text-gray-600 text-sm italic dark:text-gray-400">
      Thinking...
    </div>
  </TaskItem>
);

const processingItem = (
  <TaskItem>
    <MutedText>Processing...</MutedText>
  </TaskItem>
);

const completeItem = (
  <TaskItem>
    <div className="text-green-600 text-sm dark:text-green-400">✓ Complete</div>
  </TaskItem>
);

// Maps (not object literals) so unexpected types like "constructor" can't
// resolve to Object.prototype members.

/** Task parts whose rendering doesn't depend on their data. */
const STATIC_TASK_PARTS = new Map<string, ReactNode>([
  ["fetching-diagnostics", <TaskItem>Checking for issues...</TaskItem>],
  ["diagnostics-passed", <TaskItem>✓ No issues found</TaskItem>],
  ["launch-tasks", <TaskItem>Starting tasks...</TaskItem>],
  [
    "generating-design-inspiration",
    <TaskItem>Generating design inspiration...</TaskItem>,
  ],
  ["analyzing-requirements", <TaskItem>Analyzing requirements...</TaskItem>],
  ["thinking", thinkingItem],
  ["analyzing", thinkingItem],
  ["processing", processingItem],
  ["working", processingItem],
  ["complete", completeItem],
  ["finished", completeItem],
]);

function renderSearchQuery(part: TaskPart): ReactNode {
  return part.query ? <TaskItem>Searching: "{part.query}"</TaskItem> : null;
}

function renderSelectFiles(part: TaskPart): ReactNode {
  if (!Array.isArray(part.filePaths)) {
    return null;
  }

  return (
    <TaskItem>
      Read{" "}
      {part.filePaths.map((filePath) => (
        <TaskItemFile key={filePath}>{filePath.split("/").pop()}</TaskItemFile>
      ))}
    </TaskItem>
  );
}

function renderReadingFile(part: TaskPart): ReactNode {
  return part.filePath ? (
    <TaskItem>
      Reading file <TaskItemFile>{part.filePath}</TaskItemFile>
    </TaskItem>
  ) : null;
}

function renderCodeProject(part: TaskPart): ReactNode {
  if (!part.changedFiles) {
    return null;
  }

  const fileNames = part.changedFiles
    .map(getChangedFileName)
    .filter((name): name is string => Boolean(name));

  return (
    <TaskItem>
      Editing{" "}
      {[...new Set(fileNames)].map((name) => (
        <TaskItemFile key={name}>{name}</TaskItemFile>
      ))}
    </TaskItem>
  );
}

function renderWebSearchAnswer(part: TaskPart): ReactNode {
  return part.answer ? (
    <TaskItem>
      <div className="text-gray-700 text-sm leading-relaxed dark:text-gray-300">
        {part.answer}
      </div>
    </TaskItem>
  ) : null;
}

function renderDesignInspiration(part: TaskPart): ReactNode {
  if (!Array.isArray(part.inspirations)) {
    return null;
  }

  const labels = part.inspirations
    .slice(0, MAX_INSPIRATIONS_SHOWN)
    .map(
      (inspiration, index) =>
        inspiration.title ||
        inspiration.description ||
        `Inspiration ${index + 1}`,
    );

  return (
    <TaskItem>
      <div className="space-y-2">
        <BodyText>
          Generated {part.inspirations.length} design inspirations
        </BodyText>
        {labels.map((label) => (
          <div
            key={label}
            className="rounded bg-gray-100 p-2 text-gray-600 text-xs dark:bg-gray-800 dark:text-gray-400"
          >
            {label}
          </div>
        ))}
      </div>
    </TaskItem>
  );
}

function renderRequirementsComplete(part: TaskPart): ReactNode {
  if (!part.requirements) {
    return null;
  }

  const count = Array.isArray(part.requirements)
    ? part.requirements.length
    : "several";

  return (
    <TaskItem>
      <BodyText>Analyzed {count} requirements</BodyText>
    </TaskItem>
  );
}

function renderSearchResults(part: TaskPart): ReactNode {
  return part.count ? <TaskItem>Found {part.count} results</TaskItem> : null;
}

function renderFailure(part: TaskPart): ReactNode {
  return (
    <TaskItem>
      <div className="text-red-600 text-sm dark:text-red-400">
        ✗ {part.error || part.message || "Task failed"}
      </div>
    </TaskItem>
  );
}

/** Task parts rendered from their data. */
const DYNAMIC_TASK_PARTS = new Map<string, (part: TaskPart) => ReactNode>([
  ["starting-repo-search", renderSearchQuery],
  ["starting-web-search", renderSearchQuery],
  ["select-files", renderSelectFiles],
  ["reading-file", renderReadingFile],
  ["code-project", renderCodeProject],
  ["finished-web-search", renderWebSearchAnswer],
  ["design-inspiration-complete", renderDesignInspiration],
  ["requirements-complete", renderRequirementsComplete],
  ["got-results", renderSearchResults],
  ["error", renderFailure],
  ["failed", renderFailure],
]);

/** Generic rendering for task part types without a dedicated renderer. */
function renderFallbackTaskPart(part: TaskPart): ReactNode {
  const displayMessage = part.message || part.description || part.text;

  if (displayMessage) {
    return (
      <TaskItem>
        <BodyText>{displayMessage}</BodyText>
      </TaskItem>
    );
  }

  if (part.status) {
    return (
      <TaskItem>
        <div className="text-gray-600 text-sm capitalize dark:text-gray-400">
          {part.status.replace(/-/g, " ")}...
        </div>
      </TaskItem>
    );
  }

  if (part.type && part.type !== "unknown") {
    return (
      <TaskItem>
        <MutedText>{toReadableLabel(part.type)}</MutedText>
      </TaskItem>
    );
  }

  return (
    <TaskItem>
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

/** Renders one step of a v0 task section. */
export function renderTaskPart(part: TaskPart): ReactNode {
  const staticPart = STATIC_TASK_PARTS.get(part.type);
  if (staticPart) {
    return staticPart;
  }

  return (
    DYNAMIC_TASK_PARTS.get(part.type)?.(part) ?? renderFallbackTaskPart(part)
  );
}
