import { Badge } from "@/components/ui/badge";
import { formatSurface } from "@/utils/formatUtils";
import { TraitBadge } from "@/components/horses/TraitBadge";

interface HorseAttributeSummaryProps {
  horse: any;
  showBreeds?: boolean;
  className?: string;
}

/**
 * Compact read-only summary of a horse's distances, surfaces, traits
 * (and optionally breed percentages) for use in the breeding view.
 */
export const HorseAttributeSummary = ({
  horse,
  showBreeds = true,
  className,
}: HorseAttributeSummaryProps) => {
  if (!horse) return null;

  const distances: string[] = (horse.horse_distances || []).map((d: any) => String(d.distance));
  const surfaces: string[] = (horse.horse_surfaces || []).map((s: any) => String(s.surface));
  const traits: any[] = horse.horse_traits || [];
  const breeding: any[] = horse.horse_breeding || [];

  const hasAny =
    distances.length > 0 || surfaces.length > 0 || traits.length > 0 || (showBreeds && breeding.length > 0);

  if (!hasAny) return null;

  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      {(distances.length > 0 || surfaces.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {distances.map((d, i) => (
            <Badge key={`d-${i}`} variant="outline" className="text-[10px] px-1 py-0">
              {d}m
            </Badge>
          ))}
          {surfaces.map((s, i) => (
            <Badge key={`s-${i}`} variant="outline" className="text-[10px] px-1 py-0 border-dashed">
              {formatSurface(s)}
            </Badge>
          ))}
        </div>
      )}

      {showBreeds && breeding.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {breeding.map((b: any, i: number) => (
            <Badge key={`b-${i}`} variant="outline" className="text-[10px] px-1 py-0">
              {b.breeds?.name} {Number(b.percentage)}%
            </Badge>
          ))}
        </div>
      )}

      {traits.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {traits.map((t: any, i: number) => (
            <TraitBadge
              key={`t-${i}`}
              traitName={t.trait_name}
              allTraits={traits.map((trait) => trait.trait_name)}
              horseBreeding={breeding}
            />
          ))}
        </div>
      )}
    </div>
  );
};
