"use client";

import { useState } from "react";
import { ListToolbar } from "@/components/layout/list-toolbar";
import { SearchField } from "@/components/search-field";
import { filterProjects } from "../lib/filter-projects";
import type { Project } from "../types";
import { NewProjectButton } from "./new-project-button";
import { ProjectCard } from "./project-card";
import { ProjectsEmptyState, ProjectsNoResults } from "./projects-empty-state";

interface ProjectsBrowserProps {
  projects: Project[];
}

export function ProjectsBrowser({ projects }: ProjectsBrowserProps) {
  const [query, setQuery] = useState("");

  if (projects.length === 0) {
    return <ProjectsEmptyState />;
  }

  const visibleProjects = filterProjects(projects, query);
  const isFiltering = query.trim().length > 0;

  return (
    <>
      <ListToolbar
        search={
          <SearchField
            value={query}
            onValueChange={setQuery}
            placeholder="Search projects..."
          />
        }
        summary={
          isFiltering
            ? `${visibleProjects.length} of ${projects.length}`
            : `${projects.length} ${projects.length === 1 ? "project" : "projects"}`
        }
        action={<NewProjectButton />}
      />

      {visibleProjects.length === 0 ? (
        <ProjectsNoResults query={query.trim()} onClear={() => setQuery("")} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProjects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
