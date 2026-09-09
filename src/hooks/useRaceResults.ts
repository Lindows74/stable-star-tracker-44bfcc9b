import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RaceResultRow {
  id: number;
  horse_id: number;
  race_id: number;
  time_ms: number;
  raced_at: string;
  horses?: { id: number; name: string; tier: number | null; gender: string | null } | null;
  live_races?: {
    id: number;
    race_name: string;
    surface: string;
    distance: string;
    tier_restriction: string | null;
  } | null;
}

export const useRaceResults = () => {
  return useQuery({
    queryKey: ["race_results"],
    queryFn: async (): Promise<RaceResultRow[]> => {
      const { data, error } = await supabase
        .from("race_results")
        .select(
          `id, horse_id, race_id, time_ms, raced_at,
           horses(id, name, tier, gender),
           live_races(id, race_name, surface, distance, tier_restriction)`
        )
        .order("time_ms", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as RaceResultRow[];
    },
  });
};

export interface BestTime {
  raceId: number;
  race: RaceResultRow["live_races"];
  timeMs: number;
  runs: number;
}

// Key for a race "type": surface + distance (matches Live Events grouping,
// so duplicate race entries of the same type share best times)
export const raceTypeKey = (race: RaceResultRow["live_races"]) =>
  race ? `${race.surface}|${race.distance}` : "";

// Best (lowest) time per race type, grouped by horse id
export const buildBestTimesByHorse = (rows: RaceResultRow[] = []) => {
  const map = new Map<number, Map<string, BestTime>>();

  rows.forEach((row) => {
    if (!map.has(row.horse_id)) map.set(row.horse_id, new Map());
    const byRace = map.get(row.horse_id)!;
    const key = raceTypeKey(row.live_races) || `race-${row.race_id}`;
    const existing = byRace.get(key);
    if (!existing) {
      byRace.set(key, {
        raceId: row.race_id,
        race: row.live_races,
        timeMs: row.time_ms,
        runs: 1,
      });
    } else {
      existing.runs += 1;
      if (row.time_ms < existing.timeMs) {
        existing.timeMs = row.time_ms;
        existing.raceId = row.race_id;
        existing.race = row.live_races;
      }
    }
  });

  const result = new Map<number, BestTime[]>();
  map.forEach((byRace, horseId) => {
    result.set(horseId, Array.from(byRace.values()).sort((a, b) => a.timeMs - b.timeMs));
  });
  return result;
};

export const useBestTimesForHorse = (horseId: number) => {
  const { data, isLoading } = useRaceResults();
  const best = buildBestTimesByHorse(data || []).get(horseId) || [];
  return { bestTimes: best, isLoading };
};

// Fastest recorded time per race type + horse tier (key: "surface|distance|tier")
export const buildTierBestTimes = (rows: RaceResultRow[] = []) => {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const tier = row.horses?.tier;
    if (tier == null) return;
    const key = `${raceTypeKey(row.live_races) || `race-${row.race_id}`}|${tier}`;
    const existing = map.get(key);
    if (existing == null || row.time_ms < existing) map.set(key, row.time_ms);
  });
  return map;
};

export const useTierBestTimes = () => {
  const { data } = useRaceResults();
  return buildTierBestTimes(data || []);
};
