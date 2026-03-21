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

What is still missing is the actual application schema.

As a result:

- there is no durable structure for user registration or login identity,
- there is no destination catalog for browsing and filtering,
- there is no trip ownership model,
- there is no normalized itinerary-stop model to support ordered trip planning.

Task 3 should therefore be treated as the point where the placeholder schema is retired and the real source-of-truth data model is established.

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

### 5. Drizzle Schema Conventions

The implementation should follow these schema-authoring conventions inside `src/db/schema.ts`:

- Export one table constant per table: `users`, `destinations`, `trips`, `tripStops`.
- Use SQL table names exactly matching the design document: `users`, `destinations`, `trips`, `trip_stops`.
- Use snake_case SQL column names to match the rest of the database design.
- Use Drizzle relation exports such as `usersRelations`, `destinationsRelations`, `tripsRelations`, and `tripStopsRelations`.
- Keep schema definitions type-safe and explicit; avoid inferred magic or ad hoc helper abstractions that obscure the database contract.

For constant-like value sets such as destination categories and trip statuses, the implementation should avoid TypeScript `enum` usage and prefer `as const` arrays/objects if shared literals are needed. That stays aligned with the repository coding standards.

### 6. Migration Expectations

Task 3 should produce a migration that replaces the placeholder migration-test schema with the real application schema.

The expected migration outcome is:

- `_migrations_test` is removed from the canonical schema.
- The four application tables are created.
- Foreign keys, uniqueness constraints, and indexes described above are reflected in the generated migration.

Because SQLite has limited support for destructive schema rewrites, the implementation should rely on Drizzle Kit’s generated migration output rather than attempting to hand-edit SQL unless the generated result is clearly incorrect.

### 7. Validation Expectations

When implemented, the following should be verifiable:

1. `src/db/schema.ts` exports the four production tables and their relations with no placeholder table remaining.
2. Drizzle can generate a migration from the schema without errors.
3. Applying migrations creates all four tables with the expected foreign keys and constraints.
4. Inserting duplicate user emails fails at the database layer.
5. Inserting a `trip_stop` with a duplicate `(trip_id, sort_order)` pair fails at the database layer.
6. Deleting a trip removes its stops automatically.
7. Deleting a destination that is still referenced by a trip stop fails.
8. Destination browse queries can efficiently filter by category, region, and price level using the declared schema/indexes.

## Implementation Plan

1. Replace the placeholder `_migrations_test` definition in `src/db/schema.ts` with the four real table definitions and associated Drizzle relations.
2. Encode the required foreign keys, uniqueness constraints, and the recommended `CHECK` constraints that are practical to represent cleanly in Drizzle for SQLite.
3. Add the supporting indexes needed for trip ownership queries and destination filtering.
4. Generate a new Drizzle migration so the migration history reflects the transition from the placeholder schema to the real application model.
5. Add or update schema-focused tests first, validating critical constraints such as unique emails, cascading trip-stop deletion, and duplicate stop-order rejection.
6. Run the existing database migration and test workflows to confirm the schema is valid, consistent, and ready for Tasks 4, 6, 7, and 9.
