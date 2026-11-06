import { expect, test } from "bun:test";
import { buildTopFivePlacements } from "./racePlacementUtils";

const result = (horse_id, time_ms, race_id = 25, tier = 9) => ({
  horse_id, race_id, time_ms, horses: { tier },
});

test("only placements 1–5 appear, not the sixth fastest horse", () => {
  const rows = [6, 3, 1, 5, 2, 4].map(id => result(id, id * 1000));
  expect([...buildTopFivePlacements(rows).get("25|9").entries()])
    .toEqual([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]);
});
test("multiple attempts count as one horse using its fastest recorded time", () => {
  const ranks = buildTopFivePlacements([result(1, 3000), result(1, 1000), result(2, 2000)]);
  expect([...ranks.get("25|9").entries()]).toEqual([[1, 1], [2, 2]]);
});
test("placements compare only the same race and horse tier", () => {
  const ranks = buildTopFivePlacements([result(1, 3000), result(2, 1000, 26), result(3, 1000, 25, 8)]);
  expect(ranks.get("25|9").get(1)).toBe(1);
  expect(ranks.get("26|9").get(2)).toBe(1);
  expect(ranks.get("25|8").get(3)).toBe(1);
});
test("tied times share placement, including ties for fifth", () => {
  const rows = [1000, 1000, 2000, 3000, 4000, 4000, 5000].map((time, i) => result(i + 1, time));
  expect([...buildTopFivePlacements(rows).get("25|9").values()]).toEqual([1, 1, 3, 4, 5, 5]);
});
test("horses with no tier do not get a placement", () => {
  expect(buildTopFivePlacements([result(1, 1000, 25, null)]).size).toBe(0);
});
test("duplicate #4 Flat 1200m M records count a horse only once using 0:49.282, not 0:49.362", () => {
  const race = { race_name: "El Trueno", surface: "medium", distance: "1200", tier_restriction: "odd_grades" };
  const rows = [
    { ...result(129, 49282, 48), live_races: race },
    { ...result(129, 49362, 74), live_races: { ...race, race_name: "Breaker Bay" } },
    { ...result(2, 49300, 74), live_races: race },
  ];
  const ranks = buildTopFivePlacements(rows);
  expect(ranks.size).toBe(1);
  expect([...ranks.get("flat|medium|1200|odd_grades|9").entries()]).toEqual([[129, 1], [2, 2]]);
});
test("different grade restrictions and disciplines never share a leaderboard", () => {
  const race = { race_name: "Cross Country", surface: "medium", distance: "0", tier_restriction: "odd_grades" };
  const rows = [
    { ...result(1, 1000), live_races: race },
    { ...result(2, 2000), live_races: { ...race, tier_restriction: "even_grades" } },
    { ...result(3, 3000), live_races: { ...race, surface: "none", race_name: "Show Jumping" } },
  ];
  expect(buildTopFivePlacements(rows).size).toBe(3);
});