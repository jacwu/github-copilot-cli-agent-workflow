export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center gap-12 text-center">
          {/* Hero card demonstrating Ocean Teal, rounded corners, and soft shadows */}
          <div className="w-full max-w-2xl rounded-3xl bg-card p-10 shadow-card sm:p-14">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Discover Your Next{" "}
              <span className="text-primary">Adventure</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Browse breathtaking destinations, plan unforgettable trips, and
              explore the world — all in one place.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-medium text-primary-foreground shadow-card transition-shadow hover:shadow-card-hover">
                Explore Destinations
              </div>
              <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-secondary px-8 text-base font-medium text-secondary-foreground transition-shadow hover:shadow-card">
                Plan a Trip
              </div>
            </div>
          </div>

          {/* Sample cards showing the airy aesthetic */}
          <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                title: "Beach Getaways",
                description: "Sun, sand, and crystal-clear waters await.",
              },
              {
                title: "Mountain Retreats",
                description: "Breathtaking peaks and serene trails.",
              },
              {
                title: "City Adventures",
                description: "Vibrant culture and iconic landmarks.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <span className="text-lg text-primary">✦</span>
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  {card.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
