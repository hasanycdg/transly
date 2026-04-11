const pendingUploadsByProjectSlug = new Map<string, File[]>();

export function setPendingProjectUploads(projectSlug: string, files: File[]) {
  if (!projectSlug) {
    return;
  }

  pendingUploadsByProjectSlug.set(projectSlug, [...files]);
}

export function takePendingProjectUploads(projectSlug: string): File[] {
  if (!projectSlug) {
    return [];
  }

  const files = pendingUploadsByProjectSlug.get(projectSlug) ?? [];
  pendingUploadsByProjectSlug.delete(projectSlug);
  return files;
}
