# Task 2: Configure Database and ORM

## Background

Issue #38 establishes the application's persistence foundation by integrating SQLite and Drizzle ORM into the existing Next.js project under `travel-website/`. The repository-level design (`docs/design.md`) standardizes on SQLite with `better-sqlite3` and Drizzle ORM, and reserves `src/db/index.ts`, `src/db/schema.ts`, `src/db/seed.ts`, and `drizzle.config.ts` for data-layer concerns.

The application scaffold (Task 1) is complete: Next.js 15, Tailwind CSS 4, shadcn/ui, and Vitest are configured and working. `travel-website/package.json` contains core Next.js, Tailwind, and Vitest dependencies. There are no database-related packages, no `src/db/` directory, no `drizzle.config.ts`, and no migration-related npm scripts.

This task introduces the full persistence bootstrap so that subsequent tasks (Task 3: schema definitions, Task 4: authentication, Task 6: seed data, etc.) can build on a predictable and tested data layer.

## Goal

Create a stable, local-first database foundation for the travel website by defining:

- how SQLite is connected from the Next.js app,
- how Drizzle ORM models and exports the schema,
- how migrations are generated and applied,
- where the database file and migration artifacts live,
- and what scripts/configuration are required so future tasks can build on a predictable persistence layer.

## Non-Goals

- **Defining the full application schema.** This task creates `src/db/schema.ts` with only a minimal placeholder table to validate the migration workflow. The four core tables (`users`, `destinations`, `trips`, `trip_stops`) are the scope of Task 3: "Define Core Data Models."
- Implementing feature-specific repositories, API routes, or business logic.
- Populating production-ready seed data (Task 6).
- Building authentication flows (Tasks 4–5), destination queries (Tasks 7–8), or trip management features (Tasks 9–10).
- Introducing a hosted database or multi-environment database platform.
- Designing runtime admin tooling or a database browser UI.

## Current State

### Repository alignment

The repository-wide documents already define the intended stack and structure:

- `docs/design.md` specifies SQLite via `better-sqlite3` and Drizzle ORM.
- `docs/design.md` reserves `travel-website/src/db/index.ts` for the database connection and `travel-website/src/db/schema.ts` for schema definitions.
- The same document expects a root-level `travel-website/drizzle.config.ts` file.
- The data model is already described at a high level with `users`, `destinations`, `trips`, and `trip_stops` tables (but those belong to Task 3).

### Observed codebase status

Verified against the current scaffold:

- `travel-website/package.json` dependencies: `next@^15.5.14`, `react@19.2.4`, `class-variance-authority`, `clsx`, `tailwind-merge`. Dev deps: `@tailwindcss/postcss@^4`, `@vitejs/plugin-react@^6.0.1`, `eslint`, `eslint-config-next`, `tailwindcss@^4`, `typescript@^5`, `vitest@^4.1.0`.
- npm scripts: `dev`, `build`, `start`, `lint`, `test` (runs `vitest run`).
- `tsconfig.json` has `strict: true`, path alias `@/*` → `./src/*`, and `module: "esnext"` with `moduleResolution: "bundler"`.
- `vitest.config.ts` uses the `@vitejs/plugin-react` plugin, `environment: "node"`, includes `src/**/*.test.ts` and `src/**/*.test.tsx`, and mirrors the `@` path alias.
- `.gitignore` excludes `.env*`, `.next/`, `node_modules/`, but has no entries for database files or the `data/` directory.
- The `src/` directory contains `app/`, `components/ui/`, and `lib/` (with `utils.ts` and `utils.test.ts`). No `src/db/` directory exists.

## Proposed Design

### 1. Data-layer package selection

Install the following packages in `travel-website/`:

- Runtime dependencies:
  - `drizzle-orm`
  - `better-sqlite3`
- Development dependencies:
  - `drizzle-kit`
  - `@types/better-sqlite3`

This matches `docs/design.md`, keeps SQLite embedded for local development, and provides a type-safe ORM with migration tooling. All packages must be installed via `npm install` to keep `package-lock.json` in sync.

### 2. Database file location and environment strategy

Use a file-based SQLite database stored inside the application workspace, with a configurable path provided through an environment variable.

Configuration:

- Environment variable: `DATABASE_URL`
- Default local value: `file:./data/travel.db`

Design details:

- The value is a file path (prefixed with `file:` per Drizzle convention for SQLite) pointing to the SQLite database file.
- The app treats `DATABASE_URL` as the single source of truth so the file location can change without code changes.
- A dedicated `travel-website/data/` directory keeps database artifacts out of `src/` and avoids mixing runtime data with source code.
- Path resolution is centralized in `src/db/index.ts` so both Drizzle config and the runtime connection target the same file.

Files to create/update:

- **`travel-website/.env.local`** — local development env file containing `DATABASE_URL=file:./data/travel.db`. This file is already excluded from version control by the existing `.env*` gitignore rule.
- **`travel-website/.gitignore`** — append `data/` to exclude SQLite database files from source control.

### 3. Connection module

Create `travel-website/src/db/index.ts` as the dedicated database entry module.

Responsibilities:

- Read `DATABASE_URL` from `process.env`, stripping the `file:` prefix to get the raw file path.
- Ensure the parent directory for the database file exists (create it if missing).
- Open a `better-sqlite3` connection using the resolved file path.
- Wrap the connection with `drizzle()` from `drizzle-orm/better-sqlite3` and export a shared `db` client.
- Export the raw `better-sqlite3` connection as `sqlite` for low-level needs (e.g., migration tooling, test teardown).

HMR-safe singleton pattern (critical for Next.js development):

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const dbPath = DATABASE_URL.replace(/^file:/, "");

const globalForDb = globalThis as unknown as {
  sqlite: ReturnType<typeof Database> | undefined;
};

const sqlite = globalForDb.sqlite ?? new Database(dbPath);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

const db = drizzle(sqlite, { schema });

export { db, sqlite };
```

Key design decisions:

- **`globalThis` caching**: During development, Next.js HMR re-evaluates modules. Without caching the connection on `globalThis`, each reload would open a new SQLite file handle, leaking connections. The `globalThis` pattern ensures a single connection per process survives HMR cycles. In production, modules are evaluated once, so the guard is a no-op.
- **Fail-fast**: The module throws immediately if `DATABASE_URL` is unset, surfacing configuration errors at startup rather than at first query.
- **Schema import**: Passing `schema` to `drizzle()` enables the relational query API for later tasks.
- **Server-only**: This module must never be imported from client components. No `"use client"` directive.

### 4. Schema module structure

Create `travel-website/src/db/schema.ts` with a **minimal placeholder table** to validate the migration workflow end-to-end.

```typescript
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const migrations_test = sqliteTable("_migrations_test", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
```

**Why a placeholder instead of the full schema:**

- Task 3 ("Define Core Data Models") is explicitly scoped to create the `users`, `destinations`, `trips`, and `trip_stops` tables with all relationships, constraints, and types from `docs/design.md`.
- Including the full schema here would duplicate Task 3's scope, making that task a no-op or creating merge conflicts.
- The placeholder is sufficient to verify that `drizzle-kit generate`, `drizzle-kit migrate`, schema exports, and the connection module all work correctly.
- Task 3 will replace this placeholder with the real tables and generate a new migration.

### 5. Drizzle configuration

Create `travel-website/drizzle.config.ts` using the `defineConfig` helper from `drizzle-kit`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./data/travel.db",
  },
});
```

Configuration details:

- **`schema`**: points to the schema definition file.
- **`out`**: migration SQL files are written to `travel-website/drizzle/`. This directory is checked into version control so schema history is auditable.
- **`dialect`**: `"sqlite"` — selects the SQLite driver.
- **`dbCredentials.url`**: reads from `DATABASE_URL` with a fallback for convenience. Drizzle Kit accepts the `file:` prefix for SQLite.

### 6. Migration workflow

The migration workflow uses Drizzle Kit CLI commands:

1. **Generate**: `npx drizzle-kit generate` reads `schema.ts`, compares against existing migrations in `drizzle/`, and creates new SQL migration files.
2. **Migrate**: `npx drizzle-kit migrate` applies pending migration files to the SQLite database.

Why migrations instead of `drizzle-kit push`:

- Migration files create a durable, auditable history of schema evolution.
- Future tasks (auth tables, schema changes) get a safe, incremental migration path.
- `push` is useful as a convenience during rapid iteration but should not be the sole strategy for a multi-task project.

### 7. npm script contract

Extend `travel-website/package.json` scripts:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

- **`db:generate`** — generates new migration files from schema changes.
- **`db:migrate`** — applies pending migrations to the configured SQLite database.
- **`db:studio`** — opens the Drizzle Studio UI for local database inspection (optional convenience).

The `db:seed` script is **not** added in this task; it belongs to Task 6 ("Prepare Destination Seed Data and Image Assets").

### 8. `.gitignore` updates

Append the following to `travel-website/.gitignore`:

```
# database
data/
```

This keeps the SQLite database file (`data/travel.db`) out of version control while the `drizzle/` migration directory remains tracked.

### 9. Testing approach

The project follows TDD. Although this task is infrastructure-oriented, it needs test coverage for the project's integration contract.

**Test file**: `travel-website/src/db/index.test.ts`

Recommended test coverage:

1. **Connection creation test** — create a `better-sqlite3` connection against an in-memory database (`:memory:`), wrap it with `drizzle()`, and verify the client is usable (e.g., run a trivial `SELECT 1`).
2. **Schema export test** — import `src/db/schema.ts` and verify the placeholder table export exists and has the expected structure.
3. **Migration smoke test** — apply the generated migrations to a temporary in-memory or temp-file SQLite database using the programmatic `migrate()` function from `drizzle-orm/better-sqlite3/migrator`, then verify the expected table exists via a raw SQL query.

Test isolation strategy:

- Tests must **not** depend on or modify the development database (`data/travel.db`).
- Use `:memory:` SQLite databases or `os.tmpdir()`-based temp files that are cleaned up after each test.
- Each test creates its own `better-sqlite3` connection, independent of the singleton in `src/db/index.ts`.

Testing boundaries:

- Do not test Drizzle ORM internals (e.g., query building, SQL generation).
- Focus on the project's own integration points: env-based config resolution, exported client availability, and successful migration application.

### 10. Operational and developer-experience considerations

- **Migration artifacts in version control**: The `drizzle/` directory containing generated SQL migration files is committed so schema history is versioned and reviewable in PRs.
- **Database file excluded**: `data/travel.db` is gitignored; each developer generates their own local database by running `npm run db:migrate`.
- **Local setup flow**: After cloning and `npm install`, a developer must run `npm run db:migrate` before starting the dev server to ensure the database exists and is up to date.
- **Synchronous initialization**: `better-sqlite3` is synchronous by design, avoiding async complexity in module bootstrap. This is a feature, not a limitation — it simplifies server startup and eliminates race conditions.

### 11. Compatibility with upcoming tasks

This design intentionally supports the rest of the planned application without requiring structural rewrites:

- **Task 3** adds the full schema (`users`, `destinations`, `trips`, `trip_stops`) into `src/db/schema.ts` and generates the corresponding migration.
- **Task 4** (authentication) builds on the `users` table and the `db` export.
- **Task 6** (seed data) layers on top of the same connection and migration workflow.
- **Tasks 7–10** (APIs and pages) import `db` from `@/db` to query data.

## Implementation Plan

1. Install `drizzle-orm` and `better-sqlite3` as runtime deps, `drizzle-kit` and `@types/better-sqlite3` as dev deps via `npm install`. Verify `package-lock.json` is updated.
2. Create `travel-website/.env.local` with `DATABASE_URL=file:./data/travel.db`.
3. Append `data/` to `travel-website/.gitignore` to exclude database files from version control.
4. Create `travel-website/src/db/schema.ts` with a minimal placeholder table for migration validation.
5. Create `travel-website/drizzle.config.ts` using `defineConfig` from `drizzle-kit`, pointing to the schema file, `drizzle/` output directory, and `DATABASE_URL`.
6. Add `db:generate`, `db:migrate`, and `db:studio` npm scripts to `travel-website/package.json`.
7. Run `npm run db:generate` to create the initial migration files under `travel-website/drizzle/`.
8. Run `npm run db:migrate` to apply the initial migration and verify the database is created at `data/travel.db`.
9. Create `travel-website/src/db/index.ts` with the HMR-safe singleton connection module.
10. Write tests in `travel-website/src/db/index.test.ts`: connection creation, schema export validation, and migration smoke test using in-memory SQLite.
11. Run `npm test` to verify all tests pass.

