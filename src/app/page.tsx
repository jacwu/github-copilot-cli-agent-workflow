export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <main className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Travel Website
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover breathtaking destinations and plan your next adventure.
        </p>
        <div className="mt-4 rounded-2xl bg-card p-8 shadow-sm">
          <p className="text-sm text-foreground">
            This placeholder confirms the project scaffold and theme are active.
            Ocean Teal primary color, light background, large radii, and soft
            shadows are configured.
          </p>
        </div>
      </main>
    </div>
  );
}
