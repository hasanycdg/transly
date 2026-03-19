import { ProjectWorkspaceScreen } from "@/components/projects/project-workspace-screen";
import { getProjectRecordBySlug } from "@/lib/supabase/workspace";

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProjectRecordBySlug(projectId);

  return <ProjectWorkspaceScreen project={project} />;
}
