# Task 3: Define Core Data Models — Implementation Summary

## Issue
- **Number**: #31
- **Title**: Task 3: Define Core Data Models

## Changes

### `src/db/schema.ts` — Complete rewrite
- Removed placeholder `_migrations_test` table.
- Defined four production tables:
  - **`users`**: id, email (unique), password_hash, name, avatar_url, created_at.
  - **`destinations`**: id, name, description, country, region, category, price_level, rating, best_season, latitude, longitude, image, created_at. Includes CHECK constraints for price_level (1–5), rating (0–5), and category (beach/mountain/city/countryside). Indexes on category, region, price_level.
  - **`trips`**: id, user_id (FK → users, CASCADE), title, start_date, end_date, status (CHECK: draft/planned/completed), created_at, updated_at. Index on user_id.
  - **`tripStops`**: id, trip_id (FK → trips, CASCADE), destination_id (FK → destinations, RESTRICT), sort_order, arrival_date, departure_date, notes. Unique constraint on (trip_id, sort_order). CHECK on sort_order > 0. Indexes on trip_id, destination_id.
- Exported Drizzle relation definitions: `usersRelations`, `destinationsRelations`, `tripsRelations`, `tripStopsRelations`.

### `src/db/index.ts`
- Added `sqlite.pragma("foreign_keys = ON")` after WAL pragma to enforce FK constraints.
- Made the `db` singleton lazy via Proxy to avoid crashing when `DATABASE_URL` is unset during test imports (pre-existing bug fix).

### `src/db/schema.test.ts` — New file (16 tests)
- Tests all four tables accept valid inserts.
- Tests `users.email` uniqueness enforcement.
- Tests `(trip_id, sort_order)` uniqueness enforcement.
- Tests ON DELETE CASCADE from trips → trip_stops.
- Tests ON DELETE CASCADE from users → trips.
- Tests ON DELETE RESTRICT on destinations referenced by trip_stops.
- Tests CHECK constraints reject invalid price_level, rating, category, status, and sort_order.

### `src/db/index.test.ts` — Updated
- Replaced `migrationsTest` import with `users` table.
- Updated schema integration test to insert/query from `users` table instead of removed `_migrations_test`.

### `drizzle/` — Fresh migration
- Removed placeholder migration `0000_marvelous_mulholland_black.sql`.
- Generated new migration `0000_perpetual_thundra.sql` with all four production tables, foreign keys, indexes, unique constraints, and CHECK constraints.

## Validation
- **Lint**: `npm run lint` — 0 errors, 0 warnings.
- **Tests**: `npm run test` — 31 tests passing across 4 test files.

## Open Items
- None. All task.md requirements are fulfilled.

## Revision Review — 2026-03-21

### Review Outcome
- Reviewed `src/db/schema.ts`, `src/db/index.ts`, `src/db/schema.test.ts`, `src/db/index.test.ts`, and the generated Drizzle migration/snapshot against `docs/requirements.md`, `docs/design.md`, and `docs/tasks/31/task.md`.
- Confirmed the existing implementation already matches the task design:
  - all four core tables are present with the documented columns,
  - foreign keys and delete behavior are correctly configured,
  - required indexes, uniqueness constraints, and CHECK constraints are in place,
  - Drizzle relation exports use the expected names,
  - `sqlite.pragma("foreign_keys = ON")` is enabled in `createDatabase()`,
  - migration artifacts reflect the production schema rather than the placeholder table.

### Code Revisions
- No source code changes were required after review.
- Updated this implementation summary to record the revision pass and current validation results.

### Validation
- **Lint**: `npm run lint` — passed.
- **Tests**: `npm run test` — passed (`31` tests across `4` files).
- **Build**: `npm run build` — passed.

### Remaining Items
- None. No additional issue-31 revisions are needed at this time.
