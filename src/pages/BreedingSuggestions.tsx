import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Heart, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { formatSurface } from "@/utils/formatUtils";
import { TraitsByDisciplineInline } from "@/components/horses/TraitsByDisciplineInline";
import { getHorseSpecialIcons } from "@/utils/horseTraitUtils";

interface Horse {
  id: number;
  name: string;
  gender: string;
  tier: number;
  speed: number;
  sprint_energy: number;
  acceleration: number;
  agility: number;
  jump: number;
  traits: string[];
}

interface BreedingPair {
  mare: Horse;
  stallion: Horse;
  combinedScore: number;
  sharedTraits: string[];
}

interface RaceWithPairs {
  id: number;
  race_name: string;
  surface: string;
  distance: string;
  tier_restriction: string | null;
  pairs: BreedingPair[];
}

const BreedingSuggestions = () => {
  const [racePairs, setRacePairs] = useState<RaceWithPairs[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBreedingPairs();
  }, []);

  const fetchBreedingPairs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('breeding-suggestions');

      if (error) throw error;

      if (data.success) {
        const matches = data.raceMatches || [];
        
        // Fetch full horse data with gender
        const { data: horses } = await supabase
          .from('horses')
          .select(`
            id, name, gender, tier,
            speed, sprint_energy, acceleration, agility, jump,
            horse_traits(trait_name)
          `);

        const horsesMap = new Map(
          horses?.map(h => [
            h.id,
            {
              ...h,
              traits: h.horse_traits?.map((t: any) => t.trait_name) || []
            }
          ]) || []
        );

        const results: RaceWithPairs[] = matches.map((race: any) => {
          const matchingHorses = race.matchingHorses
            .map((mh: any) => horsesMap.get(mh.id))
            .filter((h: any) => h && h.gender);

          const mares = matchingHorses.filter((h: any) => h.gender?.toLowerCase() === 'mare');
          const stallions = matchingHorses.filter((h: any) => h.gender?.toLowerCase() === 'stallion');

          const pairs: BreedingPair[] = [];

          mares.forEach((mare: any) => {
            stallions.forEach((stallion: any) => {
              const combinedScore = 
                (mare.speed || 0) + (stallion.speed || 0) +
                (mare.sprint_energy || 0) + (stallion.sprint_energy || 0) +
                (mare.acceleration || 0) + (stallion.acceleration || 0) +
                (mare.agility || 0) + (stallion.agility || 0) +
                (mare.jump || 0) + (stallion.jump || 0);

              const mareTraits = new Set(mare.traits || []);
              const sharedTraits = (stallion.traits || []).filter((t: string) => mareTraits.has(t));

              pairs.push({
                mare,
                stallion,
                combinedScore,
                sharedTraits
              });
            });
          });

          pairs.sort((a, b) => {
            if (b.sharedTraits.length !== a.sharedTraits.length) {
              return b.sharedTraits.length - a.sharedTraits.length;
            }
            return b.combinedScore - a.combinedScore;
          });

          return {
            id: race.id,
            race_name: race.race_name,
            surface: race.surface,
            distance: race.distance,
            tier_restriction: race.tier_restriction,
            pairs: pairs.slice(0, 5)
          };
        });

        setRacePairs(results.filter(r => r.pairs.length > 0));

        toast({
          title: "Success",
          description: `Found breeding suggestions for ${results.filter(r => r.pairs.length > 0).length} races`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch breeding suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Breeding Suggestions</h1>
            <p className="text-muted-foreground mt-2">
              Optimal mare/stallion pairs for upcoming races
            </p>
          </div>
          <Button onClick={fetchBreedingPairs} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-pink-500" />
                <div>
                  <div className="text-2xl font-bold">{racePairs.length}</div>
                  <div className="text-sm text-muted-foreground">Races with Pairs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {racePairs.reduce((sum, r) => sum + r.pairs.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Breeding Pairs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {racePairs.map((race, idx) => (
            <Card key={race.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Race {idx + 1} - {race.race_name || 'Unknown Race'}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {race.distance !== '0' && (
                    <Badge variant="outline">{race.distance}m</Badge>
                  )}
                  <Badge variant="outline">{formatSurface(race.surface)}</Badge>
                  {race.tier_restriction && (
                    <Badge variant="outline">
                      {race.tier_restriction === 'odd_grades' ? 'Odd Grades' : 'Even Grades'}
                    </Badge>
                  )}
                  <Badge variant="secondary">{race.pairs.length} Pairs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mare</TableHead>
                      <TableHead>Stallion</TableHead>
                      <TableHead>Combined Stats</TableHead>
                      <TableHead>Shared Traits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {race.pairs.map((pair, pidx) => (
                      <TableRow key={pidx}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-1.5">
                              {pair.mare.name}
                              {getHorseSpecialIcons(pair.mare.traits || []) && (
                                <span className="text-sm">{getHorseSpecialIcons(pair.mare.traits || [])}</span>
                              )}
                            </div>
                            <Badge variant="outline" className="mt-1">T{pair.mare.tier}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-1.5">
                              {pair.stallion.name}
                              {getHorseSpecialIcons(pair.stallion.traits || []) && (
                                <span className="text-sm">{getHorseSpecialIcons(pair.stallion.traits || [])}</span>
                              )}
                            </div>
                            <Badge variant="outline" className="mt-1">T{pair.stallion.tier}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pair.combinedScore}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          {pair.sharedTraits.length > 0 ? (
                            <TraitsByDisciplineInline
                              traits={pair.sharedTraits.map(t => ({ trait_name: t }))}
                              allTraitNames={pair.sharedTraits}
                            />
                          ) : (
                            <span className="text-muted-foreground text-sm">No shared traits</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          {racePairs.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No breeding pairs found. Make sure you have both mares and stallions in your database.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BreedingSuggestions;
