import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("uses the airy rounded default styling", () => {
    render(<Button>Explore destinations</Button>);

    const button = screen.getByRole("button", {
      name: "Explore destinations",
    });

    expect(button.className).toContain("rounded-2xl");
    expect(button.className).toContain("shadow-card");
    expect(button.className).toContain("bg-primary");
  });

  it("keeps the secondary variant aligned with the warm neutral palette", () => {
    render(<Button variant="secondary">Plan a trip</Button>);

    const button = screen.getByRole("button", { name: "Plan a trip" });

    expect(button.className).toContain("bg-secondary");
    expect(button.className).toContain("text-secondary-foreground");
    expect(button.className).toContain("shadow-card");
  });
});
