import { ProjectsOverviewScreen } from "@/components/projects/projects-overview-screen";
import { getProjectsOverviewRecords } from "@/lib/supabase/workspace";

export default async function ProjectsPage() {
  const projects = await getProjectsOverviewRecords();

  return <ProjectsOverviewScreen initialProjects={projects} />;
}
