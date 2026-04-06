import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

type LoadEnvironmentResult = {
  loadedPaths: string[];
};

function uniqueExistingPaths(paths: string[]) {
  const seen = new Set<string>();
  const existing: string[] = [];

  for (const candidate of paths) {
    const absolute = path.resolve(candidate);
    if (seen.has(absolute)) {
      continue;
    }
    seen.add(absolute);

    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) {
      existing.push(absolute);
    }
  }

  return existing;
}

export function loadEnvironmentFiles(): LoadEnvironmentResult {
  const backendRoot = path.resolve(__dirname, "..", "..");
  const repoRoot = path.resolve(backendRoot, "..");

  const explicitEnvFile = process.env.ENV_FILE?.trim();
  const candidates = uniqueExistingPaths([
    ...(explicitEnvFile ? [path.isAbsolute(explicitEnvFile) ? explicitEnvFile : path.resolve(process.cwd(), explicitEnvFile)] : []),
    path.join(backendRoot, ".env.local"),
    path.join(backendRoot, ".env"),
    path.join(repoRoot, ".env.local"),
    path.join(repoRoot, ".env")
  ]);

  const loadedPaths: string[] = [];

  for (const candidate of candidates) {
    const result = dotenv.config({ path: candidate, override: false });
    if (!result.error) {
      loadedPaths.push(candidate);
    }
  }

  return { loadedPaths };
}
