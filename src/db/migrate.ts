import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { createDatabase } from "./index";

const url = process.env.DATABASE_URL ?? "";

const db = createDatabase(url);

migrate(db, { migrationsFolder: "./drizzle" });

console.log("Migrations applied successfully.");
