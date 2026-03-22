import Link from "next/link";

import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24">
      <main
        className={cn(
          "w-full max-w-2xl rounded-3xl bg-card p-12 shadow-md",
          "flex flex-col items-center gap-8 text-center"
        )}
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Travel<span className="text-primary">Explorer</span>
        </h1>

        <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
          Discover breathtaking destinations, plan unforgettable trips, and
          explore the world — all in one place.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/destinations"
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-2xl px-8",
              "bg-primary text-primary-foreground font-medium",
              "shadow-sm transition-shadow hover:shadow-xl",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background"
            )}
          >
            Explore Destinations
          </Link>

          <Link
            href="/about"
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-2xl px-8",
              "bg-secondary text-secondary-foreground font-medium",
              "border border-border shadow-sm transition-shadow hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background"
            )}
          >
            About Us
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          The initial scaffold now includes placeholder routes for destination
          discovery and the about page, ready for later tasks to expand.
        </p>
      </main>
    </div>
  );
}
