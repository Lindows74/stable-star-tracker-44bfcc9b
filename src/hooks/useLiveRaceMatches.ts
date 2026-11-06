import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isHorseTierEligible } from "@/utils/raceTierUtils";
import {
  buildRaceNumberMap,
  dedupeRacesLikeLiveEvents,
  getRaceKind,
  sortRacesCanonically,
} from "@/utils/raceTimeUtils";

export interface LiveRaceRow {
  id: number;
  race_name: string;
  surface: string;
  distance: string;
  tier_restriction: string | null;
  is_active: boolean | null;
  tier_courses?: Record<string, string> | null;
}

export interface LiveRaceMatch {
  race: LiveRaceRow;
  number: number | null;
}

export const useLiveRacesList = () =>
  useQuery({
    queryKey: ["live_races", "list"],
    queryFn: async (): Promise<LiveRaceRow[]> => {
      const { data, error } = await supabase
        .from("live_races")
        .select("id, race_name, surface, distance, tier_restriction, is_active, tier_courses")
        .order("id");
      if (error) throw error;
      return (data || []) as unknown as LiveRaceRow[];
    },
  });

export const computeHorseRaceMatches = (
  races: LiveRaceRow[] = [],
  horse: { tier?: number | null; surfaces: string[]; distances: string[] }
): LiveRaceMatch[] => {
  // Same list Live Events shows: deduped + canonically sorted + numbered
  const deduped = dedupeRacesLikeLiveEvents(races);
  const sorted = sortRacesCanonically(deduped);
  const numbers = buildRaceNumberMap(sorted);

  return sorted
    .filter((race) => {
      if (race.is_active === false) return false;
      const kind = getRaceKind(race);
      if (kind !== "sj" && !horse.surfaces.includes(race.surface)) return false;
      const checkDistance = kind !== "xc" && kind !== "sj" && String(race.distance) !== "0";
      if (checkDistance && !horse.distances.includes(String(race.distance))) return false;
      return isHorseTierEligible(race.tier_restriction, horse.tier);
    })
    .map((race) => ({ race, number: numbers.get(race.id) ?? null }));
};

export const useHorseLiveRaceMatches = (horse: {
  tier?: number | null;
  surfaces: string[];
  distances: string[];
}) => {
  const { data: races } = useLiveRacesList();
  return computeHorseRaceMatches(races || [], horse);
};
