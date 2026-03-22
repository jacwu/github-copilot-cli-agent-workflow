import Link from "next/link";

import { cn } from "@/lib/utils";

const navigationLinkClassName = cn(
  "inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-medium",
  "shadow-sm transition-shadow hover:shadow-md",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-ring focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background"
);

export default function DestinationsPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <section className="rounded-3xl bg-card p-10 shadow-md">
          <span className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            Destination discovery scaffold
          </span>

          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Browse destinations in the Light &amp; Airy travel shell
            </h1>

            <p className="text-lg leading-relaxed text-muted-foreground">
              This placeholder route confirms the App Router structure is ready
              for future search, filtering, and destination-card work without
              leaving the starter experience on broken links.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className={cn(
                navigationLinkClassName,
                "bg-primary text-primary-foreground"
              )}
            >
              Back to home
            </Link>

            <Link
              href="/about"
              className={cn(
                navigationLinkClassName,
                "border border-border bg-secondary text-secondary-foreground"
              )}
            >
              View about page
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Search</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Future tasks will add keyword search and quick destination
              discovery tools here.
            </p>
          </article>

          <article className="rounded-3xl bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Region, category, season, rating, and price filters will build on
              this shared visual foundation.
            </p>
          </article>

          <article className="rounded-3xl bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Cards</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Rounded surfaces, soft elevation, and the Ocean Teal accent are in
              place for future destination cards.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
