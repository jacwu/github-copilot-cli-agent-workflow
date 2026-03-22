import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves Tailwind conflicts by keeping the last value", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles undefined and null inputs gracefully", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });

  it("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("merges array inputs", () => {
    expect(cn(["px-4", "py-2"], "mt-2")).toBe("px-4 py-2 mt-2");
  });

  it("resolves complex Tailwind conflicts", () => {
    expect(cn("rounded-md", "rounded-2xl")).toBe("rounded-2xl");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });
});
