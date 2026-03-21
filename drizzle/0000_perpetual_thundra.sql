CREATE TABLE `destinations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`country` text NOT NULL,
	`region` text,
	`category` text NOT NULL,
	`price_level` integer NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`best_season` text,
	`latitude` real,
	`longitude` real,
	`image` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "chk_destinations_price_level" CHECK("destinations"."price_level" >= 1 AND "destinations"."price_level" <= 5),
	CONSTRAINT "chk_destinations_rating" CHECK("destinations"."rating" >= 0 AND "destinations"."rating" <= 5),
	CONSTRAINT "chk_destinations_category" CHECK("destinations"."category" IN ('beach', 'mountain', 'city', 'countryside'))
);
--> statement-breakpoint
CREATE INDEX `idx_destinations_category` ON `destinations` (`category`);--> statement-breakpoint
CREATE INDEX `idx_destinations_region` ON `destinations` (`region`);--> statement-breakpoint
CREATE INDEX `idx_destinations_price_level` ON `destinations` (`price_level`);--> statement-breakpoint
CREATE TABLE `trip_stops` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`destination_id` integer NOT NULL,
	`sort_order` integer NOT NULL,
	`arrival_date` text,
	`departure_date` text,
	`notes` text,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "chk_trip_stops_sort_order" CHECK("trip_stops"."sort_order" > 0)
);
--> statement-breakpoint
CREATE INDEX `idx_trip_stops_trip_id` ON `trip_stops` (`trip_id`);--> statement-breakpoint
CREATE INDEX `idx_trip_stops_destination_id` ON `trip_stops` (`destination_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_trip_stops_trip_sort` ON `trip_stops` (`trip_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`start_date` text,
	`end_date` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "chk_trips_status" CHECK("trips"."status" IN ('draft', 'planned', 'completed'))
);
--> statement-breakpoint
CREATE INDEX `idx_trips_user_id` ON `trips` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);