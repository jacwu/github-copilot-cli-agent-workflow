import fs from "fs";
import os from "os";
import path from "path";

import Database from "better-sqlite3";
import { getTableName, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_DATABASE_URL,
  ensureDatabaseDirectory,
  getDatabaseUrl,
  resolveSqliteDatabasePath,
} from "@/db/config";
import * as schema from "@/db/schema";

const globalForDb = globalThis as typeof globalThis & {
  sqlite?: InstanceType<typeof Database>;
};

afterEach(() => {
  if (globalForDb.sqlite?.open) {
    globalForDb.sqlite.close();
  }

  delete globalForDb.sqlite;
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Database config", () => {
  it("requires DATABASE_URL and resolves file-based SQLite paths", () => {
    expect(() => getDatabaseUrl({} as NodeJS.ProcessEnv)).toThrow(
      "DATABASE_URL environment variable is not set"
    );
    expect(
      getDatabaseUrl({ DATABASE_URL: DEFAULT_DATABASE_URL } as NodeJS.ProcessEnv)
    ).toBe(DEFAULT_DATABASE_URL);
    expect(resolveSqliteDatabasePath(DEFAULT_DATABASE_URL)).toBe("./data/travel.db");
    expect(() => resolveSqliteDatabasePath(":memory:")).toThrow(
      "DATABASE_URL must start with file:"
    );
  });

  it("creates the parent directory for a SQLite database file", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "travel-db-config-"));
    const databasePath = path.join(tempRoot, "nested", "travel.db");

    ensureDatabaseDirectory(databasePath);

    expect(fs.existsSync(path.dirname(databasePath))).toBe(true);

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });
});

describe("Database connection", () => {
  it("creates a usable better-sqlite3 + drizzle connection with in-memory database", () => {
    const sqlite = new Database(":memory:");
    const db = drizzle(sqlite, { schema });

    const result = db.get<{ value: number }>(sql`SELECT 1 as value`);
    expect(result).toEqual({ value: 1 });

    sqlite.close();
  });

  it("exports a shared database client that creates its parent directory", async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "travel-db-module-"));
    const databasePath = path.join(tempRoot, "nested", "travel.db");

    vi.stubEnv("DATABASE_URL", `file:${databasePath}`);

    const { db, sqlite } = await import("./index");

    expect(db.get<{ value: number }>(sql`SELECT 1 as value`)).toEqual({ value: 1 });
    expect(fs.existsSync(path.dirname(databasePath))).toBe(true);
    expect(fs.existsSync(databasePath)).toBe(true);
    expect(globalForDb.sqlite).toBe(sqlite);

    sqlite.close();
    delete globalForDb.sqlite;
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });
});

describe("Schema exports", () => {
  it("exports migrationsTest table with expected columns", () => {
    expect(schema.migrationsTest).toBeDefined();

    const tableConfig = schema.migrationsTest;
    expect(tableConfig.id).toBeDefined();
    expect(tableConfig.name).toBeDefined();
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

    db.insert(schema.migrationsTest)
      .values({ name: "test-entry" })
      .run();

    const rows = db.select().from(schema.migrationsTest).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("test-entry");

    sqlite.close();
  });
});
