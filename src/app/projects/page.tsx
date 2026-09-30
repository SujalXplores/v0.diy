import { redirect } from "next/navigation";
import { ProjectsView } from "@/features/projects/components/projects-view";
import { getProjectsByUserId } from "@/features/projects/server/get-projects";
import { auth } from "@/server/auth/auth";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await getProjectsByUserId(session.user.id);

  return <ProjectsView projects={projects} />;
}
