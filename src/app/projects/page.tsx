import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LoadErrorState, MissingKeyState } from "@/components/load-states";
import { ProjectsBrowser } from "@/features/projects/components/projects-browser";
import { ProjectsSkeleton } from "@/features/projects/components/projects-skeleton";
import { getProjectsByUserId } from "@/features/projects/server/get-projects";
import { requireSessionUserId } from "@/server/auth/session";
import { loadV0Data } from "@/server/v0/load-result";

export const metadata: Metadata = { title: "Projects" };

async function ProjectsContent() {
  const userId = await requireSessionUserId();
  const result = await loadV0Data(
    () => getProjectsByUserId(userId),
    "Failed to load projects",
  );

  if (result.status === "missing-key") {
    return <MissingKeyState resource="projects" />;
  }

  if (result.status === "error") {
    return <LoadErrorState title="Couldn't load your projects" />;
  }

  return <ProjectsBrowser projects={result.data} />;
}

export default function ProjectsPage() {
  return (
    <PageContainer header={<AppHeader />}>
      <PageHeader
        title="Projects"
        description="Every app you've generated, with a snapshot of its live preview."
      />
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </PageContainer>
  );
}
