import { defineConfig } from "drizzle-kit";

import {
  DEFAULT_DATABASE_URL,
  ensureDatabaseDirectory,
  getDatabaseUrl,
  resolveSqliteDatabasePath,
} from "./src/db/config";

const databaseUrl = getDatabaseUrl(process.env, DEFAULT_DATABASE_URL);
ensureDatabaseDirectory(resolveSqliteDatabasePath(databaseUrl));

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
