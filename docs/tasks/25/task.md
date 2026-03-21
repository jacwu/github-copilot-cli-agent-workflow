# Task 2 Technical Design: Configure Database and ORM

## Background

Issue #25 covers the first backend foundation task for the travel website: introducing a stable persistence layer using SQLite and Drizzle ORM.

The repository-level requirements and architecture already establish the core product capabilities that will rely on persisted data, including account registration, destination browsing, and trip planning. The repository-wide design document specifically selects **SQLite (`better-sqlite3`)** as the database and **Drizzle ORM** as the type-safe data access layer, with a target project structure that includes `src/db/index.ts`, `src/db/schema.ts`, `src/db/seed.ts`, and `drizzle.config.ts`.

Task 1 has already established the application scaffold, UI foundation, and test tooling. This task should therefore focus on the persistence infrastructure only: package dependencies, runtime database connection design, Drizzle configuration, migration workflow, and the conventions that later data-model and API tasks will build on.

## Goal

Create a clear and stable design for integrating SQLite and Drizzle ORM into the current Next.js application so that subsequent tasks can:

- define application tables in a single typed schema,
- run deterministic migrations against a local SQLite file,
- access the database from server-side code through a shared connection module, and
- use a repeatable developer workflow for schema changes and database bootstrapping.

The result of this task should make database usage predictable for later authentication, destination, trip, and seed-data work without forcing those feature tasks to make foundational ORM or migration decisions again.

## Non-Goals

- Defining the full application table schemas for `users`, `destinations`, `trips`, and `trip_stops` beyond what is necessary to validate the migration workflow end-to-end.
- Implementing authentication, registration, trip APIs, or destination queries.
- Populating real seed data or downloading image assets.
- Designing production database backup, replication, or multi-environment deployment workflows beyond a local-file SQLite strategy.
- Replacing SQLite with another database engine or introducing a second ORM/query layer.
- Implementing runtime business logic, repositories, or API handlers.

## Current State

The repository already contains the baseline Next.js application scaffold and developer tooling created by Task 1, including:

- `package.json` / `package-lock.json` with Next.js 16.2.1, React 19, Vitest 4, shadcn/ui, and Tailwind CSS 4
- `src/app/` for the App Router shell (`layout.tsx`, `page.tsx`, `globals.css`, `favicon.ico`)
- `src/lib/utils.ts` and `src/components/ui/` (shadcn components)
- `vitest.config.ts` configured with `jsdom` environment and `@` path alias
- `components.json`, `next.config.ts` (empty config), `tsconfig.json` (strict mode, bundler resolution), ESLint, and PostCSS config
- Existing test files: `src/lib/utils.test.ts`, `src/components/ui/button.test.tsx` (co-located pattern)
- `.gitignore` covers `node_modules/`, `.next/`, `.env`/`.env.local`, etc. but has no database-related entries

However, the repository does **not** yet include any persistence-layer files or configuration. Specifically, there is currently no:

- database dependency such as `better-sqlite3`, `drizzle-orm`, or `drizzle-kit`,
- `src/db/` directory,
- Drizzle schema file,
- database connection module,
- `drizzle.config.ts`,
- migrations output directory,
- environment variable convention for the SQLite file path,
- `.env.example` file documenting expected environment variables.

This means the project currently has a functioning UI scaffold but no durable data layer. All upcoming backend-oriented tasks depend on this task providing a consistent baseline.

The current repository uses **Next.js 16** (`"next": "16.2.1"` in `package.json`), while the repository-wide design document was authored around Next.js 15 conventions. The persistence-layer design should remain aligned with the App Router architecture and server-only database access pattern from the design doc, while fitting the current dependency baseline. Notably, Next.js 16 supports `serverExternalPackages` in `next.config.ts`, which is required to properly handle the `better-sqlite3` native addon during bundling.

## Proposed Design

### 1. Persistence Stack

Use the stack already prescribed in `docs/design.md`:

- **Database engine**: SQLite
- **SQLite driver**: `better-sqlite3`
- **ORM**: `drizzle-orm`
- **Migration / schema generation tool**: `drizzle-kit`

This combination fits the product scope well because it is:

- lightweight and zero-install for local development,
- fully compatible with a single Next.js application repository,
- type-safe from schema to query usage,
- well suited for deterministic migrations checked into source control.

The database should be treated as a **server-only concern**. No client-side code should import the database connection or schema modules directly.

### 2. Dependencies

All packages must be installed via `npm` to keep `package-lock.json` in sync.

**Runtime dependencies** (added to `dependencies`):

- `better-sqlite3` — native SQLite driver
- `drizzle-orm` — type-safe ORM layer

**Development dependencies** (added to `devDependencies`):

- `drizzle-kit` — migration generation and studio tooling
- `@types/better-sqlite3` — TypeScript type declarations (required because `tsconfig.json` has `strict: true`)

### 3. File and Module Layout

The persistence layer should follow the repository-wide structure and add the following files/directories:

```text
src/
  db/
    index.ts        # Shared Drizzle database instance (server-only)
    schema.ts       # Drizzle table definitions (canonical source of truth)
    migrate.ts      # Programmatic migration runner script

drizzle/            # Generated SQL migrations and metadata (committed)
  NNNN_*.sql
  meta/

drizzle.config.ts   # Drizzle Kit configuration
.env.example        # Documents required environment variables
```

Notes:

- `src/db/index.ts` is the single entry point for database access from server code.
- `src/db/schema.ts` becomes the canonical place for all table definitions and relations introduced in later tasks.
- `drizzle/` stores generated migration SQL and Drizzle metadata and should be committed so all environments share the same migration history.
- `src/db/migrate.ts` provides a programmatic migration runner using `drizzle-orm/better-sqlite3/migrator`. This is the entry point for the `db:migrate` npm script and allows the migration to be run with `npx tsx src/db/migrate.ts`.
- `src/db/seed.ts` is **not** created in this task. It is reserved for Task 6 (Prepare Destination Seed Data).

### 4. Next.js Configuration for Native Addons

`better-sqlite3` is a native Node.js addon that must not be bundled by webpack/turbopack. The implementation must add it to `serverExternalPackages` in `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
```

Without this, `next build` will fail when server-side code imports `better-sqlite3`.

### 5. SQLite File Strategy

The application should use a file-backed SQLite database rather than an in-memory database for normal development.

Convention:

- Use a root-level `data/` directory for the SQLite file.
- Default database file path: `file:./data/app.db`
- The path is configurable through the `DATABASE_URL` environment variable.

Example:

```text
DATABASE_URL=file:./data/app.db
```

**Path normalization**: The `better-sqlite3` constructor accepts a plain file path (e.g., `./data/app.db`), not a URI. The `src/db/index.ts` module must strip the `file:` prefix before passing the value to `better-sqlite3`. The normalization logic should:

1. Read `DATABASE_URL` from `process.env`.
2. Strip the leading `file:` prefix if present.
3. Pass the resulting plain path to the `Database` constructor.

**Directory creation**: `better-sqlite3` will create the `.db` file automatically but will **not** create parent directories. The database module should ensure the parent directory exists (e.g., using `mkdirSync` with `recursive: true`) before initializing the connection.

The database file itself should **not** be committed. The `.gitignore` must be updated to cover generated SQLite files.

### 6. Environment and Configuration Conventions

#### 6.1 Environment variable

Use a single required variable:

- `DATABASE_URL`: file-based SQLite location for Drizzle and the runtime connection.

#### 6.2 `.env.example`

Create a `.env.example` file at the project root documenting all required environment variables for developer onboarding:

```env
DATABASE_URL=file:./data/app.db
```

This file should be committed. Developers copy it to `.env.local` and customize as needed.

#### 6.3 Validation approach

The database module should fail fast if `DATABASE_URL` is missing or empty. Because this code runs at a system boundary, explicit error throwing is preferred over silent fallback behavior.

Recommended behavior in `src/db/index.ts`:

1. Read `process.env.DATABASE_URL`.
2. Throw a descriptive error if the value is missing or empty.
3. Strip the `file:` prefix if present to obtain the plain file path.
4. Ensure the parent directory of the file path exists (create it recursively if not).
5. Initialize the `better-sqlite3` `Database` instance with the resolved path.
6. Wrap it in a Drizzle instance with the schema.
7. Export the typed `db` object.

The implementation should avoid broad try/catch wrappers around initialization. If configuration is invalid, startup should fail with a clear error message.

To facilitate testing (where the database module must be instantiated with a temporary path rather than the process-level `DATABASE_URL`), a **factory function** pattern is recommended:

```typescript
export function createDatabase(url: string): BetterSQLite3Database<typeof schema> {
  // normalize, ensure directory, connect, return drizzle instance
}

// Default singleton for production/development use
export const db = createDatabase(process.env.DATABASE_URL ?? "");
```

This allows test code to call `createDatabase("file:./tmp/test.db")` without mutating environment variables.

### 7. Database Connection Module

`src/db/index.ts` should provide the single shared Drizzle instance used by server code.

Responsibilities:

- import all schema exports from `src/db/schema.ts` as a namespace (`import * as schema`),
- normalize the `DATABASE_URL` value,
- ensure the database file's parent directory exists,
- create the `better-sqlite3` database connection,
- pass both the connection and schema into `drizzle()`,
- export the typed database object `db` and the `createDatabase` factory function.

Recommended design characteristics:

- Server-only usage (never imported by `"use client"` components)
- Single connection module rather than ad hoc connection creation in route handlers
- Schema passed into Drizzle at initialization so query types stay aligned with table definitions
- Small, explicit surface area; no repository abstraction is required yet

### 8. Schema Ownership and Growth Model

`src/db/schema.ts` should be the canonical source of truth for Drizzle table definitions.

For this task, the important design decision is **where schema definitions live and how they evolve**, not necessarily completing every table. Later tasks (Task 3) will add the actual `users`, `destinations`, `trips`, and `trip_stops` tables based on `docs/design.md`.

Design expectations:

- Use Drizzle's SQLite table builders (`sqliteTable` from `drizzle-orm/sqlite-core`).
- Keep all core tables in one schema module initially for simplicity.
- Export each table individually so future code can import only what it needs.
- Add relation definitions in the same module once the tables exist (Task 3).
- Preserve naming consistency with the repository-level design doc (`users`, `destinations`, `trips`, `trip_stops`).

**This task should include a minimal placeholder table** (e.g., a simple `_migrations_test` or similar verification table with an `id` and `name` column) that exists solely to validate the full migration workflow end-to-end (generate → migrate → query). This table can be removed or replaced by Task 3 when the real application tables are defined. This approach is preferred over an empty schema because:

- TDD requires a testable artifact to write meaningful tests against.
- The migration workflow cannot be validated without at least one table definition.
- It demonstrates the pattern for future schema additions without preempting Task 3's data model design.

### 9. Migration Workflow

Migrations should be **SQL-first artifacts generated by Drizzle Kit and committed to the repository**.

Recommended workflow:

1. Update `src/db/schema.ts`.
2. Run `npm run db:generate` to produce a migration under `drizzle/`.
3. Run `npm run db:migrate` to apply the generated migration to the local SQLite database.
4. Commit the schema changes and generated migration files together.

This preserves a reproducible change history and avoids depending on runtime schema auto-sync.

#### 9.1 Required scripts

The implementation should add npm scripts to `package.json`:

| Script | Command | Purpose |
|---|---|---|
| `db:generate` | `drizzle-kit generate` | Generate migration SQL from schema changes |
| `db:migrate` | `npx tsx src/db/migrate.ts` | Apply pending migrations programmatically |
| `db:studio` | `drizzle-kit studio` | Open Drizzle Studio for local database inspection |

The `db:migrate` script uses the programmatic migrator from `drizzle-orm/better-sqlite3/migrator` rather than a Drizzle Kit CLI command. This gives full control over the migration process and makes it easy to run in scripts or CI.

`src/db/migrate.ts` should:

1. Import or call `createDatabase` with `process.env.DATABASE_URL`.
2. Call `migrate(db, { migrationsFolder: "./drizzle" })`.
3. Log success or let errors propagate naturally.

#### 9.2 Runtime migration policy

Do **not** automatically run migrations during normal application startup.

Reasons:

- It hides state-changing behavior behind page/API execution.
- It complicates local debugging.
- It creates unnecessary risk if the app boot path is invoked in contexts where schema mutations are not expected.

Migrations should be an explicit developer or deployment operation.

### 10. Drizzle Configuration

A root-level `drizzle.config.ts` should use `defineConfig` from `drizzle-kit`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./data/app.db",
  },
});
```

Key design principles:

- One schema entry point (`src/db/schema.ts`).
- One migration output directory (`./drizzle`).
- SQLite dialect explicitly specified.
- `dbCredentials.url` reads `DATABASE_URL` with a sensible fallback so that `drizzle-kit generate` works without requiring the env var to be set (generation only needs the schema, not a live database).
- No hidden defaults that differ from runtime behavior.

### 11. Seeding Boundary

The repository-level design already reserves `src/db/seed.ts` for destination and image seeding work in Task 6.

For this task, seeding is **out of scope**, but the design should leave the system ready for it:

- the `createDatabase` factory function should be reusable by a future seed script,
- the migration workflow should create the schema needed before seeding,
- the database path convention should work identically for app code and seed code.

Do **not** create `src/db/seed.ts` in this task.

### 12. Testing Strategy for This Task

The project rules require test coverage for backend foundations. This task is primarily infrastructure setup, so the most valuable test coverage is around configuration validation and database module initialization.

#### 12.1 Vitest environment consideration

The existing `vitest.config.ts` uses the `jsdom` environment. However, `better-sqlite3` is a native Node.js addon that requires a Node environment. Database test files must use the inline `// @vitest-environment node` directive at the top of each file to override the global `jsdom` default:

```typescript
// @vitest-environment node
import { describe, it, expect, afterEach } from "vitest";
```

This avoids modifying the global vitest configuration and impacting existing UI component tests.

#### 12.2 Recommended test scope

Create `src/db/index.test.ts` with tests covering:

1. **Validation**: `createDatabase` throws a descriptive error when given an empty or missing URL.
2. **Path normalization**: The `file:` prefix is correctly stripped (test the normalization helper if extracted).
3. **Initialization**: `createDatabase` successfully connects to a temporary SQLite file, and the returned Drizzle instance can execute a basic query (e.g., `SELECT 1`).
4. **Schema integration**: If a placeholder table is defined, verify that the migration workflow produces a usable table by inserting and querying a row.

Each test should use a unique temporary file path (e.g., under `os.tmpdir()`) and clean up after itself to avoid cross-test interference.

#### 12.3 Test boundaries

- Do **not** test feature tables that do not yet exist.
- Do **not** add integration tests that start the Next.js server.
- Focus on the database module's public API: `createDatabase`, `db`, and the configuration contract.

### 13. Operational and Source-Control Considerations

The implementation should follow these repository conventions:

- Commit `drizzle.config.ts`, generated migration files under `drizzle/`, and `.env.example`.
- Do **not** commit the SQLite database file or its transient artifacts.
- Keep the database code in TypeScript and compatible with strict mode.
- Keep database imports out of client components.

The following entries must be appended to `.gitignore`:

```gitignore
# SQLite database files
data/
*.db
*.db-journal
*.db-wal
*.db-shm
```

### 14. Validation Expectations

Once implemented, the following should be true:

1. `npm install` succeeds with `better-sqlite3`, `drizzle-orm`, `drizzle-kit`, and `@types/better-sqlite3` added.
2. The project has a `src/db/` module structure (`index.ts`, `schema.ts`, `migrate.ts`) and a root `drizzle.config.ts`.
3. `next.config.ts` includes `serverExternalPackages: ["better-sqlite3"]`.
4. A `.env.example` file documents `DATABASE_URL`.
5. A developer can set `DATABASE_URL` to a local SQLite path and initialize the shared database module successfully.
6. Running `npm run db:generate` produces migration files under `drizzle/`.
7. Running `npm run db:migrate` applies pending migrations to the local SQLite file.
8. `npm run build` succeeds without client/server boundary violations caused by database imports.
9. `npm run test` passes, including the new database module tests.
10. Later tasks can define the core tables without reworking the persistence foundation.

## Implementation Plan

1. **Install persistence dependencies**: Run `npm install better-sqlite3 drizzle-orm` and `npm install -D drizzle-kit @types/better-sqlite3`, ensuring `package-lock.json` stays in sync.
2. **Configure Next.js for native addons**: Add `serverExternalPackages: ["better-sqlite3"]` to `next.config.ts`.
3. **Update `.gitignore`**: Append ignore patterns for `data/`, `*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm`.
4. **Create `.env.example`**: Add `DATABASE_URL=file:./data/app.db` as the documented default.
5. **Create `src/db/schema.ts`**: Define a minimal placeholder table (e.g., `_migrations_test` with `id` and `name` columns) using `sqliteTable` from `drizzle-orm/sqlite-core` to validate the migration workflow. Export it as a named export.
6. **Create `src/db/index.ts`**: Implement the `createDatabase` factory function and the default `db` singleton export. Include `DATABASE_URL` validation, `file:` prefix stripping, parent directory creation, and Drizzle initialization with the schema.
7. **Create `drizzle.config.ts`**: Use `defineConfig` from `drizzle-kit` with `dialect: "sqlite"`, `schema: "./src/db/schema.ts"`, `out: "./drizzle"`, and `dbCredentials.url` reading from `DATABASE_URL`.
8. **Create `src/db/migrate.ts`**: Implement the programmatic migration runner using `migrate` from `drizzle-orm/better-sqlite3/migrator`.
9. **Add npm scripts**: Add `db:generate`, `db:migrate`, and `db:studio` to `package.json`.
10. **Generate initial migration**: Run `npm run db:generate` to produce the first migration SQL under `drizzle/` for the placeholder table.
11. **Write tests**: Create `src/db/index.test.ts` with the `// @vitest-environment node` directive, testing validation, path normalization, initialization, and basic schema integration against temporary SQLite files.
12. **Verify end-to-end**: Run `npm run db:migrate`, `npm run build`, `npm run test`, and `npm run lint` to confirm the full workflow works without errors.
