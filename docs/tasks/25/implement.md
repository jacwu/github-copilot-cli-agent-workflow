# Task 2 Implementation Summary: Configure Database and ORM

## Issue
- **Issue number**: #25
- **Title**: Task 2: Configure Database and ORM

## Changes

### Dependencies Added
- `better-sqlite3` (runtime) — native SQLite driver
- `drizzle-orm` (runtime) — type-safe ORM layer
- `drizzle-kit` (dev) — migration generation and studio tooling
- `@types/better-sqlite3` (dev) — TypeScript type declarations

### Files Created
| File | Purpose |
|---|---|
| `src/db/schema.ts` | Drizzle schema with placeholder `_migrations_test` table |
| `src/db/index.ts` | `createDatabase` factory + default `db` singleton export |
| `src/db/migrate.ts` | Programmatic migration runner |
| `src/db/index.test.ts` | Unit tests for database module (6 tests) |
| `drizzle.config.ts` | Drizzle Kit configuration |
| `.env.example` | Documents `DATABASE_URL` variable |
| `drizzle/0000_marvelous_mulholland_black.sql` | Initial migration SQL |
| `drizzle/meta/_journal.json` | Drizzle migration metadata |
| `drizzle/meta/0000_snapshot.json` | Drizzle schema snapshot |

### Files Modified
| File | Change |
|---|---|
| `next.config.ts` | Added `serverExternalPackages: ["better-sqlite3"]` |
| `.gitignore` | Added patterns for `data/`, `*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm` |
| `package.json` | Added `db:generate`, `db:migrate`, `db:studio` scripts |
| `package-lock.json` | Updated with new dependencies |

### Key Design Decisions
- **Factory function pattern**: `createDatabase(url)` allows tests to use temporary databases without mutating environment variables.
- **Fail-fast validation**: Throws immediately if `DATABASE_URL` is missing or empty.
- **Path normalization**: Strips `file:` prefix before passing to `better-sqlite3`.
- **WAL mode**: Enabled `journal_mode = WAL` for better concurrent read performance.
- **Vitest environment override**: Tests use `// @vitest-environment node` directive to run `better-sqlite3` in Node (global default is `jsdom`).

## Validation Results

| Check | Result |
|---|---|
| `npm install` | ✅ All dependencies installed |
| `npm run db:generate` | ✅ Migration generated under `drizzle/` |
| `npm run db:migrate` | ✅ Migrations applied successfully |
| `npm run test` | ✅ 13 tests passed (3 files) |
| `npm run build` | ✅ Build succeeded |
| `npm run lint` | ✅ No lint errors |

## Test Coverage
- `src/db/index.test.ts` — 6 tests:
  1. Throws when URL is empty
  2. Throws when URL is only whitespace
  3. Strips `file:` prefix and connects successfully
  4. Connects without `file:` prefix
  5. Creates parent directories if they do not exist
  6. Schema integration with placeholder table after migration

## Open Items
- None. The placeholder `_migrations_test` table in `schema.ts` will be replaced by real application tables in Task 3.
