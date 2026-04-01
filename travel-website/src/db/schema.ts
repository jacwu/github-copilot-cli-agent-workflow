import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const migrationsTest = sqliteTable("_migrations_test", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
