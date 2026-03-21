import path from "node:path";
import { mkdirSync } from "node:fs";

import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

function normalizeDatabaseUrl(url: string): string {
  const trimmedUrl = url.trim();

  return trimmedUrl.startsWith("file:") ? trimmedUrl.slice(5) : trimmedUrl;
}

export function createDatabase(
  url: string
): BetterSQLite3Database<typeof schema> {
  if (!url || url.trim() === "") {
    throw new Error(
      "DATABASE_URL is required. Set it in .env.local (see .env.example)."
    );
  }

  const filePath = normalizeDatabaseUrl(url);

  const dir = path.dirname(filePath);
  mkdirSync(dir, { recursive: true });

  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  return drizzle(sqlite, { schema });
}

let _db: BetterSQLite3Database<typeof schema> | undefined;

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!_db) {
    _db = createDatabase(process.env.DATABASE_URL ?? "");
  }
  return _db;
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
