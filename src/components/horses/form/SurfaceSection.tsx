
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, useWatch } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface SurfaceSectionProps {
  control: Control<any>;
}

const surfaceOptions = [
  { value: "very_hard", label: "Very Hard" },
  { value: "hard", label: "Hard" },
  { value: "firm", label: "Firm" },
  { value: "medium", label: "Medium" },
  { value: "soft", label: "Soft" },
  { value: "very_soft", label: "Very Soft" },
];

export const SurfaceSection = ({ control }: SurfaceSectionProps) => {
  const { setValue, getValues, formState: { errors } } = useFormContext();
  const selectedSurfaces = useWatch({
    control,
    name: "preferred_surfaces",
    defaultValue: getValues("preferred_surfaces") || []
  });

  const toggleSurface = (surface: string) => {
    const current = getValues("preferred_surfaces") || [];
    const updated = current.includes(surface)
      ? current.filter((s: string) => s !== surface)
      : [...current, surface];
    setValue("preferred_surfaces", updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-3">
      <Label>Preferred Surfaces *</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {surfaceOptions.map((surface) => (
          <div key={surface.value} className="flex items-center space-x-2">
            <Checkbox
              id={`surface-${surface.value}`}
              checked={selectedSurfaces?.includes(surface.value) || false}
              onCheckedChange={() => toggleSurface(surface.value)}
            />
            <Label htmlFor={`surface-${surface.value}`} className="text-sm font-normal">
              {surface.label}
            </Label>
          </div>
        ))}
      </div>
      {errors.preferred_surfaces && (
        <p className="text-sm font-medium text-destructive">{errors.preferred_surfaces.message as string}</p>
      )}
    </div>
  );
};