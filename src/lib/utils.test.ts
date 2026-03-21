import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    const result = cn("bg-primary", "text-white");
    expect(result).toBe("bg-primary text-white");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toBe("base visible");
  });

  it("resolves Tailwind conflicts by keeping the last class", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("returns empty string for no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles undefined and null values", () => {
    const result = cn("flex", undefined, null, "gap-2");
    expect(result).toBe("flex gap-2");
  });
});
