import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Lock, Star, Trophy, Tag } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { HorseEditForm } from "./HorseEditForm";
import { TraitBadge } from "./TraitBadge";
import { TraitsByDiscipline } from "./TraitsByDiscipline";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MasterKeyDialog } from "@/components/auth/MasterKeyDialog";
import { checkHorseLiveRaceMatches, formatSurfaceName, type HorseRaceMatch } from "@/utils/liveRaces";
import { getHorseSpecialIcons, checkHorseHasStackingTraits, checkHorseHasFullStaminaTrait, checkHorseHasSpeedStackingTraits, checkHorseHasJumpingStackingTraits } from "@/utils/horseTraitUtils";
import { calculateAllStats, getMaxTrainedStats, isMaxTrained } from "@/utils/horseUtils";
import { getGenderNameBackgroundClass } from "@/utils/formatUtils";
import { useBestTimesForHorse, useTierBestTimes, raceTypeKey } from "@/hooks/useRaceResults";
import { formatRaceLabel, formatRaceTime } from "@/utils/raceTimeUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HorseCardProps {
  horse: any;
}

export const HorseCard = ({ horse }: HorseCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMasterKeyDialog, setShowMasterKeyDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | 'sold' | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { bestTimes } = useBestTimesForHorse(horse.id);
  const tierBestTimes = useTierBestTimes();

  // True when this horse's best time for the race equals the fastest time
  // recorded by any horse in the same tier for that race
  const isTierBest = (bt: { timeMs: number; race: any; raceId: number }) => {
    if (horse.tier == null) return false;
    const key = `${raceTypeKey(bt.race) || `race-${bt.raceId}`}|${horse.tier}`;
    const best = tierBestTimes.get(key);
    return best != null && bt.timeMs <= best;
  };

  const isSold = !!horse.is_sold;

  const soldMutation = useMutation({
    mutationFn: async (sold: boolean) => {
      const { error } = await supabase
        .from("horses")
        .update({ is_sold: sold, sold_at: sold ? new Date().toISOString() : null })
        .eq("id", horse.id);
      if (error) throw error;
    },
    onSuccess: (_d, sold) => {
      queryClient.invalidateQueries({ queryKey: ["horses"] });
      toast({
        title: sold ? "Marked as sold" : "Back in your stable",
        description: sold
          ? `${horse.name} is kept with all history, but hidden from race matching.`
          : `${horse.name} is active again.`,
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update sold status", variant: "destructive" });
    },
  });

  const handleSoldToggle = () => {
    if (!isAuthenticated) {
      setPendingAction('sold');
      setShowMasterKeyDialog(true);
      return;
    }
    soldMutation.mutate(!isSold);
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [linksLoading, setLinksLoading] = useState(false);
  const [links, setLinks] = useState({ breedingNotes: 0, foalLinks: 0, raceResults: 0 });
  const hasLinks = links.breedingNotes > 0 || links.foalLinks > 0 || links.raceResults > 0;

  const loadLinks = async () => {
    setLinksLoading(true);
    try {
      const countOf = async (p: any) => (await p).count ?? 0;
      const [notes, foals, results] = await Promise.all([
        countOf(
          supabase
            .from("breeding_notes")
            .select("id", { count: "exact", head: true })
            .or(`mare_id.eq.${horse.id},stallion_id.eq.${horse.id},foal_id.eq.${horse.id}`)
        ),
        countOf(
          supabase
            .from("breeding_note_foals")
            .select("id", { count: "exact", head: true })
            .eq("foal_id", horse.id)
        ),
        countOf(
          supabase
            .from("race_results")
            .select("id", { count: "exact", head: true })
            .eq("horse_id", horse.id)
        ),
      ]);
      setLinks({ breedingNotes: notes, foalLinks: foals, raceResults: results });
    } catch {
      setLinks({ breedingNotes: 0, foalLinks: 0, raceResults: 0 });
    } finally {
      setLinksLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setPendingAction('delete');
      setShowMasterKeyDialog(true);
      return;
    }
    loadLinks();
  };

  const deleteMutation = useMutation({
    mutationFn: async (horseId: number) => {
      console.log("HorseCard: Deleting horse with ID:", horseId);
      
      // Delete related records first
      await supabase.from("horse_categories").delete().eq("horse_id", horseId);
      await supabase.from("horse_surfaces").delete().eq("horse_id", horseId);
      await supabase.from("horse_distances").delete().eq("horse_id", horseId);
      await supabase.from("horse_positions").delete().eq("horse_id", horseId);
      await supabase.from("horse_breeding").delete().eq("horse_id", horseId);
      await supabase.from("horse_traits").delete().eq("horse_id", horseId);
      await supabase.from("race_results").delete().eq("horse_id", horseId);

      // Remove breeding references
      await supabase.from("breeding_note_foals").delete().eq("foal_id", horseId);
      await supabase.from("breeding_notes").update({ foal_id: null }).eq("foal_id", horseId);
      await supabase.from("breeding_notes").update({ mare_id: null }).eq("mare_id", horseId);
      await supabase.from("breeding_notes").update({ stallion_id: null }).eq("stallion_id", horseId);

      // Delete the horse
      const { error } = await supabase.from("horses").delete().eq("id", horseId);
      if (error) throw error;
    },
    onSuccess: () => {
      console.log("HorseCard: Horse deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["horses"] });
      toast({
        title: "Success",
        description: "Horse deleted successfully",
      });
    },
    onError: (error) => {
      console.error("HorseCard: Error deleting horse:", error);
      toast({
        title: "Error",
        description: "Failed to delete horse",
        variant: "destructive",
      });
    },
  });


  const { totalSpeed, totalSprintEnergy, totalAcceleration, totalAgility, totalJump } = 
    calculateAllStats(horse);
  const maxTrainedStats = getMaxTrainedStats(horse);
  const fullyMaxTrained = isMaxTrained(horse);

  // Extract all trait names for stacking detection
  const allTraitNames = horse.horse_traits?.map((trait: any) => trait.trait_name) || [];
  console.log(`Horse ${horse.name} traits:`, allTraitNames);
  
  // Check if horse has full stamina traits
  const hasFullStaminaTrait = checkHorseHasFullStaminaTrait(allTraitNames);

  // Check if horse has stacking traits
  const hasSpeedStackingTraits = checkHorseHasSpeedStackingTraits(allTraitNames);
  const hasJumpingStackingTraits = checkHorseHasJumpingStackingTraits(allTraitNames);
  
  // Check if horse has Elite Lineage trait
  const hasEliteLineage = allTraitNames.includes("Elite Lineage");
  
  console.log(`Horse ${horse.name} - Speed stacking: ${hasSpeedStackingTraits}, Jumping stacking: ${hasJumpingStackingTraits}, Full stamina: ${hasFullStaminaTrait}, Elite Lineage: ${hasEliteLineage}`);
  
  // Check for live race matches
  const horseDistances = horse.horse_distances?.map((d: any) => d.distance.toString()) || [];
  const horseSurfaces = horse.horse_surfaces?.map((s: any) => s.surface) || [];
  const horseCategories = horse.horse_categories?.map((c: any) => c.category) || [];
  const liveRaceMatches = checkHorseLiveRaceMatches(horseDistances, horseSurfaces, horseCategories, horse.tier);

  const handleEdit = () => {
    if (isAuthenticated) {
      setIsEditing(true);
    } else {
      setPendingAction('edit');
      setShowMasterKeyDialog(true);
    }
  };

  const handleDelete = () => {
    if (isAuthenticated) {
      // Delete action will be handled by the AlertDialog
      return;
    } else {
      setPendingAction('delete');
      setShowMasterKeyDialog(true);
    }
  };

  const handleMasterKeySuccess = () => {
    if (pendingAction === 'edit') {
      setIsEditing(true);
    }
    if (pendingAction === 'sold') {
      soldMutation.mutate(!isSold);
    }
    // For delete, user will need to click delete button again after auth
    setPendingAction(null);
  };

  return (
    <Card className={`w-full ${isSold ? 'opacity-60 grayscale' : ''}`}>
      <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
        <div className="space-y-2">
          {/* Horse name - full width */}
          <div className={`inline-block px-2 py-1 md:px-3 md:py-2 rounded-lg ${getGenderNameBackgroundClass(horse.gender || '')} ${fullyMaxTrained ? `border-[5px] ${horse.gender === 'stallion' ? 'border-blue-600' : horse.gender === 'mare' ? 'border-pink-600' : 'border-gray-600'}` : ''}`}>
            <CardTitle className="text-sm md:text-lg flex items-center gap-1 flex-wrap">
              <span className={isSold ? 'line-through' : ''}>{horse.name}</span>
              {isSold && (
                <Badge variant="secondary" className="text-[10px] md:text-xs bg-gray-700 text-white">
                  Sold
                </Badge>
              )}
              {hasEliteLineage && <Star className="h-3 w-3 md:h-4 md:w-4 fill-purple-500 text-purple-500 flex-shrink-0" />}
              {hasFullStaminaTrait && <span className="text-sm md:text-lg flex-shrink-0">💯</span>}
              {hasSpeedStackingTraits && <span className="text-sm md:text-lg flex-shrink-0">🔥</span>}
              {hasJumpingStackingTraits && <span className="text-sm md:text-lg flex-shrink-0">🐸</span>}
            </CardTitle>
          </div>
          {/* Actions + meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-muted-foreground">
              {horse.tier && (
                <Badge variant="secondary" className="text-xs">
                  Tier {horse.tier}
                </Badge>
              )}
              <span>
                {horse.created_at && horse.updated_at && 
                 new Date(horse.created_at).toISOString() !== new Date(horse.updated_at).toISOString() ? (
                  <>Updated: {new Date(horse.updated_at).toLocaleDateString()}</>
                ) : (
                  <>Added: {new Date(horse.created_at || horse.updated_at).toLocaleDateString()}</>
                )}
              </span>
            </div>
            <div className="flex gap-1.5 md:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSoldToggle}
                disabled={soldMutation.isPending}
                title={isSold ? "Mark as not sold" : "Mark as sold"}
                className={`h-7 w-7 md:h-9 md:w-9 border-2 ${isAuthenticated ? 'border-green-500' : 'border-red-500'} ${isSold ? 'bg-gray-200' : ''}`}
              >
                <Tag className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleEdit}
                className={`h-7 w-7 md:h-9 md:w-9 border-2 ${isAuthenticated ? 'border-green-500' : 'border-red-500'}`}
              >
                <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleDeleteClick}
                    className={`h-7 w-7 md:h-9 md:w-9 border-2 ${isAuthenticated ? 'border-green-500' : 'border-red-500'}`}
                  >
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {horse.name}?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-2 text-left">
                        {linksLoading ? (
                          <p>Checking what is linked to this horse…</p>
                        ) : hasLinks ? (
                          <>
                            <p className="font-medium text-destructive">
                              This horse is still used elsewhere:
                            </p>
                            <ul className="list-disc pl-5">
                              {!!links.breedingNotes && (
                                <li>{links.breedingNotes} breeding note{links.breedingNotes > 1 ? 's' : ''} / pairing{links.breedingNotes > 1 ? 's' : ''}</li>
                              )}
                              {!!links.foalLinks && (
                                <li>{links.foalLinks} foal link{links.foalLinks > 1 ? 's' : ''}</li>
                              )}
                              {!!links.raceResults && (
                                <li>{links.raceResults} recorded race time{links.raceResults > 1 ? 's' : ''}</li>
                              )}
                            </ul>
                            <p>
                              Deleting removes all of this for good. Marking the horse as sold keeps every
                              note, pairing and time, and only hides the horse from race matching.
                            </p>
                          </>
                        ) : (
                          <p>Nothing else is linked to this horse. This action cannot be undone.</p>
                        )}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {!isSold && (
                      <AlertDialogAction
                        onClick={() => soldMutation.mutate(true)}
                        className="bg-amber-600 text-white hover:bg-amber-700"
                      >
                        Mark as sold instead
                      </AlertDialogAction>
                    )}
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(horse.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={linksLoading}
                    >
                      Delete anyway
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="w-screen max-w-none h-[100dvh] max-h-none rounded-none p-4 md:p-8 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {horse.name}</DialogTitle>
            </DialogHeader>
            <HorseEditForm
              horse={horse}
              onCancel={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>

        <MasterKeyDialog
          isOpen={showMasterKeyDialog}
          onClose={() => {
            setShowMasterKeyDialog(false);
            setPendingAction(null);
          }}
          onSuccess={handleMasterKeySuccess}
        />
      </CardHeader>
      
      <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
        {/* Breed Information */}
        {horse.horse_breeding && horse.horse_breeding.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">Breed Composition</h4>
            <p className="text-xs md:text-sm">
              {horse.horse_breeding
                .map((breeding: any) => `${breeding.breeds?.name || 'Unknown Breed'} ${breeding.percentage}%`)
                .join(' / ')}
            </p>
          </div>
        )}

        {/* Categories */}
        {horse.horse_categories && horse.horse_categories.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">Categories</h4>
            <div className="flex flex-wrap gap-1">
              {horse.horse_categories.map((cat: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-[10px] md:text-xs">
                  {cat.category?.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div>
          <h4 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">Stats</h4>
          <div className="grid grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
            <div className="flex justify-between">
              <span>Speed:</span>
              <span className="font-medium">
                {totalSpeed}
                {horse.diet_speed > 0 && (
                  <span className="text-green-600"> (+{horse.diet_speed})</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sprint:</span>
              <span className="font-medium">
                {totalSprintEnergy}
                {horse.diet_sprint_energy > 0 && (
                  <span className="text-green-600"> (+{horse.diet_sprint_energy})</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Accel:</span>
              <span className="font-medium">
                {totalAcceleration}
                {horse.diet_acceleration > 0 && (
                  <span className="text-green-600"> (+{horse.diet_acceleration})</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Agility:</span>
              <span className="font-medium">
                {totalAgility}
                {horse.diet_agility > 0 && (
                  <span className="text-green-600"> (+{horse.diet_agility})</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Jump:</span>
              <span className="font-medium">
                {totalJump}
                {horse.diet_jump > 0 && (
                  <span className="text-green-600"> (+{horse.diet_jump})</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Racing Info */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-2 text-[10px] md:text-xs">
          {horse.horse_surfaces && horse.horse_surfaces.length > 0 && (
            <div>
              <span className="font-medium">Surface:</span>
              <div className="mt-1 space-y-0.5">
                {horse.horse_surfaces.map((surf: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-[9px] md:text-xs mr-1">
                    {surf.surface?.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {horse.horse_distances && horse.horse_distances.length > 0 && (
            <div>
              <span className="font-medium">Distance:</span>
              <div className="mt-1 space-y-0.5">
                {horse.horse_distances.map((dist: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-[9px] md:text-xs mr-1">
                    {dist.distance}m
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {horse.horse_positions && horse.horse_positions.length > 0 && (
            <div>
              <span className="font-medium">Position:</span>
              <div className="mt-1 space-y-0.5">
                {horse.horse_positions.map((pos: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-[9px] md:text-xs mr-1">
                    {pos.position}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Race Matches */}
        {liveRaceMatches.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 flex items-center gap-2">
              <span className="text-red-600">🔴 LIVE</span>
              <span>Race Matches</span>
            </h4>
            <div className="space-y-1">
              {liveRaceMatches.map(({ race, number }) => {
                const kind = getRaceKind(race);
                const categoryLabel =
                  kind === "xc"
                    ? "Cross Country"
                    : kind === "sc"
                    ? "Steeplechase"
                    : kind === "sj"
                    ? "Show Jumping"
                    : "Flat Racing";
                const grades =
                  race.tier_restriction === "odd_grades"
                    ? "Odd"
                    : race.tier_restriction === "even_grades"
                    ? "Even"
                    : "All";
                return (
                  <div key={race.id} className="flex flex-wrap items-center gap-1 md:gap-2 text-[10px] md:text-xs">
                    <Badge variant="default" className="text-[10px] md:text-xs bg-blue-600 text-white hover:bg-blue-700">
                      {number ? `#${number} ` : ""}{categoryLabel}
                    </Badge>
                    {kind !== "xc" && kind !== "sj" && String(race.distance) !== "0" && (
                      <Badge variant="outline" className="text-[10px] md:text-xs">
                        {race.distance}m
                      </Badge>
                    )}
                    {kind !== "sj" && (
                      <Badge variant="outline" className="text-[10px] md:text-xs">
                        {formatSurfaceName(race.surface)}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] md:text-xs">
                      {grades} Grades
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Best race times */}
        {bestTimes.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">Best Times</h4>
            <div className="space-y-1">
              {bestTimes.map((bt) => (
                <div
                  key={bt.raceId}
                  className="flex items-center justify-between gap-2 text-[10px] md:text-xs rounded-md border px-2 py-1"
                >
                  <span className="truncate flex items-center gap-1">
                    {formatRaceLabel(bt.race)}
                    {isTierBest(bt) && (
                      <Trophy className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    )}
                  </span>
                  <span className="font-mono font-medium flex-shrink-0">
                    {formatRaceTime(bt.timeMs)}
                    {bt.runs > 1 && (
                      <span className="text-muted-foreground font-sans"> ({bt.runs} runs)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traits */}
        {horse.horse_traits && horse.horse_traits.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">Traits ({horse.horse_traits.length})</h4>
            <TraitsByDiscipline 
              traits={horse.horse_traits}
              allTraitNames={allTraitNames}
              horseBreeding={horse.horse_breeding}
            />
          </div>
        )}

        {/* Max Training Status */}
        {maxTrainedStats.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">Max Trained</h4>
            <div className="flex flex-wrap gap-1">
              {maxTrainedStats.map((stat, idx) => (
                <Badge key={idx} variant="default" className="text-[10px] md:text-xs bg-green-100 text-green-800">
                  {stat}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {horse.notes && (
          <div>
            <h4 className="text-xs md:text-sm font-medium mb-1">Notes</h4>
            <p className="text-xs md:text-sm text-gray-600">{horse.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
