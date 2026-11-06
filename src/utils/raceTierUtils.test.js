import { describe, expect, test } from "bun:test";
import { isHorseTierEligible } from "./raceTierUtils";

describe("live race grade eligibility, including recorded-time horses", () => {
  test("odd races allow only tiers 3, 5, 7 and 9", () => {
    expect(Array.from({ length: 10 }, (_, i) => i + 1)
      .filter(tier => isHorseTierEligible("odd_grades", tier))).toEqual([3, 5, 7, 9]);
  });
  test("even races allow only tiers 2, 4, 6 and 8", () => {
    expect(Array.from({ length: 10 }, (_, i) => i + 1)
      .filter(tier => isHorseTierEligible("even_grades", tier))).toEqual([2, 4, 6, 8]);
  });
  test("unknown tiers cannot enter restricted races", () => {
    expect(isHorseTierEligible("odd_grades", null)).toBe(false);
    expect(isHorseTierEligible("even_grades", undefined)).toBe(false);
  });
  test("unrestricted races retain both odd and even horses", () => {
    expect(isHorseTierEligible(null, 8)).toBe(true);
    expect(isHorseTierEligible(null, 9)).toBe(true);
  });
});