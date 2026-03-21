// @vitest-environment node
import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { createDatabase } from "./index";
import { users, destinations, trips, tripStops } from "./schema";

function makeTempDb() {
  const dir = join(tmpdir(), `schema-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  const url = `file:${join(dir, "test.db")}`;
  const db = createDatabase(url);
  migrate(db, { migrationsFolder: "./drizzle" });
  return { db, dir };
}

describe("schema integration", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
    tempDirs.length = 0;
  });

  function setup() {
    const { db, dir } = makeTempDb();
    tempDirs.push(dir);
    return db;
  }

  // --- Table creation and valid inserts ---

  it("creates users table and accepts valid inserts", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "alice@example.com",
        passwordHash: "hash123",
        name: "Alice",
      })
      .run();

    const rows = db.select().from(users).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("alice@example.com");
    expect(rows[0].name).toBe("Alice");
    expect(rows[0].id).toBe(1);
    expect(rows[0].createdAt).toBeDefined();
  });

  it("creates destinations table and accepts valid inserts", () => {
    const db = setup();
    db.insert(destinations)
      .values({
        name: "Bali",
        country: "Indonesia",
        category: "beach",
        priceLevel: 2,
        rating: 4.7,
        image: "bali.jpg",
      })
      .run();

    const rows = db.select().from(destinations).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Bali");
    expect(rows[0].priceLevel).toBe(2);
    expect(rows[0].rating).toBe(4.7);
  });

  it("creates trips table and accepts valid inserts", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "bob@example.com",
        passwordHash: "hash",
        name: "Bob",
      })
      .run();

    db.insert(trips)
      .values({
        userId: 1,
        title: "Summer Trip",
        status: "draft",
      })
      .run();

    const rows = db.select().from(trips).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Summer Trip");
    expect(rows[0].userId).toBe(1);
    expect(rows[0].status).toBe("draft");
  });

  it("creates trip_stops table and accepts valid inserts", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "carol@example.com",
        passwordHash: "hash",
        name: "Carol",
      })
      .run();
    db.insert(destinations)
      .values({
        name: "Paris",
        country: "France",
        category: "city",
        priceLevel: 4,
        image: "paris.jpg",
      })
      .run();
    db.insert(trips)
      .values({ userId: 1, title: "Europe Trip" })
      .run();
    db.insert(tripStops)
      .values({
        tripId: 1,
        destinationId: 1,
        sortOrder: 1,
      })
      .run();

    const rows = db.select().from(tripStops).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].tripId).toBe(1);
    expect(rows[0].destinationId).toBe(1);
    expect(rows[0].sortOrder).toBe(1);
  });

  // --- Uniqueness constraints ---

  it("enforces unique email on users", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "dup@example.com",
        passwordHash: "hash",
        name: "User1",
      })
      .run();

    expect(() =>
      db
        .insert(users)
        .values({
          email: "dup@example.com",
          passwordHash: "hash2",
          name: "User2",
        })
        .run()
    ).toThrow();
  });

  it("enforces unique (trip_id, sort_order) on trip_stops", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "u@example.com",
        passwordHash: "hash",
        name: "U",
      })
      .run();
    db.insert(destinations)
      .values({
        name: "D1",
        country: "C1",
        category: "beach",
        priceLevel: 1,
        image: "d1.jpg",
      })
      .run();
    db.insert(destinations)
      .values({
        name: "D2",
        country: "C2",
        category: "city",
        priceLevel: 2,
        image: "d2.jpg",
      })
      .run();
    db.insert(trips)
      .values({ userId: 1, title: "Trip" })
      .run();
    db.insert(tripStops)
      .values({ tripId: 1, destinationId: 1, sortOrder: 1 })
      .run();

    expect(() =>
      db
        .insert(tripStops)
        .values({ tripId: 1, destinationId: 2, sortOrder: 1 })
        .run()
    ).toThrow();
  });

  // --- ON DELETE CASCADE ---

  it("cascades delete from trips to trip_stops", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "u@example.com",
        passwordHash: "hash",
        name: "U",
      })
      .run();
    db.insert(destinations)
      .values({
        name: "D",
        country: "C",
        category: "beach",
        priceLevel: 1,
        image: "d.jpg",
      })
      .run();
    db.insert(trips)
      .values({ userId: 1, title: "Trip" })
      .run();
    db.insert(tripStops)
      .values({ tripId: 1, destinationId: 1, sortOrder: 1 })
      .run();

    db.delete(trips).where(eq(trips.id, 1)).run();

    const stops = db.select().from(tripStops).all();
    expect(stops).toHaveLength(0);
  });

  it("cascades delete from users to trips", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "u@example.com",
        passwordHash: "hash",
        name: "U",
      })
      .run();
    db.insert(trips)
      .values({ userId: 1, title: "Trip" })
      .run();

    db.delete(users).where(eq(users.id, 1)).run();

    const tripsRows = db.select().from(trips).all();
    expect(tripsRows).toHaveLength(0);
  });

  // --- ON DELETE RESTRICT ---

  it("restricts deletion of a destination referenced by trip_stops", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "u@example.com",
        passwordHash: "hash",
        name: "U",
      })
      .run();
    db.insert(destinations)
      .values({
        name: "D",
        country: "C",
        category: "beach",
        priceLevel: 1,
        image: "d.jpg",
      })
      .run();
    db.insert(trips)
      .values({ userId: 1, title: "Trip" })
      .run();
    db.insert(tripStops)
      .values({ tripId: 1, destinationId: 1, sortOrder: 1 })
      .run();

    expect(() =>
      db.delete(destinations).where(eq(destinations.id, 1)).run()
    ).toThrow();
  });

  // --- CHECK constraints ---

  it("rejects price_level below 1", () => {
    const db = setup();
    expect(() =>
      db
        .insert(destinations)
        .values({
          name: "X",
          country: "Y",
          category: "beach",
          priceLevel: 0,
          image: "x.jpg",
        })
        .run()
    ).toThrow();
  });

  it("rejects price_level above 5", () => {
    const db = setup();
    expect(() =>
      db
        .insert(destinations)
        .values({
          name: "X",
          country: "Y",
          category: "beach",
          priceLevel: 6,
          image: "x.jpg",
        })
        .run()
    ).toThrow();
  });

  it("rejects rating below 0", () => {
    const db = setup();
    expect(() =>
      db
        .insert(destinations)
        .values({
          name: "X",
          country: "Y",
          category: "beach",
          priceLevel: 1,
          rating: -1,
          image: "x.jpg",
        })
        .run()
    ).toThrow();
  });

  it("rejects rating above 5", () => {
    const db = setup();
    expect(() =>
      db
        .insert(destinations)
        .values({
          name: "X",
          country: "Y",
          category: "beach",
          priceLevel: 1,
          rating: 6,
          image: "x.jpg",
        })
        .run()
    ).toThrow();
  });

  it("rejects invalid category", () => {
    const db = setup();
    expect(() =>
      db
        .insert(destinations)
        .values({
          name: "X",
          country: "Y",
          category: "jungle" as "beach",
          priceLevel: 1,
          image: "x.jpg",
        })
        .run()
    ).toThrow();
  });

  it("rejects invalid trip status", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "u@example.com",
        passwordHash: "hash",
        name: "U",
      })
      .run();

    expect(() =>
      db
        .insert(trips)
        .values({
          userId: 1,
          title: "Trip",
          status: "cancelled" as "draft",
        })
        .run()
    ).toThrow();
  });

  it("rejects sort_order less than 1", () => {
    const db = setup();
    db.insert(users)
      .values({
        email: "u@example.com",
        passwordHash: "hash",
        name: "U",
      })
      .run();
    db.insert(destinations)
      .values({
        name: "D",
        country: "C",
        category: "beach",
        priceLevel: 1,
        image: "d.jpg",
      })
      .run();
    db.insert(trips)
      .values({ userId: 1, title: "Trip" })
      .run();

    expect(() =>
      db
        .insert(tripStops)
        .values({ tripId: 1, destinationId: 1, sortOrder: 0 })
        .run()
    ).toThrow();
  });
});
