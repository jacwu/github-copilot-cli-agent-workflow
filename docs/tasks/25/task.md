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

- Defining the full application table schemas for `users`, `destinations`, `trips`, and `trip_stops` beyond what is necessary to explain the migration and ORM structure.
- Implementing authentication, registration, trip APIs, or destination queries.
- Populating real seed data or downloading image assets.
- Designing production database backup, replication, or multi-environment deployment workflows beyond a local-file SQLite strategy.
- Replacing SQLite with another database engine or introducing a second ORM/query layer.
- Implementing runtime business logic, repositories, or API handlers.

## Current State

The repository already contains the baseline Next.js application scaffold and developer tooling created by Task 1, including:

- `package.json` / `package-lock.json`
- `src/app/*` for the App Router shell
- `src/lib/utils.ts` and UI components
- `vitest.config.ts` and existing tests
- `components.json`, `next.config.ts`, `tsconfig.json`, and ESLint/PostCSS config

However, the repository does **not** yet include any persistence-layer files or configuration. Specifically, there is currently no:

- database dependency such as `better-sqlite3`, `drizzle-orm`, or `drizzle-kit`,
- `src/db/` directory,
- Drizzle schema file,
- database connection module,
- `drizzle.config.ts`,
- migrations output directory,
- environment variable convention for the SQLite file path,
- `.env` file or documented database bootstrap workflow.

This means the project currently has a functioning UI scaffold but no durable data layer. All upcoming backend-oriented tasks depend on this task providing a consistent baseline.

One implementation detail to account for is that the current repository uses **Next.js 16** in `package.json`, while the repository-wide design document was authored around Next.js 15 conventions. The persistence-layer design should remain aligned with the App Router architecture and server-only database access pattern from the design doc, while fitting the current dependency baseline already present in the repo.

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

### 2. File and Module Layout

The persistence layer should follow the repository-wide structure and add the following files/directories:

```text
src/
  db/
    index.ts        # Shared Drizzle database instance
    schema.ts       # Drizzle table definitions
    migrate.ts      # Optional programmatic migration runner
    seed.ts         # Reserved for later seed task; may be stubbed or omitted in this task

drizzle/           # Generated SQL migrations and metadata
  *.sql
  meta/

drizzle.config.ts  # Drizzle Kit configuration
```

Notes:

- `src/db/index.ts` is the single entry point for database access from server code.
- `src/db/schema.ts` becomes the canonical place for all table definitions and relations introduced in later tasks.
- `drizzle/` stores generated migration SQL and Drizzle metadata and should be committed so all environments share the same migration history.
- `src/db/migrate.ts` is optional but recommended if the implementation wants a project-local script for applying migrations without hand-writing CLI commands in multiple places.

### 3. SQLite File Strategy

The application should use a file-backed SQLite database rather than an in-memory database for normal development.

Recommended convention:

- Use a root-level `data/` directory or similar project-local location for the SQLite file.
- Default database file path: `./data/app.db`
- Ensure the path is configurable through an environment variable such as `DATABASE_URL`.

Preferred URL format:

```text
DATABASE_URL=file:./data/app.db
```

Rationale:

- It matches common Drizzle and SQLite tooling expectations.
- It avoids hard-coding absolute machine-specific paths.
- It keeps the location explicit and easy to override for tests or alternate local environments.

If `better-sqlite3` integration is easier with a normalized file path than a `file:` URL, the implementation may internally translate `DATABASE_URL` into the driver input, but the environment-facing contract should still remain simple and documented.

The database file itself should **not** be committed. The implementation should ensure the repository ignores generated SQLite data files and any transient journal/WAL files.

### 4. Environment and Configuration Conventions

The design should establish a minimal server-only configuration contract for database access.

#### 4.1 Environment variable

Use a single required variable:

- `DATABASE_URL`: file-based SQLite location for Drizzle and the runtime connection.

Example local development value:

```env
DATABASE_URL=file:./data/app.db
```

#### 4.2 Validation approach

The database module should fail fast if `DATABASE_URL` is missing or empty. Because this code runs at a system boundary, explicit error throwing is preferred over silent fallback behavior.

Recommended behavior in `src/db/index.ts`:

- Read `process.env.DATABASE_URL`
- Validate that it exists
- Normalize it if necessary for the `better-sqlite3` constructor
- Initialize the SQLite client once
- Export a typed Drizzle database instance

The implementation should avoid broad try/catch wrappers around initialization. If configuration is invalid, startup should fail with a clear error message.

### 5. Database Connection Module

`src/db/index.ts` should provide the single shared Drizzle instance used by server code.

Responsibilities:

- import the schema from `src/db/schema.ts`,
- create the `better-sqlite3` database connection,
- pass the connection into Drizzle,
- export the typed database object for use by API routes, auth helpers, and future server modules.

Recommended design characteristics:

- Server-only usage
- Single connection module rather than ad hoc connection creation in route handlers
- Schema passed into Drizzle at initialization so query types stay aligned with table definitions
- Small, explicit surface area; no repository abstraction is required yet

A simple structure is preferred, for example:

- parse config,
- create SQLite client,
- create Drizzle instance,
- export `db`.

This keeps later tasks straightforward and prevents duplicate connection logic from spreading across the codebase.

### 6. Schema Ownership and Growth Model

`src/db/schema.ts` should be the canonical source of truth for Drizzle table definitions.

For this task, the important design decision is **where schema definitions live and how they evolve**, not necessarily completing every table. Later tasks will add the actual `users`, `destinations`, `trips`, and `trip_stops` tables based on `docs/design.md`.

Design expectations:

- Use Drizzle’s SQLite table builders.
- Keep all core tables in one schema module initially for simplicity.
- Export each table individually so future code can import only what it needs.
- Add relation definitions in the same module once the tables exist.
- Preserve naming consistency with the repository-level design doc (`users`, `destinations`, `trips`, `trip_stops`).

This task’s implementation may choose one of two acceptable starting points:

1. Create an empty schema module placeholder that establishes the pattern and exports no application tables yet.
2. Create minimal starter table definitions if needed to validate the migration workflow.

Option 1 is safer if the team wants Task 3 to own the complete model design. Option 2 is acceptable only if it does not preempt or distort the Task 3 data model work.

### 7. Migration Workflow

Migrations should be **SQL-first artifacts generated by Drizzle Kit and committed to the repository**.

Recommended workflow:

1. Update `src/db/schema.ts`.
2. Run Drizzle Kit to generate a migration under `drizzle/`.
3. Apply the generated migration to the local SQLite database.
4. Commit the schema changes and generated migration files together.

This preserves a reproducible change history and avoids depending on runtime schema auto-sync.

#### 7.1 Required scripts

The implementation should add npm scripts for the standard workflow, using names that are easy to remember and consistent with the current project style.

Recommended scripts:

- `db:generate` — generate migrations from schema changes
- `db:migrate` — apply pending migrations
- `db:studio` — open Drizzle Studio for local inspection (optional but strongly recommended)

If a programmatic migration runner is added, `db:migrate` can call a TypeScript/Node entry point. Otherwise it may call Drizzle Kit directly.

#### 7.2 Runtime migration policy

Do **not** automatically run migrations during normal application startup.

Reasons:

- It hides state-changing behavior behind page/API execution.
- It complicates local debugging.
- It creates unnecessary risk if the app boot path is invoked in contexts where schema mutations are not expected.

Migrations should be an explicit developer or deployment operation.

### 8. Drizzle Configuration

A root-level `drizzle.config.ts` should define the shared schema and output configuration.

Responsibilities:

- point Drizzle Kit at `src/db/schema.ts`,
- point generated migrations to `./drizzle`,
- configure the SQLite dialect,
- reference `DATABASE_URL` or the equivalent local file setting.

The configuration should stay intentionally small and avoid environment-specific branching unless required for correctness.

Key design principles:

- one schema entry point,
- one migration output directory,
- one database URL contract,
- no hidden defaults that differ from runtime behavior.

### 9. Seeding Boundary

The repository-level design already reserves `src/db/seed.ts` for destination and image seeding work in a later task.

For this task, seeding should be treated as **out of scope**, but the design should leave the system ready for it:

- the connection module should be reusable by a future seed script,
- the migration workflow should create the schema needed before seeding,
- the database path convention should work identically for app code and seed code.

If the implementation creates `src/db/seed.ts` now, it should only establish a structural placeholder or reusable setup pattern. It should not introduce destination data or image download logic.

### 10. Testing Strategy for This Task

The project rules require test coverage for backend foundations, but this task is primarily infrastructure setup. The most valuable test coverage here is around configuration and database-module behavior.

Recommended test scope:

- unit tests for database configuration normalization/validation helpers, if such helpers are extracted,
- smoke test that the database module can initialize against a temporary SQLite file path in a controlled test context,
- avoid tests that require feature tables not yet defined unless the implementation introduces minimal starter schema elements.

Testing should remain lightweight and focused on the persistence foundation rather than prematurely testing future domain models.

### 11. Operational and Source-Control Considerations

The implementation should follow these repository conventions:

- Commit `drizzle.config.ts` and generated migration files.
- Do **not** commit the SQLite database file.
- Do **not** commit temporary SQLite journal/WAL/shm files.
- Keep the database code in TypeScript and compatible with strict mode.
- Keep database imports out of client components.

If the implementation introduces ignore rules, they should cover at least:

- the primary SQLite file location,
- `*.db-journal`,
- `*.db-wal`,
- `*.db-shm`.

### 12. Validation Expectations

Once implemented, the following should be true:

1. Installing dependencies succeeds with the SQLite and Drizzle packages added.
2. The project has a `src/db/` module structure and a root `drizzle.config.ts`.
3. A developer can set `DATABASE_URL` to a local SQLite path and initialize the shared database module successfully.
4. Schema changes can produce migration files under `drizzle/`.
5. Pending migrations can be applied explicitly through an npm script.
6. The application can build and tests can run without client/server boundary violations caused by database imports.
7. Later tasks can define the core tables without reworking the persistence foundation.

## Implementation Plan

1. **Add persistence dependencies**: Install `better-sqlite3`, `drizzle-orm`, and `drizzle-kit` using npm, ensuring `package-lock.json` stays in sync.
2. **Establish environment contract**: Define and document `DATABASE_URL` as the SQLite file path input, using a local file-backed default convention such as `file:./data/app.db`.
3. **Create the database module structure**: Add `src/db/` and create `src/db/index.ts` as the shared runtime entry point plus `src/db/schema.ts` as the schema source-of-truth.
4. **Add Drizzle configuration**: Create `drizzle.config.ts` pointing at `src/db/schema.ts`, the SQLite dialect, and the `drizzle/` migrations directory.
5. **Define migration commands**: Add npm scripts for generating and applying migrations, and optionally for opening Drizzle Studio.
6. **Set up migration storage**: Generate or prepare the `drizzle/` directory structure that will hold committed SQL migration artifacts and metadata.
7. **Add lightweight validation tests**: Cover configuration validation and/or database initialization behavior without introducing unrelated domain logic.
8. **Verify the workflow end-to-end**: Confirm the project can install, build, run tests, generate a migration, and apply it to the local SQLite file using the documented scripts.
