import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { formatSurface } from "@/utils/formatUtils";

interface EditRaceFormProps {
  race: {
    id: number;
    race_name: string;
    distance: string;
    surface: string;
    tier_restriction: string | null;
    track_name: string | null;
    start_time: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRaceUpdated: () => void;
}

const EditRaceForm = ({ race, open, onOpenChange, onRaceUpdated }: EditRaceFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    race_name: race.race_name,
    distance: race.distance,
    surface: race.surface,
    tier_restriction: race.tier_restriction || "",
    track_name: race.track_name || "",
    start_date: new Date(race.start_time).toISOString().split('T')[0],
    start_time: new Date(race.start_time).toTimeString().slice(0, 5),
  });

  const raceTypes = [
    { value: "flat", label: "Flat Racing" },
    { value: "steeplechase", label: "Steeplechase" },
    { value: "cross_country", label: "Cross Country" },
  ];

  const surfaces = [
    { value: "very_hard", label: "Very Hard" },
    { value: "hard", label: "Hard" },
    { value: "firm", label: "Firm" },
    { value: "medium", label: "Medium" },
    { value: "soft", label: "Soft" },
    { value: "very_soft", label: "Very Soft" },
  ];

  const distances = [
    "800", "900", "1000", "1100", "1200", "1400", "1600", "1800", 
    "2000", "2200", "2400", "2600", "2800", "3000", "3200", "0"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);

      const { error } = await supabase
        .from('live_races')
        .update({
          race_name: formData.race_name,
          distance: formData.distance,
          surface: formData.surface,
          tier_restriction: formData.tier_restriction || null,
          track_name: formData.track_name || null,
          start_time: startDateTime.toISOString(),
        })
        .eq('id', race.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Race updated successfully!",
      });

      onRaceUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating race:', error);
      toast({
        title: "Error",
        description: "Failed to update race. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Race</DialogTitle>
          <DialogDescription>
            Update the race details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="race_name">Race Name</Label>
            <Input
              id="race_name"
              value={formData.race_name}
              onChange={(e) => setFormData({ ...formData, race_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance">Distance</Label>
              <Select
                value={formData.distance}
                onValueChange={(value) => setFormData({ ...formData, distance: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {distances.map((distance) => (
                    <SelectItem key={distance} value={distance}>
                      {distance === "0" ? "Cross Country (0m)" : `${distance}m`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="surface">Surface</Label>
              <Select
                value={formData.surface}
                onValueChange={(value) => setFormData({ ...formData, surface: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {surfaces.map((surface) => (
                    <SelectItem key={surface.value} value={surface.value}>
                      {surface.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier_restriction">Tier Restriction</Label>
            <Select
              value={formData.tier_restriction}
              onValueChange={(value) => setFormData({ ...formData, tier_restriction: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="No restriction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No restriction</SelectItem>
                <SelectItem value="odd_grades">Odd Grades (3, 5, 7, 9)</SelectItem>
                <SelectItem value="even_grades">Even Grades (2, 4, 6, 8)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="track_name">Track Name</Label>
            <Input
              id="track_name"
              value={formData.track_name}
              onChange={(e) => setFormData({ ...formData, track_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Race
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRaceForm;
