import type { Project } from "../types";

/** Case-insensitive project name search. */
export function filterProjects(projects: Project[], query: string): Project[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return projects;
  }

  return projects.filter((project) =>
    project.name.toLowerCase().includes(normalizedQuery),
  );
}
