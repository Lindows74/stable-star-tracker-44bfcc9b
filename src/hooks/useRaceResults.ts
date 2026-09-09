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

// Best (lowest) time per race, grouped by horse id
export const buildBestTimesByHorse = (rows: RaceResultRow[] = []) => {
  const map = new Map<number, Map<number, BestTime>>();

  rows.forEach((row) => {
    if (!map.has(row.horse_id)) map.set(row.horse_id, new Map());
    const byRace = map.get(row.horse_id)!;
    const existing = byRace.get(row.race_id);
    if (!existing) {
      byRace.set(row.race_id, {
        raceId: row.race_id,
        race: row.live_races,
        timeMs: row.time_ms,
        runs: 1,
      });
    } else {
      existing.runs += 1;
      if (row.time_ms < existing.timeMs) existing.timeMs = row.time_ms;
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
