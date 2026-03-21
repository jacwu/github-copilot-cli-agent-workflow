# Task 3 Technical Design: Define Core Data Models

## Background

Issue #31 covers the first feature-specific database modeling task for the travel website. The repository-level requirements define three data-driven product areas that all depend on durable, well-structured persistence:

- authentication and user identity,
- destination discovery with search and filters,
- trip planning with ordered itinerary stops.

The repository-wide design document already defines the intended persistence stack and the target conceptual model:

- SQLite with Drizzle ORM,
- four core tables: `users`, `destinations`, `trips`, and `trip_stops`,
- relationships of `users 1─N trips`, `trips 1─N trip_stops`, and `trip_stops N─1 destinations`.

Task 2 established the database and ORM foundation. The current repository now contains a working Drizzle configuration (`drizzle.config.ts`) and a placeholder schema file (`src/db/schema.ts`) that exists only to validate the migration workflow. This task must replace that placeholder-only model with the real application schema that later authentication, destination, seed-data, and trip-management tasks will build on.

## Goal

Define the canonical application data model in `src/db/schema.ts` for the four core tables — `users`, `destinations`, `trips`, and `trip_stops` — together with their foreign-key relationships, relational metadata, and core integrity constraints.

The resulting schema design should:

- align with `docs/design.md`,
- support the user stories in `docs/requirements.md`,
- remain simple and SQLite-friendly,
- provide strong enough constraints that later API and business-logic tasks can rely on database-level correctness instead of re-implementing all integrity checks in application code.

## Non-Goals

- Implementing authentication logic, password hashing, session handling, or registration endpoints.
- Implementing destination list/detail APIs, trip CRUD APIs, or trip stop reorder APIs.
- Populating real destination seed data or downloading image assets.
- Designing secondary tables such as reviews, favorites, tags, audit logs, or session tables.
- Adding full-text search, geospatial querying, or analytics-oriented denormalized tables.
- Defining advanced reporting models or production data archival strategies.

## Current State

The repository already contains the persistence infrastructure introduced by Task 2:

- `drizzle.config.ts` points Drizzle Kit at `./src/db/schema.ts` and outputs migrations to `./drizzle`.
- The project is configured for the SQLite dialect with a default database URL of `file:./data/app.db`.
- `src/db/schema.ts` currently contains a placeholder `_migrations_test` table used only to validate migration generation.
- `src/db/index.ts` creates the database connection via `createDatabase()`, which imports `* as schema` from `./schema` and passes it to `drizzle()`. It currently enables `journal_mode = WAL` but does **not** enable `PRAGMA foreign_keys = ON`.
- `src/db/index.test.ts` imports the placeholder `migrationsTest` table from `./schema` and includes a test case ("supports schema integration with placeholder table after migration") that inserts into and queries this table. This test will break when the placeholder is removed.
- One existing migration (`drizzle/0000_marvelous_mulholland_black.sql`) creates only the `_migrations_test` table.

What is still missing is the actual application schema.

As a result:

- there is no durable structure for user registration or login identity,
- there is no destination catalog for browsing and filtering,
- there is no trip ownership model,
- there is no normalized itinerary-stop model to support ordered trip planning.

Additionally, SQLite does **not** enforce foreign key constraints by default. Without explicitly enabling `PRAGMA foreign_keys = ON` on every connection, all foreign-key-dependent behavior defined in this task (CASCADE, RESTRICT) will be silently ignored at runtime.

Task 3 should therefore be treated as the point where the placeholder schema is retired, foreign key enforcement is activated, and the real source-of-truth data model is established.

## Proposed Design

### 1. Schema Scope and Ownership

`src/db/schema.ts` should become the canonical source of truth for all four core application tables and their Drizzle relation definitions.

The implementation should:

- remove the placeholder `_migrations_test` table,
- define the four production tables in a single schema module,
- export relation metadata for cross-table navigation,
- keep naming aligned with the repository-wide design document by using snake_case SQL column names.

The schema should stay intentionally narrow. Only columns required by the current product requirements and design should be introduced now. This prevents prematurely committing to fields that have no current product behavior behind them.

### 2. Table Definitions

#### 2.1 `users`

This table provides the identity record used by the credentials-based authentication flow described in `docs/design.md`.

| Column | SQLite type | Constraints | Purpose |
|---|---|---|---|
| `id` | `INTEGER` | primary key, autoincrement | Stable internal user identifier |
| `email` | `TEXT` | not null, unique | Login identifier |
| `password_hash` | `TEXT` | not null | Stores the bcrypt hash rather than a plaintext password |
| `name` | `TEXT` | not null | Display name for the user |
| `avatar_url` | `TEXT` | nullable | Optional profile image URL |
| `created_at` | `TEXT` | not null, default `CURRENT_TIMESTAMP` | Record creation timestamp |

Design notes:

- `email` must be unique because the product supports email/password login.
- `password_hash` matches the repository-wide design doc and keeps hashing concerns outside the schema layer.
- `avatar_url` remains optional because avatar upload/management is not part of the current requirements but the design doc already anticipates profile imagery.
- No `updated_at` column is required yet because current user stories do not include editable profile management.

Recommended integrity expectations:

- The application layer should normalize email addresses before insert and lookup.
- The database should enforce uniqueness; the app should not rely on pre-insert existence checks alone.

#### 2.2 `destinations`

This table stores the curated destination catalog that powers public browsing, filtering, and detail pages.

| Column | SQLite type | Constraints | Purpose |
|---|---|---|---|
| `id` | `INTEGER` | primary key, autoincrement | Stable destination identifier |
| `name` | `TEXT` | not null | Destination name |
| `description` | `TEXT` | nullable | Long-form descriptive copy |
| `country` | `TEXT` | not null | Country name |
| `region` | `TEXT` | nullable | High-level region used in filters |
| `category` | `TEXT` | not null | Destination type such as `beach`, `mountain`, `city`, `countryside` |
| `price_level` | `INTEGER` | not null | Price bucket used in filtering |
| `rating` | `REAL` | not null, default `0` | Aggregate rating used in sorting/display |
| `best_season` | `TEXT` | nullable | Human-readable best travel season |
| `latitude` | `REAL` | nullable | Coordinate for map/detail display |
| `longitude` | `REAL` | nullable | Coordinate for map/detail display |
| `image` | `TEXT` | not null | Local image filename/path reference |
| `created_at` | `TEXT` | not null, default `CURRENT_TIMESTAMP` | Record creation timestamp |

Design notes:

- The column name should remain `image` to stay aligned with `docs/design.md` and the intended API response shape.
- `description`, `region`, `best_season`, and coordinates remain nullable so initial seed data can be introduced incrementally if needed.
- `price_level` and `rating` are required because filtering and sorting behavior depends on them.
- This table represents curated travel content, not user-generated entries.

Recommended integrity expectations:

- `price_level` should be constrained to the documented 1–5 scale.
- `rating` should be constrained to the documented 0–5 range.
- `category` should be constrained to the currently supported set from the design document (`beach`, `mountain`, `city`, `countryside`) so downstream filtering logic has predictable values.

#### 2.3 `trips`

This table stores the top-level trip container owned by a single authenticated user.

| Column | SQLite type | Constraints | Purpose |
|---|---|---|---|
| `id` | `INTEGER` | primary key, autoincrement | Stable trip identifier |
| `user_id` | `INTEGER` | not null, foreign key → `users.id` | Trip owner |
| `title` | `TEXT` | not null | User-defined trip title |
| `start_date` | `TEXT` | nullable | Planned departure date |
| `end_date` | `TEXT` | nullable | Planned return date |
| `status` | `TEXT` | not null, default `'draft'` | Lifecycle status |
| `created_at` | `TEXT` | not null, default `CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TEXT` | not null, default `CURRENT_TIMESTAMP` | Last update timestamp |

Design notes:

- `user_id` models ownership directly and is required for all trip records.
- `status` should initially support the values documented in `docs/design.md`: `draft`, `planned`, and `completed`.
- `start_date` and `end_date` remain nullable because users may create draft trips before entering dates.
- Storing dates as `TEXT` is consistent with the repository-wide design and keeps SQLite storage straightforward.

Recommended integrity expectations:

- The foreign key from `trips.user_id` should use `ON DELETE CASCADE` so a deleted user does not leave orphaned trips.
- `status` should be constrained to the supported lifecycle values.
- The application layer should ensure `start_date <= end_date` when both are present; this may optionally be reinforced with a database `CHECK` if implementation complexity remains reasonable in Drizzle/SQLite.

#### 2.4 `trip_stops`

This table stores the normalized itinerary rows belonging to a trip. Each stop references a destination and preserves ordering within the trip.

| Column | SQLite type | Constraints | Purpose |
|---|---|---|---|
| `id` | `INTEGER` | primary key, autoincrement | Stable stop identifier |
| `trip_id` | `INTEGER` | not null, foreign key → `trips.id` | Parent trip |
| `destination_id` | `INTEGER` | not null, foreign key → `destinations.id` | Referenced destination |
| `sort_order` | `INTEGER` | not null | Position within the itinerary |
| `arrival_date` | `TEXT` | nullable | Planned arrival date |
| `departure_date` | `TEXT` | nullable | Planned departure date |
| `notes` | `TEXT` | nullable | Optional traveler notes |

Design notes:

- `trip_stops` should be modeled as its own table instead of embedding destination IDs in `trips`; this is required to support reordering, per-stop notes, and per-stop dates.
- `sort_order` is required because user story US-3.2 explicitly calls for stop reordering.
- `arrival_date` and `departure_date` are nullable to allow lightweight itinerary drafting.

Recommended integrity expectations:

- The foreign key from `trip_stops.trip_id` should use `ON DELETE CASCADE` so deleting a trip removes all associated stops.
- The foreign key from `trip_stops.destination_id` should use `ON DELETE RESTRICT` (or SQLite `NO ACTION`) so curated destination records cannot be removed while referenced by an itinerary.
- A uniqueness constraint on (`trip_id`, `sort_order`) should guarantee one stop position per trip.
- The application layer should ensure stop dates fall within the trip-level range when both are present; this does not need to be encoded as a cross-table database constraint in this task.

### 3. Relationships and Referential Behavior

The relational model should match the repository-wide ER design and be encoded in both foreign keys and Drizzle `relations()` definitions.

#### 3.1 Relationship map

- One `user` has many `trips`.
- One `trip` belongs to one `user`.
- One `trip` has many `trip_stops`.
- One `trip_stop` belongs to one `trip`.
- One `destination` can appear in many `trip_stops`.
- One `trip_stop` belongs to one `destination`.

#### 3.2 Referential actions

Recommended delete/update behavior:

| Foreign key | Delete behavior | Rationale |
|---|---|---|
| `trips.user_id → users.id` | `ON DELETE CASCADE` | User-owned data should be removed with the user |
| `trip_stops.trip_id → trips.id` | `ON DELETE CASCADE` | Stops should not survive their parent trip |
| `trip_stops.destination_id → destinations.id` | `ON DELETE RESTRICT` / `NO ACTION` | Curated destinations should not be deleted while itineraries still reference them |

No cross-table cascading is needed beyond the above. This keeps referential rules easy to reason about while preventing accidental orphan records.

### 4. Indexing and Data Integrity

The schema should include a small, purposeful set of indices and constraints that directly support current product requirements.

#### 4.1 Required uniqueness constraints

- `users.email` unique.
- `trip_stops (trip_id, sort_order)` unique.

#### 4.2 Recommended query-supporting indexes

- Index on `trips.user_id` for authenticated trip listing.
- Index on `trip_stops.trip_id` for trip detail loading.
- Index on `trip_stops.destination_id` for destination-reference lookups.
- Index on `destinations.category` for category filtering.
- Index on `destinations.region` for region filtering.
- Index on `destinations.price_level` for price-range filtering.

A separate index on `destinations.rating` is optional. It is helpful for sort-heavy read patterns, but it is not as important as the equality/range filter columns above for the current product scope.

#### 4.3 Recommended `CHECK` constraints

Where practical in Drizzle/SQLite, the implementation should encode the following constraints at the database layer:

- `destinations.price_level` is between 1 and 5.
- `destinations.rating` is between 0 and 5.
- `destinations.category` is one of the currently supported category literals.
- `trips.status` is one of `draft`, `planned`, `completed`.
- `trip_stops.sort_order` is greater than 0.

These constraints reduce invalid states that would otherwise have to be caught repeatedly in API handlers.

### 5. Foreign Key Enforcement

SQLite does not enforce foreign key constraints by default. All foreign-key-dependent behavior in this schema — `ON DELETE CASCADE` on `trips.user_id` and `trip_stops.trip_id`, `ON DELETE RESTRICT` on `trip_stops.destination_id` — requires that `PRAGMA foreign_keys = ON` is executed on every database connection before any DML statement.

The implementation must add the following pragma to the `createDatabase()` function in `src/db/index.ts`, immediately after the existing `journal_mode = WAL` pragma:

```
sqlite.pragma("foreign_keys = ON");
```

Without this change, foreign key constraints will be silently unenforced at runtime, and the validation expectations in section 8 (cascade deletion, restrict deletion) will not hold.

### 6. Drizzle Schema Conventions

The implementation should follow these schema-authoring conventions inside `src/db/schema.ts`:

- Export one table constant per table: `users`, `destinations`, `trips`, `tripStops`.
- Use SQL table names exactly matching the design document: `users`, `destinations`, `trips`, `trip_stops`.
- Use snake_case SQL column names to match the rest of the database design.
- Use Drizzle relation exports such as `usersRelations`, `destinationsRelations`, `tripsRelations`, and `tripStopsRelations`.
- Keep schema definitions type-safe and explicit; avoid inferred magic or ad hoc helper abstractions that obscure the database contract.

For constant-like value sets such as destination categories and trip statuses, the implementation should avoid TypeScript `enum` usage and prefer `as const` arrays/objects if shared literals are needed. That stays aligned with the repository coding standards.

#### 6.1 Drizzle API Notes (v0.45.x)

The project uses `drizzle-orm` v0.45.x. The following API patterns apply:

- Table extras (indexes, unique constraints, check constraints) use the **array-based third argument** syntax for `sqliteTable`:
  ```typescript
  export const myTable = sqliteTable("my_table", {
    /* columns */
  }, (table) => [
    index("idx_name").on(table.column),
    uniqueIndex("uq_name").on(table.col1, table.col2),
    check("chk_name", sql`...`),
  ]);
  ```
- `check` is imported from `drizzle-orm/sqlite-core`.
- The `sql` template tag used in CHECK constraint expressions is imported from `drizzle-orm`.
- `relations` is imported from `drizzle-orm` and defined as separate exported constants (e.g., `usersRelations`).
- Drizzle's `text("column", { enum: [...] })` option provides **TypeScript-level** type narrowing only; it does not generate a database CHECK constraint. Both the `{ enum }` option (for type safety) and an explicit `check()` (for database enforcement) should be used together where documented CHECK constraints are required.

### 7. Migration Expectations

Task 3 should produce a migration that replaces the placeholder migration-test schema with the real application schema.

The expected migration outcome is:

- `_migrations_test` is removed from the canonical schema.
- The four application tables are created.
- Foreign keys, uniqueness constraints, and indexes described above are reflected in the generated migration.

Since no production database exists yet, the cleanest approach is to delete the existing placeholder migration (`drizzle/0000_marvelous_mulholland_black.sql` and its snapshot in `drizzle/meta/`) and run `npx drizzle-kit generate` to produce a single fresh migration containing only the four production tables. This avoids an unnecessary incremental migration that drops a table nobody depends on in production. If Drizzle Kit has issues with a fresh generation, the fallback is to keep the existing migration and generate an incremental migration on top of it.

### 8. Test Strategy

Tests should follow TDD: write failing tests first, then implement the schema to make them pass.

#### 8.1 New test file: `src/db/schema.test.ts`

This file should contain schema-focused integration tests that verify the database structure and constraint behavior after migrations are applied. Each test should use an isolated temporary SQLite database created via `createDatabase()` with migrations applied.

Tests should cover at minimum:

1. All four tables are created and accept valid inserts.
2. `users.email` uniqueness is enforced (duplicate email insert fails).
3. `trip_stops (trip_id, sort_order)` uniqueness is enforced (duplicate pair insert fails).
4. `ON DELETE CASCADE` from `trips` to `trip_stops` works (deleting a trip removes its stops).
5. `ON DELETE CASCADE` from `users` to `trips` works (deleting a user removes their trips).
6. `ON DELETE RESTRICT` on `trip_stops.destination_id` works (deleting a referenced destination fails).
7. CHECK constraints reject invalid values for `price_level`, `rating`, `category`, `status`, and `sort_order`.

The test environment annotation `// @vitest-environment node` should be used since these tests require `better-sqlite3` (a native Node module).

#### 8.2 Existing test file: `src/db/index.test.ts`

The last test case ("supports schema integration with placeholder table after migration") imports `migrationsTest` from `./schema` and inserts into the `_migrations_test` table. When the placeholder table is removed, this test will fail at compile time (missing export) and at runtime (missing table).

This test must be updated to use one of the new production tables instead (e.g., `users` or `destinations`). The replacement test should:

- Import a production table from `./schema`.
- Apply migrations to the temporary database.
- Insert a valid row and verify the insert/query round-trip.

The intent of the test (verifying that schema integration with migrations works end-to-end) should be preserved.

## Implementation Plan

1. **Enable foreign key enforcement**: Add `sqlite.pragma("foreign_keys = ON")` to `createDatabase()` in `src/db/index.ts`, immediately after the existing `journal_mode = WAL` pragma.
2. **Write schema tests first (TDD)**: Create `src/db/schema.test.ts` with the integration tests described in section 8.1. These tests should fail initially since the production tables do not exist yet.
3. **Replace the placeholder schema**: Remove the `_migrations_test` definition from `src/db/schema.ts` and define the four production tables (`users`, `destinations`, `trips`, `tripStops`) with all columns, foreign keys, uniqueness constraints, CHECK constraints, and indexes as described in sections 2–4.
4. **Add Drizzle relation definitions**: Export `usersRelations`, `destinationsRelations`, `tripsRelations`, and `tripStopsRelations` in the same schema file.
5. **Update the existing test**: Modify `src/db/index.test.ts` to replace the `migrationsTest` import and placeholder-table test case with an equivalent test using one of the new production tables (see section 8.2).
6. **Generate a fresh migration**: Delete the existing placeholder migration files and run `npx drizzle-kit generate` to produce a clean migration for the four production tables.
7. **Run all tests and validate**: Execute `npm run test` to confirm all schema constraint tests pass and existing database connection tests remain green.
