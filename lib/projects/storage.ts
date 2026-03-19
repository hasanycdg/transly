import type { ProjectRecord } from "@/types/projects";

const STORAGE_KEY = "translayr.custom-projects";

export function loadStoredProjects(): ProjectRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as ProjectRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredProjects(projects: ProjectRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
