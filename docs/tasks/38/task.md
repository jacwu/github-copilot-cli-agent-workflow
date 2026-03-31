# Task 2: Configure Database and ORM

## Background

Issue #38 establishes the application's persistence foundation by integrating SQLite and Drizzle ORM into the existing Next.js project under `travel-website/`. The repository-level design already standardizes on SQLite with `better-sqlite3` and Drizzle ORM, and it reserves `src/db/index.ts`, `src/db/schema.ts`, `src/db/seed.ts`, and `drizzle.config.ts` for data-layer concerns.

At the moment, the application scaffold contains pages, shared utilities, and Vitest setup, but it does not yet include any database dependencies, schema definitions, connection module, or migration workflow. Without this task, later work for authentication, destinations, trips, and seed data has no reliable persistence layer to build on.

## Goal

Create a stable, local-first database foundation for the travel website by defining:

- how SQLite is connected from the Next.js app,
- how Drizzle ORM models and exports the schema,
- how migrations are generated and applied,
- where the database file and migration artifacts live,
- and what scripts/configuration are required so future tasks can build on a predictable persistence layer.

## Non-Goals

- Implementing feature-specific repositories, API routes, or business logic.
- Populating production-ready seed data beyond what later tasks may need.
- Building authentication flows, destination queries, or trip management features.
- Introducing a hosted database or multi-environment database platform.
- Designing runtime admin tooling or a database browser UI.

## Current State

### Repository alignment

The repository-wide documents already define the intended stack and structure:

- `docs/design.md` specifies SQLite via `better-sqlite3` and Drizzle ORM.
- `docs/design.md` reserves `travel-website/src/db/index.ts` for the database connection and `travel-website/src/db/schema.ts` for schema definitions.
- The same document expects a root-level `travel-website/drizzle.config.ts` file.
- The data model is already described at a high level with `users`, `destinations`, `trips`, and `trip_stops` tables.

### Observed codebase status

Based on the current scaffold:

- `travel-website/package.json` only includes core Next.js, Tailwind, and Vitest dependencies.
- There are no existing SQLite, Drizzle, or migration-related packages.
- There is no `src/db/` directory yet.
- There is no `drizzle.config.ts` yet.
- Current npm scripts do not include schema generation, migration, or seed commands.

This means the task should introduce the full persistence bootstrap, but in a way that remains small, deterministic, and compatible with future feature tasks.

## Proposed Design

### 1. Data-layer package selection

Adopt the following packages in `travel-website/`:

- Runtime dependencies:
  - `drizzle-orm`
  - `better-sqlite3`
- Development dependencies:
  - `drizzle-kit`
  - `@types/better-sqlite3`

This matches the repository-level design, keeps SQLite embedded and simple for local development, and gives the project a type-safe ORM plus migration tooling.

### 2. Database file location and environment strategy

Use a file-based SQLite database stored inside the application workspace, with a configurable path provided through an environment variable.

Recommended default:

- Environment variable: `DATABASE_URL`
- Default local value: `./data/travel.db`

Design details:

- The value should point to a SQLite file path that works for both local development and test setup.
- The app should treat `DATABASE_URL` as the source of truth so later environments can change file location without code changes.
- A dedicated `travel-website/data/` directory keeps database artifacts out of `src/` and avoids mixing runtime data with code.
- The path resolution should be explicit and consistent so Drizzle config and runtime connection use the same target file.

### 3. Connection module

Create a dedicated database entry module at `travel-website/src/db/index.ts`.

Responsibilities:

- Open a `better-sqlite3` connection using the configured database file.
- Wrap that connection with `drizzle()` and export a shared database client.
- Export the raw SQLite connection only if needed for migration or low-level operational support.
- Centralize connection options so future code does not instantiate new connections ad hoc.

Design principles:

- Use a singleton-style module export so server code reuses one connection per process rather than repeatedly opening files.
- Keep the module server-only in intent; application code should not import database access into client components.
- Fail fast if the configured database path is missing or invalid rather than hiding configuration problems.

### 4. Schema module structure

Create `travel-website/src/db/schema.ts` as the authoritative Drizzle schema definition.

Initial table scope for this task:

- `users`
- `destinations`
- `trips`
- `trip_stops`

Schema alignment requirements:

- Match the table names and columns defined in `docs/design.md`.
- Preserve the relationships already documented:
  - `users` 1:N `trips`
  - `trips` 1:N `trip_stops`
  - `trip_stops` N:1 `destinations`
- Define primary keys, foreign keys, unique constraints, defaults, and not-null constraints according to the repository design.
- Use SQLite-friendly column types and Drizzle's SQLite core helpers.

Recommended modeling decisions:

- Represent timestamps as text columns with SQL defaults, matching the repository design.
- Store enumerated values such as trip status as text with application-level narrowing in TypeScript rather than SQLite enums.
- Add indexes only where there is already a clear design need, such as unique email on `users`; broader performance indexing can be added in later tasks after query patterns are implemented.

### 5. Migration workflow

Add a standard Drizzle migration workflow centered on a root-level config file in `travel-website/drizzle.config.ts`.

Responsibilities of the config:

- Point Drizzle to the schema file in `src/db/schema.ts`.
- Point Drizzle to the SQLite credentials sourced from `DATABASE_URL`.
- Define a dedicated migrations output folder, recommended as `travel-website/drizzle/`.

Workflow design:

1. Developers update `src/db/schema.ts`.
2. A generate command creates SQL migration files under `drizzle/`.
3. A migrate/apply command runs pending migrations against the SQLite database.
4. The application starts against a migrated schema rather than relying on runtime schema creation.

Why migrations instead of push-only sync:

- Migration files create a durable history of schema evolution.
- The workflow is auditable and safer for future changes to auth, destinations, and trips.
- It fits the issue requirement for a stable persistence layer better than relying solely on direct schema synchronization.

### 6. npm script contract

Extend `travel-website/package.json` with a small, explicit database script set.

Recommended scripts:

- `db:generate` — generate new Drizzle migrations from schema changes.
- `db:migrate` — apply generated migrations to the configured SQLite database.
- `db:studio` — optional convenience command for local schema inspection using Drizzle tooling.
- `db:seed` — reserved for future seed work if implemented in a later task.

Design note:

If `db:seed` is not implemented in this issue, the script can be omitted until the seed task lands. The important requirement for this issue is that generation and migration workflows are present and documented.

### 7. Testing approach for the data foundation

Although this issue is primarily infrastructure-oriented, it still needs verification coverage consistent with the project's TDD rule and backend testing expectations.

Recommended test coverage:

- A unit test for the database configuration module that verifies the database client can be created against a test SQLite path.
- A schema-level smoke test that imports the schema definitions and validates the expected table exports exist.
- A migration smoke path, if feasible in the existing Vitest environment, that applies migrations to a temporary SQLite file and verifies the expected tables are created.

Testing boundaries:

- Do not test Drizzle internals.
- Focus on the project's integration contract: config resolution, exported client availability, and successful migration application.

### 8. Operational and developer-experience considerations

To keep the persistence layer stable and maintainable:

- Check migration artifacts into the repository so schema history is versioned.
- Keep the actual SQLite database file out of source control.
- Ensure local setup instructions mention that migrations must run before features depending on data access.
- Keep runtime database initialization synchronous and simple, which suits `better-sqlite3` and avoids unnecessary async complexity in module bootstrap.

### 9. Compatibility with upcoming tasks

This design intentionally supports the rest of the planned application without requiring structural rewrites:

- Authentication can build directly on the `users` table.
- Destination listing and detail pages can query `destinations` without schema changes.
- Trip planning flows can use `trips` and `trip_stops` relationships immediately.
- Seed-data work can layer on top of the same connection and migration workflow.

## Implementation Plan

1. Add SQLite and Drizzle dependencies in `travel-website/package.json` and keep `package-lock.json` in sync.
2. Create `travel-website/src/db/index.ts` to export the shared SQLite connection and Drizzle client.
3. Create `travel-website/src/db/schema.ts` with the initial table definitions aligned to `docs/design.md`.
4. Add `travel-website/drizzle.config.ts` that points to the schema file, migration output folder, and SQLite database path.
5. Add npm scripts for migration generation and migration application.
6. Generate the initial migration files under `travel-website/drizzle/`.
7. Add targeted Vitest coverage for database configuration and migration smoke validation.
8. Document the local developer flow in the appropriate project docs if needed during implementation, especially the requirement to run migrations before using data-backed features.

