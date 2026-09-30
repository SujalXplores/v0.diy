import Link from "next/link";
import { formatRelativeTime } from "../lib/format-relative-time";
import type { Project } from "../types";
import { ProjectThumbnail } from "./project-thumbnail";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/chats/${project.id}`} className="group block">
      <div className="overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-lg dark:border-input dark:bg-zinc-900">
        <ProjectThumbnail demoUrl={project.demoUrl} name={project.name} />
        <div className="p-4">
          <h3 className="line-clamp-1 font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {project.name}
          </h3>
          {/* Relative time can differ by a tick between server and client. */}
          <p
            className="mt-1 text-gray-500 text-sm dark:text-gray-400"
            suppressHydrationWarning
          >
            Edited {formatRelativeTime(project.updatedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
