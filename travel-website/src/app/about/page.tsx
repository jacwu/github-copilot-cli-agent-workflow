import Link from "next/link";

import { cn } from "@/lib/utils";

const navigationLinkClassName = cn(
  "inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-medium",
  "shadow-sm transition-shadow hover:shadow-md",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-ring focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background"
);

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-3xl bg-card p-10 shadow-md">
        <span className="inline-flex w-fit rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
          About placeholder
        </span>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            TravelExplorer starts with a calm, breathable foundation
          </h1>

          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            This route is intentionally lightweight for the scaffold phase. It
            gives the project a working about page entry point while future
            tasks fill in the product story, richer layouts, and shared
            marketing components.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl bg-secondary p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Visual system
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Ocean Teal remains the single primary accent, paired with bright
              neutrals, generous spacing, large radii, and soft shadows.
            </p>
          </article>

          <article className="rounded-3xl bg-secondary p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Scaffold readiness
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Next.js App Router, Tailwind, shadcn/ui configuration, and Vitest
              are all wired for the next implementation tasks.
            </p>
          </article>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
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
            href="/destinations"
            className={cn(
              navigationLinkClassName,
              "border border-border bg-secondary text-secondary-foreground"
            )}
          >
            Browse destinations
          </Link>
        </div>
      </div>
    </main>
  );
}
