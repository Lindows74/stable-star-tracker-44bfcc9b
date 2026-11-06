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