"use client";

import { useParams } from "next/navigation";

import { ProjectWorkspaceScreen } from "@/components/projects/project-workspace-screen";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();

  return <ProjectWorkspaceScreen projectId={params.projectId} />;
}
