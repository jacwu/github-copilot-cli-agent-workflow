import fs from "fs";
import path from "path";

export const DEFAULT_DATABASE_URL = "file:./data/travel.db";

export function getDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
  fallback?: string
): string {
  const databaseUrl = env.DATABASE_URL ?? fallback;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return databaseUrl;
}

export function resolveSqliteDatabasePath(databaseUrl: string): string {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("DATABASE_URL must start with file:");
  }

  return databaseUrl.slice("file:".length);
}

export function ensureDatabaseDirectory(databasePath: string): void {
  const databaseDirectory = path.dirname(databasePath);

  if (!fs.existsSync(databaseDirectory)) {
    fs.mkdirSync(databaseDirectory, { recursive: true });
  }
}
