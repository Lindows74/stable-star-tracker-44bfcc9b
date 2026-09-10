import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Calendar, Trophy, RefreshCw, Edit, Trash2, Circle, Triangle, Mountain, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import AddRaceForm from "@/components/races/AddRaceForm";
import EditRaceForm from "@/components/races/EditRaceForm";
import { RaceTierNote } from "@/components/races/RaceTierNote";
import { TraitsByDisciplineInline } from "@/components/horses/TraitsByDisciplineInline";
import { getHorseSpecialIcons, checkHorseHasSpeedStackingTraits, checkHorseHasJumpingStackingTraits, checkHorseHasFullStaminaTrait } from "@/utils/horseTraitUtils";
import { formatSurface, formatDateTime } from "@/utils/formatUtils";
import { isMaxTrained } from "@/utils/horseUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HorseStatsPopover } from "@/components/horses/HorseStatsPopover";
import { useRaceResults } from "@/hooks/useRaceResults";
import { formatRaceTime } from "@/utils/raceTimeUtils";

interface MatchingHorse {
  id: number;
  name: string;
  tier: number;
  traits: string[];
  speed?: number;
  sprint_energy?: number;
  acceleration?: number;
  agility?: number;
  jump?: number;
  diet_speed?: number;
  diet_sprint_energy?: number;
  diet_acceleration?: number;
  diet_agility?: number;
  diet_jump?: number;
  max_speed?: boolean;
  max_sprint_energy?: boolean;
  max_acceleration?: boolean;
  max_agility?: boolean;
  max_jump?: boolean;
}

interface RaceMatch {
  id: number;
  race_name: string;
  surface: string;
  distance: string;
  start_time: string;
  track_name: string;
  tier_restriction: string | null;
  is_active?: boolean;
  matchingHorses: MatchingHorse[];
}

interface NonMatchingHorse {
  id: number;
  name: string;
  tier: number;
  traits: string[];
  max_speed?: boolean;
  max_sprint_energy?: boolean;
  max_acceleration?: boolean;
  max_agility?: boolean;
  max_jump?: boolean;
}

const INITIAL_RACES = 5;
const LOAD_MORE_COUNT = 5;

const LiveEvents = () => {
  const [raceMatches, setRaceMatches] = useState<RaceMatch[]>([]);
  const [nonMatchingHorses, setNonMatchingHorses] = useState<NonMatchingHorse[]>([]);
  // All horses (used to show logged times even for horses that match other races)
  const [allHorsesPool, setAllHorsesPool] = useState<NonMatchingHorse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalHorses, setTotalHorses] = useState(0);
  const [editingRace, setEditingRace] = useState<RaceMatch | null>(null);
  const [deletingRaceId, setDeletingRaceId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_RACES);
  const [tierNotes, setTierNotes] = useState<Record<string, string>>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { data: raceResults } = useRaceResults();
  const [raceKeyById, setRaceKeyById] = useState<Record<number, string>>({});

  // Best (fastest) logged time per race "kind" (distance + surface), per horse.
  // Keyed by distance|surface so duplicate races of the same type share times.
  const bestTimesByKey = useMemo(() => {
    const map = new Map<string, Map<number, number>>();
    (raceResults || []).forEach((row) => {
      const key = raceKeyById[row.race_id];
      if (!key) return;
      if (!map.has(key)) map.set(key, new Map());
      const byHorse = map.get(key)!;
      const current = byHorse.get(row.horse_id);
      if (current == null || row.time_ms < current) byHorse.set(row.horse_id, row.time_ms);
    });
    return map;
  }, [raceResults, raceKeyById]);

  const raceKey = (race: any) => `${race.distance}|${race.surface}`;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('live_races').select('id, distance, surface');
      if (data) {
        const map: Record<number, string> = {};
        data.forEach((r: any) => { map[r.id] = `${r.distance}|${r.surface}`; });
        setRaceKeyById(map);
      }
    })();
  }, []);


  // Intersection observer for lazy loading more races
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, raceMatches.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [raceMatches.length]);

  // Auto-load data when component mounts
  useEffect(() => {
    fetchLiveRaces();
    fetchTierNotes();
  }, []);

  const fetchTierNotes = async () => {
    const { data, error } = await supabase
      .from('race_tier_notes')
      .select('race_id, tier, note');
    if (error) {
      console.error('Error fetching tier notes:', error);
      return;
    }
    const map: Record<string, string> = {};
    (data || []).forEach((r: any) => {
      map[`${r.race_id}:${r.tier}`] = r.note ?? '';
    });
    setTierNotes(map);
  };

  const saveTierNote = async (raceId: number, tier: number, note: string) => {
    const { error } = await supabase
      .from('race_tier_notes')
      .upsert(
        { race_id: raceId, tier, note },
        { onConflict: 'race_id,tier' },
      );
    if (error) {
      console.error('Error saving tier note:', error);
      toast({ title: 'Error', description: 'Failed to save note.', variant: 'destructive' });
      return;
    }
    setTierNotes((prev) => ({ ...prev, [`${raceId}:${tier}`]: note }));
    toast({ title: 'Saved', description: `Tier ${tier} note saved.` });
  };

  const fetchLiveRaces = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('breeding-suggestions');

      if (error) {
        console.error('Error fetching live races:', error);
        toast({
          title: "Error",
          description: "Failed to get live races data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Response:', data);

      if (data.success) {
        // Show all races including inactive ones (like "under repair" races)
        const allRaces = data.liveRaces || [];
        const raceMatchesWithAll = allRaces.map((race: any) => ({
          ...race,
          matchingHorses: data.raceMatches?.find((rm: any) => rm.id === race.id)?.matchingHorses || []
        }));
        
        // Sort to match the official list: 17 Flat, 3 Steeplechase (incl. 1100m under repair), then Cross Country
        const flatOrder = [
          { d: '800', s: 'very_soft' },
          { d: '900', s: 'firm' },
          { d: '1000', s: 'hard' },
          { d: '1200', s: 'medium' },
          { d: '1200', s: 'very_soft' },
          { d: '1400', s: 'medium' },
          { d: '1600', s: 'firm' },
          { d: '1600', s: 'hard' },
          { d: '1600', s: 'very_hard' },
          { d: '1800', s: 'very_hard' },
          { d: '2000', s: 'hard' },
          { d: '2000', s: 'soft' },
          { d: '2400', s: 'firm' },
          { d: '2800', s: 'very_hard' },
          { d: '3000', s: 'hard' },
          { d: '3200', s: 'soft' },
          { d: '3200', s: 'very_hard' },
        ];
        const steepleOrder = [
          { d: '900', s: 'very_hard' },
          { d: '1100', s: 'very_hard' }, // Under Repair (even grades)
          { d: '1400', s: 'firm' },
        ];
        
        const isSteeple = (r: any) => /steeplechase/i.test(r.race_name || '');
        const isCrossCountry = (r: any) => r.distance === '0' || /cross country/i.test(r.race_name || '');
        
        const flats = raceMatchesWithAll.filter((r: any) => !isSteeple(r) && !isCrossCountry(r));
        const steeples = raceMatchesWithAll.filter((r: any) => isSteeple(r));
        
        // Enforce exactly two Cross Country races (very_hard and very_soft) and dedupe by surface
        const crossSurfaces = ['very_hard', 'very_soft'];
        const crossAll = raceMatchesWithAll.filter((r: any) => isCrossCountry(r) && crossSurfaces.includes(r.surface));
        const cross = Array.from(new Map(crossAll.map((r: any) => [r.surface, r])).values());
        
        const sortByOrder = (arr: any[], order: { d: string; s: string }[]) =>
          arr.sort((a, b) => {
            const ia = order.findIndex(o => o.d === a.distance && o.s === a.surface);
            const ib = order.findIndex(o => o.d === b.distance && o.s === b.surface);
            const na = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
            const nb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
            return na - nb;
          });
        
        const flatsSorted = sortByOrder(flats, flatOrder);
        const steeplesSorted = sortByOrder(steeples, steepleOrder);
        const crossSorted = cross.sort((a: any, b: any) => {
          // Very Hard first, then Very Soft
          const pref = (s: string) => (s === 'very_hard' ? 0 : s === 'very_soft' ? 1 : 2);
          return pref(a.surface) - pref(b.surface);
        });
        
        const sorted = [...flatsSorted, ...steeplesSorted, ...crossSorted];
        
        setRaceMatches(sorted);
        setVisibleCount(INITIAL_RACES);
        setTotalHorses(data.totalHorses || 0);
        
        // Get all horses that have matches
        const matchedHorseIds = new Set();
        sorted.forEach((race: any) => {
          race.matchingHorses.forEach((horse: any) => {
            matchedHorseIds.add(horse.id);
          });
        });

        // Fetch all horses to find non-matching ones
        const { data: allHorses } = await supabase
          .from('horses')
          .select(`
            id,
            name,
            tier,
            max_speed,
            max_sprint_energy,
            max_acceleration,
            max_agility,
            max_jump,
            horse_traits!inner(trait_name)
          `);

        if (allHorses) {
          const mapHorse = (horse: any) => ({
            id: horse.id,
            name: horse.name,
            tier: horse.tier,
            traits: horse.horse_traits?.map((ht: any) => ht.trait_name) || [],
            max_speed: horse.max_speed,
            max_sprint_energy: horse.max_sprint_energy,
            max_acceleration: horse.max_acceleration,
            max_agility: horse.max_agility,
            max_jump: horse.max_jump,
          });
          setAllHorsesPool(allHorses.map(mapHorse));
          const nonMatching = allHorses
            .filter((horse: any) => !matchedHorseIds.has(horse.id))
            .map((horse: any) => ({
              id: horse.id,
              name: horse.name,
              tier: horse.tier,
              traits: horse.horse_traits?.map((ht: any) => ht.trait_name) || [],
              max_speed: horse.max_speed,
              max_sprint_energy: horse.max_sprint_energy,
              max_acceleration: horse.max_acceleration,
              max_agility: horse.max_agility,
              max_jump: horse.max_jump
            }))
            .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
          
          setNonMatchingHorses(nonMatching);
        }
        
        const totalMatches = sorted.reduce((sum: number, race: any) => sum + race.matchingHorses.length, 0);
        
        toast({
          title: "Success",
          description: `Found ${sorted.length} live events with ${totalMatches} matching horses from ${data.totalHorses || 0} horses in database.`,
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRace = async (raceId: number) => {
    try {
      const { error } = await supabase
        .from('live_races')
        .delete()
        .eq('id', raceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Race deleted successfully!",
      });

      setDeletingRaceId(null);
      fetchLiveRaces();
    } catch (error) {
      console.error('Error deleting race:', error);
      toast({
        title: "Error",
        description: "Failed to delete race. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Live Events</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              All upcoming races and matching horses from your database
            </p>
          </div>
          <Button onClick={fetchLiveRaces} disabled={loading} size={isMobile ? "default" : "lg"} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Events
              </>
            )}
          </Button>
        </div>

        {/* Section anchors */}
        {(() => {
          const flatCount = raceMatches.filter((_, i) => i + 1 <= 17).length;
          const steepleCount = raceMatches.filter((_, i) => i + 1 > 17 && i + 1 <= 20).length;
          const crossCount = raceMatches.filter((_, i) => i + 1 > 20).length;
          const anchors = [
            { id: 'flat-races', label: 'Flat Race', count: flatCount, icon: Circle, color: 'text-blue-500' },
            { id: 'steeplechase-races', label: 'Steeple Chase', count: steepleCount, icon: Triangle, color: 'text-yellow-500' },
            { id: 'cross-country-races', label: 'Cross Country', count: crossCount, icon: Mountain, color: 'text-green-500' },
          ];
          const scrollTo = (id: string) => {
            const doScroll = () => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            if (document.getElementById(id)) {
              doScroll();
            } else {
              // Section not rendered yet due to lazy loading — load all races first
              setVisibleCount(raceMatches.length);
              setTimeout(doScroll, 150);
            }
          };
          return (
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {anchors.map((a) => {
                const Icon = a.icon;
                return (
                  <Card
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/60 transition-colors"
                    onClick={() => scrollTo(a.id)}
                  >
                    <CardContent className="p-3 md:p-6">
                      <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                        <Icon className={`h-5 w-5 md:h-8 md:w-8 ${a.color}`} aria-hidden="true" />
                        <div className="text-center md:text-left">
                          <div className={`text-lg md:text-2xl font-bold ${a.color}`}>{a.count}</div>
                          <div className="text-[10px] md:text-sm text-muted-foreground font-medium">{a.label}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })()}

        {/* Add Race Form */}
        <AddRaceForm onRaceAdded={fetchLiveRaces} />

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>Race Events & Matching Horses</CardTitle>
          </CardHeader>
          <CardContent>
            {raceMatches.length > 0 ? (
              <div className="space-y-6">
                {raceMatches.slice(0, visibleCount).map((race, index) => {
                   const raceNumber = index + 1;
                   const getRaceType = (n: number) => {
                     if (n <= 17) return "Flat Race";
                     if (n <= 20) return "Steeple Chase";
                     return "Cross Country";
                   };
                   const raceType = getRaceType(raceNumber);
                   let raceLabel = "";
                   
                   if (raceNumber <= 17) {
                     raceLabel = `Race ${raceNumber} - ${raceType}`;
                   } else if (raceNumber <= 20) {
                     raceLabel = `Race ${raceNumber} - ${raceType}`;
                     if (race.race_name?.includes('Under Repair')) {
                       raceLabel += ' (Under Repair)';
                     }
                   } else {
                     raceLabel = `Race ${raceNumber} - ${raceType} (Surface preference only)`;
                   }
                   
                   const sectionId = raceType === "Flat Race"
                     ? "flat-races"
                     : raceType === "Steeple Chase"
                       ? "steeplechase-races"
                       : "cross-country-races";
                   const prevType = index > 0 ? getRaceType(index) : null;
                   const isFirstOfType = raceType !== prevType;
                   
                   const allTiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                   const matchedTiers = new Set(race.matchingHorses.map(h => h.tier));
                   
                   return (
                     <div key={race.id}>
                       {isFirstOfType && (
                         <div id={sectionId} className="scroll-mt-20 md:scroll-mt-24 -mx-2 md:-mx-6 pt-2 pb-1">
                           <h3 className="text-base md:text-xl font-bold text-foreground bg-muted/60 px-3 md:px-6 py-2 rounded-md border-y">
                             {raceType}
                           </h3>
                         </div>
                       )}
                      <div className="border rounded-lg overflow-hidden">
                       {/* Race Header */}
                       <div className="bg-muted/40 px-3 py-2 md:px-6 md:py-3 flex justify-between items-center border-b">
                         <div className="min-w-0 flex-1">
                            <h3 className="text-xs md:text-lg font-semibold truncate">{raceLabel}</h3>
                            {race.race_name && (
                              <p className="text-[11px] md:text-sm text-muted-foreground truncate">{race.race_name}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {race.distance !== '0' && (
                                <span className="text-[10px] md:text-xs font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
                                  {race.distance}m
                                </span>
                              )}
                              <span className="text-[10px] md:text-xs font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
                                {formatSurface(race.surface)}
                              </span>
                              {race.track_name && (
                                <span className="text-[10px] md:text-xs font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
                                  📍 {race.track_name}
                                </span>
                              )}

                             {race.tier_restriction && (
                               <span className="text-[10px] md:text-xs font-medium bg-background px-1.5 py-0.5 rounded border">
                                 {race.tier_restriction === 'odd_grades' ? (
                                   <>
                                     {[3, 5, 7, 9].map((tier, index) => {
                                       const matchingHorsesForTier = race.matchingHorses.filter(h => h.tier === tier);
                                       const hasMatch = matchingHorsesForTier.length > 0;
                                       const hasMaxTrained = matchingHorsesForTier.some(h => isMaxTrained(h));
                                       return (
                                         <span key={tier}>
                                           {index > 0 && ','}
                                            <RaceTierNote
                                              raceId={race.id}
                                              tier={tier}
                                              note={tierNotes[`${race.id}:${tier}`] || ''}
                                              onSave={saveTierNote}
                                              triggerClassName={
                                                !hasMatch
                                                  ? 'text-destructive font-semibold'
                                                  : hasMaxTrained
                                                    ? 'text-cyan-400 font-semibold'
                                                    : ''
                                              }
                                            >
                                              {tier}
                                            </RaceTierNote>
                                         </span>
                                       );
                                     })}
                                   </>
                                 ) : (
                                   <>
                                     {[2, 4, 6, 8].map((tier, index) => {
                                       const matchingHorsesForTier = race.matchingHorses.filter(h => h.tier === tier);
                                       const hasMatch = matchingHorsesForTier.length > 0;
                                       const hasMaxTrained = matchingHorsesForTier.some(h => isMaxTrained(h));
                                       return (
                                         <span key={tier}>
                                           {index > 0 && ','}
                                            <RaceTierNote
                                              raceId={race.id}
                                              tier={tier}
                                              note={tierNotes[`${race.id}:${tier}`] || ''}
                                              onSave={saveTierNote}
                                              triggerClassName={
                                                !hasMatch
                                                  ? 'text-destructive font-semibold'
                                                  : hasMaxTrained
                                                    ? 'text-cyan-400 font-semibold'
                                                    : ''
                                              }
                                            >
                                              {tier}
                                            </RaceTierNote>
                                         </span>
                                       );
                                     })}
                                   </>
                                 )}
                               </span>
                             )}
                             {race.is_active === false && (
                               <span className="text-[10px] md:text-xs font-medium text-destructive-foreground bg-destructive px-1.5 py-0.5 rounded">⚠ Repair</span>
                             )}
                             <span className="text-[10px] md:text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                               {race.matchingHorses.length} match{race.matchingHorses.length !== 1 ? 'es' : ''}
                             </span>
                           </div>
                         </div>
                         <div className="flex gap-1 ml-2 flex-shrink-0">
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-7 w-7 md:h-9 md:w-9"
                             onClick={() => setEditingRace(race)}
                           >
                             <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-7 w-7 md:h-9 md:w-9"
                             onClick={() => setDeletingRaceId(race.id)}
                           >
                             <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                           </Button>
                         </div>
                       </div>

                       {/* Race Content */}
                       <div className="p-2 md:p-6">
                         {(() => {
                           const timesForRace = bestTimesByKey.get(raceKey(race));
                           const timedCount = timesForRace
                             ? allHorsesPool.filter((h) => timesForRace.has(h.id)).length
                             : 0;
                           return timedCount > 0;
                         })() ? (
                          (() => {
                             // For Cross Country races, prioritize horses that have cross-country traits
                             // when their speed is otherwise equal.
                             const CROSS_COUNTRY_TRAITS = new Set([
                               "River Rider",
                               "Fast Draw",
                               "Revitalizing Surge",
                               "Meadowstride",
                               // multi-discipline traits that boost cross country
                               "Rolling Current",
                               "Rolling Current Pro",
                             ]);
                             const isCC = raceType === "Cross Country";
                             const hasCCTrait = (h: any) =>
                               (h.traits || []).some((t: string) => CROSS_COUNTRY_TRAITS.has(t));

                              // Logged best times for this race (horse id -> ms)
                              const timesForRace = bestTimesByKey.get(raceKey(race)) || new Map<number, number>();
                              const matchedIds = new Set(race.matchingHorses.map((h) => h.id));

                              // Only horses with recorded times for this race; keep top 3 fastest
                              const timedHorses = allHorsesPool
                                .filter((h) => timesForRace.has(h.id))
                                .map((h) => ({ ...h, isNonMatching: !matchedIds.has(h.id) } as any))
                                .sort((a, b) => (timesForRace.get(a.id) ?? Infinity) - (timesForRace.get(b.id) ?? Infinity))
                                .slice(0, 3);

                              // Sort: tier desc, then fastest logged time first, then existing logic
                              const sorted = timedHorses.sort((a, b) => {
                                if (b.tier !== a.tier) return b.tier - a.tier;
                                const tA = timesForRace.get(a.id);
                                const tB = timesForRace.get(b.id);
                                if (tA != null && tB != null && tA !== tB) return tA - tB;
                                if (isCC) {
                                  const speedA = a.speed ?? 0;
                                  const speedB = b.speed ?? 0;
                                  if (speedA === speedB) {
                                    const ccA = hasCCTrait(a) ? 1 : 0;
                                    const ccB = hasCCTrait(b) ? 1 : 0;
                                    if (ccA !== ccB) return ccB - ccA;
                                  }
                                  return speedB - speedA;
                                }
                                return 0;
                              });

                            // Group by tier
                            const tierGroups: { tier: number; horses: typeof sorted }[] = [];
                            sorted.forEach((horse) => {
                              const last = tierGroups[tierGroups.length - 1];
                              if (last && last.tier === horse.tier) {
                                last.horses.push(horse);
                              } else {
                                tierGroups.push({ tier: horse.tier, horses: [horse] });
                              }
                            });


                           return isMobile ? (
                             <div>
                               {tierGroups.map((group, gi) => (
                                 <div key={group.tier}>
                                   {gi > 0 && <div className="border-t-[3px] border-muted-foreground/30 my-1" />}
                                   {group.horses.map((horse) => (
                                     <div key={horse.id} className="py-1.5 px-1 border-b border-border last:border-b-0">
                                       <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                             <HorseStatsPopover horse={horse} name={horse.name}>
                                               <span className={`font-medium text-xs truncate inline-block ${isMaxTrained(horse) ? "border-[3px] border-black dark:border-white rounded px-1.5" : ""}`}>{horse.name}</span>
                                             </HorseStatsPopover>
                                           {isMaxTrained(horse) && (
                                             <span className="text-[9px] font-bold px-1 py-px rounded bg-cyan-500/20 text-cyan-400 flex-shrink-0">MAX</span>
                                           )}
                                            {getHorseSpecialIcons(horse.traits || []) && (
                                              <span className="text-xs flex-shrink-0">{getHorseSpecialIcons(horse.traits || [])}</span>
                                            )}
                                            {(horse as any).isNonMatching && (
                                              <span className="text-[9px] px-1 py-px rounded bg-muted text-muted-foreground flex-shrink-0">no match</span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                            {timesForRace.get(horse.id) != null && (
                                              <span className="text-[10px] font-mono font-semibold px-1 py-px rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                                ⏱ {formatRaceTime(timesForRace.get(horse.id)!)}
                                              </span>
                                            )}
                                            <span className="text-[10px] text-muted-foreground">T{horse.tier}</span>
                                          </div>
                                       </div>
                                       {horse.traits && horse.traits.length > 0 && (
                                         <div className="mt-1">
                                           <TraitsByDisciplineInline
                                             traits={horse.traits.map(t => ({ trait_name: t }))}
                                             allTraitNames={horse.traits}
                                           />
                                         </div>
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <Table>
                               <TableHeader>
                                 <TableRow>
                                   <TableHead>Horse Name</TableHead>
                                   <TableHead>Tier</TableHead>
                                   <TableHead>Traits</TableHead>
                                 </TableRow>
                               </TableHeader>
                               <TableBody>
                                 {tierGroups.map((group, gi) => (
                                   group.horses.map((horse, hi) => (
                                     <TableRow
                                       key={horse.id}
                                       className={gi > 0 && hi === 0 ? "border-t-[3px] border-muted-foreground/30" : ""}
                                     >
                                       <TableCell className="font-medium">
                                         <div className="flex items-center gap-1.5">
                                             <HorseStatsPopover horse={horse} name={horse.name}>
                                               <span className={isMaxTrained(horse) ? "inline-block border-[3px] border-black dark:border-white rounded px-2 py-0.5" : ""}>{horse.name}</span>
                                             </HorseStatsPopover>
                                           {isMaxTrained(horse) && (
                                             <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">MAX</span>
                                           )}
                                            {getHorseSpecialIcons(horse.traits || []) && (
                                              <span className="text-sm">{getHorseSpecialIcons(horse.traits || [])}</span>
                                            )}
                                            {timesForRace.get(horse.id) != null && (
                                              <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                                ⏱ {formatRaceTime(timesForRace.get(horse.id)!)}
                                              </span>
                                            )}
                                            {(horse as any).isNonMatching && (
                                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">no match</span>
                                            )}
                                          </div>
                                       </TableCell>
                                       <TableCell>
                                         <Badge variant="outline">Tier {horse.tier}</Badge>
                                       </TableCell>
                                       <TableCell className="max-w-md">
                                         <TraitsByDisciplineInline
                                           traits={horse.traits?.map(traitName => ({ trait_name: traitName })) || []}
                                           allTraitNames={horse.traits || []}
                                         />
                                       </TableCell>
                                     </TableRow>
                                   ))
                                 ))}
                               </TableBody>
                             </Table>
                           );
                         })()
                       ) : (
                         <p className="text-center py-4 text-xs text-muted-foreground">
                           No horses match this race
                         </p>
                       )}
                        </div>
                      </div>
                    </div>
                   );
                 })}
                {visibleCount < raceMatches.length && (
                  <div ref={loadMoreRef} className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading more races...</span>
                  </div>
                )}
               </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No Events Loaded</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Refresh Events" to load the latest race data
                </p>
              </div>
            )}
           </CardContent>
         </Card>

         {/* Non-Matching Horses Section */}
         {nonMatchingHorses.length > 0 && (
           <Card>
             <CardHeader>
               <CardTitle>Horses with No Live Race Matches ({nonMatchingHorses.length})</CardTitle>
               <p className="text-sm text-muted-foreground">
                 These horses don't match the surface and distance requirements of any current live races
               </p>
             </CardHeader>
             <CardContent>
               {isMobile ? (
                 <div className="space-y-2">
                   {nonMatchingHorses.map((horse) => (
                     <div key={horse.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/30">
                       <div className="flex items-center gap-1.5 min-w-0 flex-1">
                         <span className="font-medium text-sm truncate">{horse.name}</span>
                         {isMaxTrained(horse) && (
                           <span className="text-[10px] font-semibold px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex-shrink-0">
                             MAX
                           </span>
                         )}
                         {getHorseSpecialIcons(horse.traits || []) && (
                           <span className="text-sm flex-shrink-0">{getHorseSpecialIcons(horse.traits || [])}</span>
                         )}
                       </div>
                       <Badge variant="outline" className="text-[10px] flex-shrink-0 ml-2">T{horse.tier}</Badge>
                     </div>
                   ))}
                 </div>
               ) : (
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Horse Name</TableHead>
                       <TableHead>Tier</TableHead>
                       <TableHead>Traits</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {nonMatchingHorses.map((horse) => (
                       <TableRow key={horse.id}>
                         <TableCell className="font-medium">
                           <div className="flex items-center gap-1.5">
                             {horse.name}
                             {isMaxTrained(horse) && (
                               <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                                 MAX
                               </span>
                             )}
                             {getHorseSpecialIcons(horse.traits || []) && (
                               <span className="text-sm">{getHorseSpecialIcons(horse.traits || [])}</span>
                             )}
                           </div>
                         </TableCell>
                         <TableCell>
                           <Badge variant="outline">Tier {horse.tier}</Badge>
                         </TableCell>
                         <TableCell className="max-w-md">
                           <TraitsByDisciplineInline 
                             traits={horse.traits?.map(traitName => ({ trait_name: traitName })) || []}
                             allTraitNames={horse.traits || []}
                           />
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               )}
             </CardContent>
           </Card>
          )}
        </div>

        {/* Edit Race Dialog */}
        {editingRace && (
          <EditRaceForm
            race={editingRace}
            open={!!editingRace}
            onOpenChange={(open) => !open && setEditingRace(null)}
            onRaceUpdated={fetchLiveRaces}
          />
        )}

        {/* Delete Race Confirmation */}
        <AlertDialog open={!!deletingRaceId} onOpenChange={(open) => !open && setDeletingRaceId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Race</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this race? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deletingRaceId && handleDeleteRace(deletingRaceId)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Sticky back-to-top link */}
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-32 right-4 z-[110] rounded-full shadow-xl"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </Layout>
    );
  };

export default LiveEvents;