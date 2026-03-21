import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * Placeholder table used to validate the migration workflow end-to-end.
 * Will be replaced by real application tables in Task 3.
 */
export const migrationsTest = sqliteTable("_migrations_test", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
