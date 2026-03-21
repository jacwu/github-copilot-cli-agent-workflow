import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Discover Your Next Adventure
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore breathtaking destinations and plan unforgettable trips.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </main>
  );
}
