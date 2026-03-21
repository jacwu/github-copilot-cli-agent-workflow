// @vitest-environment node
import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { createDatabase } from "./index";
import { migrationsTest } from "./schema";

function makeTempDbUrl(): { url: string; dir: string } {
  const dir = join(tmpdir(), `db-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return { url: `file:${join(dir, "test.db")}`, dir };
}

function cleanup(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("createDatabase", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      cleanup(dir);
    }
    tempDirs.length = 0;
  });

  it("throws when URL is empty", () => {
    expect(() => createDatabase("")).toThrow("DATABASE_URL is required");
  });

  it("throws when URL is only whitespace", () => {
    expect(() => createDatabase("   ")).toThrow("DATABASE_URL is required");
  });

  it("strips file: prefix and connects successfully", () => {
    const { url, dir } = makeTempDbUrl();
    tempDirs.push(dir);

    const db = createDatabase(url);
    const result = db.get(sql`SELECT 1 as value`);
    expect(result).toEqual({ value: 1 });
  });

  it("connects without file: prefix", () => {
    const { dir } = makeTempDbUrl();
    tempDirs.push(dir);
    const plainPath = join(dir, "plain.db");

    const db = createDatabase(plainPath);
    const result = db.get(sql`SELECT 1 as value`);
    expect(result).toEqual({ value: 1 });
  });

  it("creates parent directories if they do not exist", () => {
    const base = join(tmpdir(), `db-test-${randomUUID()}`);
    const nested = join(base, "nested", "deep");
    tempDirs.push(base);
    const url = `file:${join(nested, "test.db")}`;

    const db = createDatabase(url);
    expect(db).toBeDefined();
    expect(existsSync(nested)).toBe(true);
  });

  it("supports schema integration with placeholder table after migration", () => {
    const { url, dir } = makeTempDbUrl();
    tempDirs.push(dir);

    const db = createDatabase(url);
    migrate(db, { migrationsFolder: "./drizzle" });

    db.insert(migrationsTest).values({ name: "test-entry" }).run();

    const rows = db.select().from(migrationsTest).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("test-entry");
    expect(rows[0].id).toBe(1);
  });
});
