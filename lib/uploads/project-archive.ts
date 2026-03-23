import JSZip from "jszip";

export type PreparedProjectUploadFile = {
  file: File;
  name: string;
  sourceArchiveName?: string;
};

export type ExpandedProjectUploadSelection = {
  files: PreparedProjectUploadFile[];
  archives: Array<{
    archiveName: string;
    extractedCount: number;
    ignoredCount: number;
  }>;
};

const ZIP_FILE_PATTERN = /\.zip$/i;
const PROJECT_UPLOAD_FILE_PATTERN = /\.(xliff|xlf|po|strings|resx)$/i;

export function isZipFileName(fileName: string) {
  return ZIP_FILE_PATTERN.test(fileName);
}

export function isAcceptedProjectUploadFile(fileName: string) {
  return PROJECT_UPLOAD_FILE_PATTERN.test(fileName);
}

export async function expandProjectUploadSelection(
  rawFiles: File[]
): Promise<ExpandedProjectUploadSelection> {
  const files: PreparedProjectUploadFile[] = [];
  const archives: ExpandedProjectUploadSelection["archives"] = [];

  for (const rawFile of rawFiles) {
    if (!isZipFileName(rawFile.name)) {
      files.push({
        file: rawFile,
        name: rawFile.name
      });
      continue;
    }

    let archive: Awaited<ReturnType<typeof JSZip.loadAsync>>;

    try {
      archive = await JSZip.loadAsync(await rawFile.arrayBuffer());
    } catch {
      throw new Error(`"${rawFile.name}" could not be opened as a ZIP archive.`);
    }

    let extractedCount = 0;
    let ignoredCount = 0;

    for (const entryName of Object.keys(archive.files)) {
      const entry = archive.files[entryName];

      if (!entry) {
        continue;
      }

      if (entry.dir) {
        continue;
      }

      const normalizedPath = normalizeRelativeArchivePath(entry.name);

      if (!normalizedPath || shouldIgnoreArchiveEntry(normalizedPath)) {
        ignoredCount += 1;
        continue;
      }

      if (!isAcceptedProjectUploadFile(normalizedPath)) {
        ignoredCount += 1;
        continue;
      }

      const content = await entry.async("uint8array");
      const fileBuffer = new ArrayBuffer(content.byteLength);
      new Uint8Array(fileBuffer).set(content);

      files.push({
        file: new File([fileBuffer], getBaseName(normalizedPath), {
          type: getMimeType(normalizedPath),
          lastModified: rawFile.lastModified || Date.now()
        }),
        name: normalizedPath,
        sourceArchiveName: rawFile.name
      });
      extractedCount += 1;
    }

    archives.push({
      archiveName: rawFile.name,
      extractedCount,
      ignoredCount
    });
  }

  return {
    files,
    archives
  };
}

export function buildTranslatedArchivePath(sourcePath: string, translatedFileName: string) {
  const normalizedSourcePath = normalizeRelativeArchivePath(sourcePath);

  if (!normalizedSourcePath) {
    return translatedFileName;
  }

  const parts = normalizedSourcePath.split("/");
  parts.pop();

  return parts.length > 0 ? `${parts.join("/")}/${translatedFileName}` : translatedFileName;
}

export function createUniqueArchivePaths(
  outputs: Array<{
    preferredPath: string;
    sourcePath: string;
  }>
) {
  const usedPaths = new Set<string>();

  return outputs.map(({ preferredPath, sourcePath }) => {
    const normalizedPreferredPath = normalizeRelativeArchivePath(preferredPath) || preferredPath;
    const preferredKey = normalizedPreferredPath.toLowerCase();

    if (!usedPaths.has(preferredKey)) {
      usedPaths.add(preferredKey);
      return normalizedPreferredPath;
    }

    const sourceHint = sanitizeArchivePathSegment(stripExtension(getBaseName(sourcePath)) || "file");
    let candidate = appendSuffixToPath(normalizedPreferredPath, `-${sourceHint}`);
    let counter = 2;

    while (usedPaths.has(candidate.toLowerCase())) {
      candidate = appendSuffixToPath(normalizedPreferredPath, `-${sourceHint}-${counter}`);
      counter += 1;
    }

    usedPaths.add(candidate.toLowerCase());
    return candidate;
  });
}

function appendSuffixToPath(path: string, suffix: string) {
  const normalizedPath = normalizeRelativeArchivePath(path) || path;
  const parts = normalizedPath.split("/");
  const fileName = parts.pop() ?? normalizedPath;
  const { baseName, extension } = splitFileName(fileName);
  const nextFileName = `${baseName}${suffix}${extension}`;

  return parts.length > 0 ? `${parts.join("/")}/${nextFileName}` : nextFileName;
}

function splitFileName(fileName: string) {
  const match = fileName.match(/^(.*?)(\.[^.]*)?$/);

  return {
    baseName: match?.[1] ?? fileName,
    extension: match?.[2] ?? ""
  };
}

function stripExtension(fileName: string) {
  return splitFileName(fileName).baseName;
}

function getBaseName(filePath: string) {
  const normalizedPath = normalizeRelativeArchivePath(filePath);

  if (!normalizedPath) {
    return "";
  }

  const parts = normalizedPath.split("/");
  return parts[parts.length - 1] ?? normalizedPath;
}

function sanitizeArchivePathSegment(value: string) {
  const sanitized = value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "");
  return sanitized.length > 0 ? sanitized : "file";
}

function shouldIgnoreArchiveEntry(filePath: string) {
  const parts = normalizeRelativeArchivePath(filePath).split("/").filter(Boolean);
  const lastPart = parts[parts.length - 1] ?? "";

  return parts.includes("__MACOSX") || lastPart === ".DS_Store";
}

function normalizeRelativeArchivePath(filePath: string) {
  const sanitized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = sanitized.split("/");
  const normalizedParts: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      continue;
    }

    normalizedParts.push(part);
  }

  return normalizedParts.join("/");
}

function getMimeType(fileName: string) {
  if (/\.(xliff|xlf)$/i.test(fileName)) {
    return "application/xliff+xml";
  }

  if (/\.po$/i.test(fileName)) {
    return "text/plain";
  }

  if (/\.strings$/i.test(fileName)) {
    return "text/plain";
  }

  if (/\.resx$/i.test(fileName)) {
    return "application/xml";
  }

  return "application/octet-stream";
}
