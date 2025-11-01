import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Lock, Star } from "lucide-react";
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
import { calculateAllStats, getMaxTrainedStats } from "@/utils/horseUtils";
import { getGenderNameBackgroundClass } from "@/utils/formatUtils";
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

interface HorseCardProps {
  horse: any;
}

export const HorseCard = ({ horse }: HorseCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMasterKeyDialog, setShowMasterKeyDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

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

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit {horse.name}</h3>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(false)}
            size="sm"
          >
            Cancel
          </Button>
        </div>
        <HorseEditForm 
          horse={horse} 
          onCancel={() => setIsEditing(false)} 
        />
      </div>
    );
  }

  const { totalSpeed, totalSprintEnergy, totalAcceleration, totalAgility, totalJump } = 
    calculateAllStats(horse);
  const maxTrainedStats = getMaxTrainedStats(horse);

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
    // For delete, user will need to click delete button again after auth
    setPendingAction(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`inline-block px-3 py-2 rounded-lg ${getGenderNameBackgroundClass(horse.gender || '')}`}>
              <CardTitle className="text-lg flex items-center gap-1">
                {horse.name}
                {hasEliteLineage && <Star className="h-4 w-4 fill-purple-500 text-purple-500" />}
                {hasFullStaminaTrait && <span className="text-lg">💯</span>}
                {hasSpeedStackingTraits && <span className="text-lg">🔥</span>}
                {hasJumpingStackingTraits && <span className="text-lg">🐸</span>}
              </CardTitle>
            </div>
            {horse.tier && (
              <Badge variant="secondary">
                Tier {horse.tier}
              </Badge>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                {!isAuthenticated && <Lock className="h-3 w-3 mr-1" />}
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => !isAuthenticated && handleDelete()}
                    disabled={!isAuthenticated && pendingAction === 'delete'}
                  >
                    {!isAuthenticated && <Lock className="h-3 w-3 mr-1" />}
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Horse</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {horse.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => isAuthenticated && deleteMutation.mutate(horse.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={!isAuthenticated}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            {/* Timestamp */}
            <div className="text-[10px] text-gray-400">
              {horse.created_at && horse.updated_at && 
               new Date(horse.created_at).toISOString() !== new Date(horse.updated_at).toISOString() ? (
                <>Updated: {new Date(horse.updated_at).toLocaleDateString()}</>
              ) : (
                <>Added: {new Date(horse.created_at || horse.updated_at).toLocaleDateString()}</>
              )}
            </div>
          </div>
        </div>

        <MasterKeyDialog
          isOpen={showMasterKeyDialog}
          onClose={() => {
            setShowMasterKeyDialog(false);
            setPendingAction(null);
          }}
          onSuccess={handleMasterKeySuccess}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Breed Information */}
        {horse.horse_breeding && horse.horse_breeding.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Breed Composition</h4>
            <p className="text-sm">
              {horse.horse_breeding
                .map((breeding: any) => `${breeding.breeds?.name || 'Unknown Breed'} ${breeding.percentage}%`)
                .join(' / ')}
            </p>
          </div>
        )}

        {/* Categories */}
        {horse.horse_categories && horse.horse_categories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Categories</h4>
            <div className="flex flex-wrap gap-1">
              {horse.horse_categories.map((cat: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {cat.category?.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div>
          <h4 className="text-sm font-medium mb-2">Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
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
              <span>Sprint Energy:</span>
              <span className="font-medium">
                {totalSprintEnergy}
                {horse.diet_sprint_energy > 0 && (
                  <span className="text-green-600"> (+{horse.diet_sprint_energy})</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Acceleration:</span>
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
        <div className="grid grid-cols-3 gap-2 text-xs">
          {horse.horse_surfaces && horse.horse_surfaces.length > 0 && (
            <div>
              <span className="font-medium">Surface:</span>
              <div className="mt-1">
                {horse.horse_surfaces.map((surf: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs mr-1">
                    {surf.surface?.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {horse.horse_distances && horse.horse_distances.length > 0 && (
            <div>
              <span className="font-medium">Distance:</span>
              <div className="mt-1">
                {horse.horse_distances.map((dist: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs mr-1">
                    {dist.distance}m
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {horse.horse_positions && horse.horse_positions.length > 0 && (
            <div>
              <span className="font-medium">Position:</span>
              <div className="mt-1">
                {horse.horse_positions.map((pos: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs mr-1">
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
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className="text-red-600">🔴 LIVE</span>
              <span>Race Matches</span>
            </h4>
            <div className="space-y-1">
              {liveRaceMatches.map((match: HorseRaceMatch, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <Badge variant="default" className="text-xs bg-blue-600 text-white hover:bg-blue-700">
                    {match.category}
                  </Badge>
                  {match.distance > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {match.distance}m
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {formatSurfaceName(match.surface)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {match.grades} Grades
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traits */}
        {horse.horse_traits && horse.horse_traits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Traits ({horse.horse_traits.length})</h4>
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
            <h4 className="text-sm font-medium mb-2">Max Trained</h4>
            <div className="flex flex-wrap gap-1">
              {maxTrainedStats.map((stat, idx) => (
                <Badge key={idx} variant="default" className="text-xs bg-green-100 text-green-800">
                  {stat}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {horse.notes && (
          <div>
            <h4 className="text-sm font-medium mb-1">Notes</h4>
            <p className="text-sm text-gray-600">{horse.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
