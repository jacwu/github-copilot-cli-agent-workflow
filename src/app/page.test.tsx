import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Home from "./page";

describe("Home page", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(screen.getByText("Travel Website")).toBeInTheDocument();
  });

  it("displays the tagline", () => {
    render(<Home />);
    expect(
      screen.getByText("Discover destinations and plan your next adventure.")
    ).toBeInTheDocument();
  });
});
