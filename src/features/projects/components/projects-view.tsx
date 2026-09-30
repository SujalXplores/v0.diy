"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { filterProjects } from "../lib/filter-projects";
import type { Project } from "../types";
import { ProjectGrid } from "./project-grid";
import { ProjectsHeader } from "./projects-header";

interface ProjectsViewProps {
  projects: Project[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProjects = filterProjects(projects, searchQuery);

  return (
    <PageContainer header={<AppHeader />}>
      <ProjectsHeader
        projectCount={filteredProjects.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ProjectGrid projects={filteredProjects} />
    </PageContainer>
  );
}
