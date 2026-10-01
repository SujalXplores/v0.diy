import type { Project } from "../types";

export function filterProjects(projects: Project[], query: string): Project[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return projects;
  }

  return projects.filter((project) =>
    project.name.toLowerCase().includes(normalizedQuery),
  );
}
