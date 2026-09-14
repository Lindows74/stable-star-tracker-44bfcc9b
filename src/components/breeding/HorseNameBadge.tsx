import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HorseCard } from "@/components/horses/HorseCard";
import { getGenderNameBackgroundClass } from "@/utils/formatUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface HorseNameBadgeProps {
  horse?: { id?: number; name?: string; gender?: string } | null;
  horseId?: number;
  label?: string;
  icon?: string;
  className?: string;
}

export const HorseNameBadge = ({
  horse,
  horseId,
  label,
  icon,
  className,
}: HorseNameBadgeProps) => {
  const [open, setOpen] = useState(false);

  const id = horse?.id ?? horseId;
  const name = horse?.name ?? label ?? "Horse";
  const gender = horse?.gender ?? "";

  const { data: fullHorse, isLoading } = useQuery({
    queryKey: ["horse", id],
    enabled: open && id != null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horses")
        .select(
          `
          *,
          horse_categories(category),
          horse_surfaces(surface),
          horse_distances(distance),
          horse_positions(position),
          horse_breeding(percentage, breeds(name)),
          horse_traits(trait_name, trait_value, trait_category)
        `
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (id == null) {
    return (
      <Badge variant="secondary" className={className}>
        {icon} {name}
      </Badge>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center"
      >
        <Badge
          className={`cursor-pointer ${getGenderNameBackgroundClass(gender)} text-foreground hover:opacity-90 ${className ?? ""}`}
        >
          {icon} {name}
        </Badge>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-screen max-w-none h-[100dvh] max-h-none rounded-none p-4 md:p-8 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          {isLoading && <p className="text-sm text-muted-foreground">Loading horse...</p>}
          {!isLoading && fullHorse && <HorseCard horse={fullHorse} />}
          {!isLoading && !fullHorse && (
            <p className="text-sm text-muted-foreground">Could not load horse details.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
