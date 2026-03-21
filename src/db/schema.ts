import { sql, relations } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  real,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

// --- Shared category / status constants ---

const DESTINATION_CATEGORIES = ["beach", "mountain", "city", "countryside"] as const;
const TRIP_STATUSES = ["draft", "planned", "completed"] as const;

// --- Tables ---

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const destinations = sqliteTable(
  "destinations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    country: text("country").notNull(),
    region: text("region"),
    category: text("category", {
      enum: DESTINATION_CATEGORIES,
    }).notNull(),
    priceLevel: integer("price_level").notNull(),
    rating: real("rating").notNull().default(0),
    bestSeason: text("best_season"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    image: text("image").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_destinations_category").on(table.category),
    index("idx_destinations_region").on(table.region),
    index("idx_destinations_price_level").on(table.priceLevel),
    check(
      "chk_destinations_price_level",
      sql`${table.priceLevel} >= 1 AND ${table.priceLevel} <= 5`
    ),
    check(
      "chk_destinations_rating",
      sql`${table.rating} >= 0 AND ${table.rating} <= 5`
    ),
    check(
      "chk_destinations_category",
      sql`${table.category} IN ('beach', 'mountain', 'city', 'countryside')`
    ),
  ]
);

export const trips = sqliteTable(
  "trips",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startDate: text("start_date"),
    endDate: text("end_date"),
    status: text("status", {
      enum: TRIP_STATUSES,
    })
      .notNull()
      .default("draft"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_trips_user_id").on(table.userId),
    check(
      "chk_trips_status",
      sql`${table.status} IN ('draft', 'planned', 'completed')`
    ),
  ]
);

export const tripStops = sqliteTable(
  "trip_stops",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    destinationId: integer("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").notNull(),
    arrivalDate: text("arrival_date"),
    departureDate: text("departure_date"),
    notes: text("notes"),
  },
  (table) => [
    index("idx_trip_stops_trip_id").on(table.tripId),
    index("idx_trip_stops_destination_id").on(table.destinationId),
    uniqueIndex("uq_trip_stops_trip_sort").on(table.tripId, table.sortOrder),
    check(
      "chk_trip_stops_sort_order",
      sql`${table.sortOrder} > 0`
    ),
  ]
);

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  tripStops: many(tripStops),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  stops: many(tripStops),
}));

export const tripStopsRelations = relations(tripStops, ({ one }) => ({
  trip: one(trips, {
    fields: [tripStops.tripId],
    references: [trips.id],
  }),
  destination: one(destinations, {
    fields: [tripStops.destinationId],
    references: [destinations.id],
  }),
}));

