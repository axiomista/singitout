import { describe, it, expect } from "vitest";
import { getDistanceKm, getDistanceMiles } from "@/hooks/useUserLocation";

// ---------------------------------------------------------------------------
// Distance calculations
// ---------------------------------------------------------------------------

describe("getDistanceKm", () => {
  it("returns 0 for identical coordinates", () => {
    expect(getDistanceKm(47.6062, -122.3321, 47.6062, -122.3321)).toBe(0);
  });

  it("calculates a known distance accurately", () => {
    // Seattle to Bellevue is roughly 10 km across Lake Washington
    const km = getDistanceKm(47.6062, -122.3321, 47.6101, -122.2015);
    expect(km).toBeGreaterThan(8);
    expect(km).toBeLessThan(13);
  });

  it("is symmetric — A→B equals B→A", () => {
    const ab = getDistanceKm(47.6062, -122.3321, 47.5985, -122.3275);
    const ba = getDistanceKm(47.5985, -122.3275, 47.6062, -122.3321);
    expect(ab).toBeCloseTo(ba, 10);
  });
});

describe("getDistanceMiles", () => {
  it("returns miles ≈ km × 0.621371", () => {
    const km = getDistanceKm(47.6062, -122.3321, 47.5985, -122.3275);
    const miles = getDistanceMiles(47.6062, -122.3321, 47.5985, -122.3275);
    expect(miles).toBeCloseTo(km * 0.621371, 5);
  });
});

// ---------------------------------------------------------------------------
// Day filter logic (mirrors Index.tsx)
// ---------------------------------------------------------------------------

function matchesDay(venueDays: string[], filter: string): boolean {
  return (
    filter === "all" ||
    venueDays.includes(filter) ||
    venueDays.includes("Every Day")
  );
}

describe("day filter", () => {
  it("'all' matches any venue", () => {
    expect(matchesDay(["Tuesday"], "all")).toBe(true);
    expect(matchesDay(["Every Day"], "all")).toBe(true);
    expect(matchesDay(["Monday", "Wednesday"], "all")).toBe(true);
  });

  it("matches a venue that includes the selected day", () => {
    expect(matchesDay(["Tuesday", "Thursday"], "Tuesday")).toBe(true);
    expect(matchesDay(["Friday"], "Friday")).toBe(true);
  });

  it("does not match a venue on a different day", () => {
    expect(matchesDay(["Tuesday"], "Friday")).toBe(false);
    expect(matchesDay(["Monday", "Wednesday"], "Saturday")).toBe(false);
  });

  it("'Every Day' venues match any specific day filter", () => {
    expect(matchesDay(["Every Day"], "Monday")).toBe(true);
    expect(matchesDay(["Every Day"], "Saturday")).toBe(true);
    expect(matchesDay(["Every Day"], "Wednesday")).toBe(true);
  });

  it("multi-day venue matches each of its days", () => {
    const days = ["Tuesday", "Thursday", "Saturday"];
    expect(matchesDay(days, "Tuesday")).toBe(true);
    expect(matchesDay(days, "Thursday")).toBe(true);
    expect(matchesDay(days, "Saturday")).toBe(true);
    expect(matchesDay(days, "Monday")).toBe(false);
  });
});
