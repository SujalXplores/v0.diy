"use client";

import type { CodeProjectPartProps } from "@v0-sdk/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, FileEntry, FolderIcon } from "./file-icons";

/** Collapsible "Code Project" card replacing v0's default code project UI. */
export function CodeProjectPart({
  title,
  filename,
  collapsed,
  className,
  children,
}: CodeProjectPartProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed ?? true);

  return (
    <div
      className={cn(
        "my-6 rounded-lg border border-border dark:border-input",
        className,
      )}
    >
      <button
        onClick={() => setIsCollapsed((current) => !current)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        type="button"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center">
            <FolderIcon className="text-black dark:text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {title || "Code Project"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-gray-500 text-sm dark:text-gray-400">
            v1
          </span>
          <ChevronRightIcon
            className={cn(
              "text-gray-400 transition-transform",
              !isCollapsed && "rotate-90",
            )}
          />
        </div>
      </button>

      {!isCollapsed && (
        <div className="border-border border-t dark:border-input">
          {children || (
            <div className="p-4">
              <FileEntry name={filename || "app/page.tsx"} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
