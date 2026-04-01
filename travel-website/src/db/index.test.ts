import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getTableName, sql } from "drizzle-orm";
import path from "path";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";

describe("Database connection", () => {
  it("creates a usable better-sqlite3 + drizzle connection with in-memory database", () => {
    const sqlite = new Database(":memory:");
    const db = drizzle(sqlite, { schema });

    const result = db.get<{ value: number }>(sql`SELECT 1 as value`);
    expect(result).toEqual({ value: 1 });

    sqlite.close();
  });
});

describe("Schema exports", () => {
  it("exports migrationsTest table with expected columns", () => {
    expect(schema.migrationsTest).toBeDefined();

    const tableConfig = schema.migrationsTest;
    expect(tableConfig.id).toBeDefined();
    expect(tableConfig.name).toBeDefined();

    // Verify table name via getTableName
    expect(getTableName(tableConfig)).toBe("_migrations_test");
  });
});

describe("Migration smoke test", () => {
  it("applies migrations and creates the expected table", () => {
    const sqlite = new Database(":memory:");
    const db = drizzle(sqlite, { schema });

    const migrationsFolder = path.resolve(__dirname, "../../drizzle");
    migrate(db, { migrationsFolder });

    const tables = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='_migrations_test'"
      )
      .all() as Array<{ name: string }>;

    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe("_migrations_test");

    // Verify we can insert and query using drizzle
    db.insert(schema.migrationsTest)
      .values({ name: "test-entry" })
      .run();

    const rows = db.select().from(schema.migrationsTest).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("test-entry");

    sqlite.close();
  });
});
