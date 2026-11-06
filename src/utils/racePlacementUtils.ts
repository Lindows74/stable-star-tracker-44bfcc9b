interface PlacementResult {
  horse_id: number;
  race_id: number;
  time_ms: number;
  horses?: { tier: number | null } | null;
}

// One fastest time per horse, compared only within the same race ID and tier.
// Equal times share a competition rank (1, 1, 3); ranks beyond five are omitted.
export const buildTopFivePlacements = (rows: PlacementResult[] = []) => {
  const groups = new Map<string, Map<number, number>>();
  for (const row of rows) {
    const tier = row.horses?.tier;
    if (tier == null) continue;
    const key = `${row.race_id}|${tier}`;
    let times = groups.get(key);
    if (!times) {
      times = new Map();
      groups.set(key, times);
    }
    const previous = times.get(row.horse_id);
    if (previous == null || row.time_ms < previous) times.set(row.horse_id, row.time_ms);
  }
  const placements = new Map<string, Map<number, number>>();
  for (const [key, times] of groups) {
    const sorted = [...times.entries()].sort((a, b) => a[1] - b[1]);
    const ranks = new Map<number, number>();
    let rank = 0;
    let previousTime: number | undefined;
    sorted.forEach(([horseId, time], index) => {
      if (time !== previousTime) rank = index + 1;
      previousTime = time;
      if (rank <= 5) ranks.set(horseId, rank);
    });
    placements.set(key, ranks);
  }
  return placements;
};