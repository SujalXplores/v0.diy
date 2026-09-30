"use client";

import type { TaskSectionProps as V0TaskSectionProps } from "@v0-sdk/react";
import { Fragment } from "react";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@/components/ai-elements/task";
import { CodeProjectPart } from "./code-project-part";
import { FileEntry } from "./file-icons";
import { renderTaskPart } from "./task-part-renderers";
import {
  getChangedFileName,
  isTaskPart,
  type TaskPart,
  toTaskPart,
  toTaskTitle,
} from "./task-parts";

/** v0 streams a few task properties that aren't in the SDK's types. */
type TaskSectionProps = V0TaskSectionProps & {
  taskNameComplete?: string;
  taskNameActive?: string;
};

function renderPart(part: unknown) {
  if (typeof part === "string") {
    return <TaskItem>{part}</TaskItem>;
  }

  return typeof part === "object" && part !== null
    ? renderTaskPart(toTaskPart(part))
    : null;
}

function TaskSteps({
  title,
  parts,
  collapsed,
  onCollapse,
  children,
}: TaskSectionProps & { title: string }) {
  return (
    <Task
      className="mb-4 w-full"
      defaultOpen={!collapsed}
      onOpenChange={() => onCollapse?.()}
    >
      <TaskTrigger title={title} />
      <TaskContent>
        {parts?.map((part, index) => (
          <Fragment
            // Parts are append-only streamed content without IDs, so their
            // position is their identity.
            // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
            key={index} // react-doctor-disable-line react-doctor/no-array-index-as-key
          >
            {renderPart(part)}
          </Fragment>
        ))}
        {children && <TaskItem>{children}</TaskItem>}
      </TaskContent>
    </Task>
  );
}

function CodeProjectTask({
  title,
  codeProject,
}: {
  title: string;
  codeProject: TaskPart;
}) {
  const fileNames = (codeProject.changedFiles ?? []).map(
    (file, index) => getChangedFileName(file) || `file-${index + 1}`,
  );

  return (
    <CodeProjectPart
      title={title}
      filename={fileNames[0] ?? "project"}
      code={codeProject.source ?? ""}
      language="typescript"
      collapsed={false}
    >
      {fileNames.length > 0 && (
        <div className="space-y-2 p-4">
          {fileNames.map((name) => (
            <FileEntry key={name} name={name} />
          ))}
        </div>
      )}
    </CodeProjectPart>
  );
}

function getTaskTitle(props: TaskSectionProps): string {
  if (props.title) {
    return props.title;
  }

  if (props.type === "task-generate-design-inspiration-v1") {
    return "Generating Design Inspiration";
  }

  if (props.type?.startsWith("task-") && props.type.endsWith("-v1")) {
    return (
      props.taskNameComplete || props.taskNameActive || toTaskTitle(props.type)
    );
  }

  return props.type || "Task";
}

/**
 * Renders v0 task sections: code projects as a file list, everything else
 * as a collapsible list of steps.
 */
export function TaskSection(props: TaskSectionProps) {
  const codeProject = props.parts?.find(
    (part): part is TaskPart =>
      isTaskPart(part) && part.type === "code-project",
  );

  if (codeProject) {
    return (
      <CodeProjectTask
        title={props.title || "Code Project"}
        codeProject={codeProject}
      />
    );
  }

  return <TaskSteps {...props} title={getTaskTitle(props)} />;
}
