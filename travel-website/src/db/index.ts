import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import {
  ensureDatabaseDirectory,
  getDatabaseUrl,
  resolveSqliteDatabasePath,
} from "@/db/config";
import * as schema from "@/db/schema";

const dbPath = resolveSqliteDatabasePath(getDatabaseUrl());
ensureDatabaseDirectory(dbPath);

const globalForDb = globalThis as unknown as {
  sqlite: ReturnType<typeof Database> | undefined;
};

const sqlite = globalForDb.sqlite ?? new Database(dbPath);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

const db = drizzle(sqlite, { schema });

export { db, sqlite };
