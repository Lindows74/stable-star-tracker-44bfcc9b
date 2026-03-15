
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, useWatch } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface DistanceSectionProps {
  control: Control<any>;
}

const distanceOptions = [
  { value: "800", label: "800m" },
  { value: "900", label: "900m" },
  { value: "1000", label: "1000m" },
  { value: "1100", label: "1100m" },
  { value: "1200", label: "1200m" },
  { value: "1400", label: "1400m" },
  { value: "1600", label: "1600m" },
  { value: "1800", label: "1800m" },
  { value: "2000", label: "2000m" },
  { value: "2200", label: "2200m" },
  { value: "2400", label: "2400m" },
  { value: "2600", label: "2600m" },
  { value: "2800", label: "2800m" },
  { value: "3000", label: "3000m" },
  { value: "3200", label: "3200m" },
];

export const DistanceSection = ({ control }: DistanceSectionProps) => {
  const { setValue, getValues, formState: { errors } } = useFormContext();
  const selectedDistances = useWatch({
    control,
    name: "preferred_distances",
    defaultValue: getValues("preferred_distances") || []
  });

  const toggleDistance = (distance: string) => {
    const current = getValues("preferred_distances") || [];
    const updated = current.includes(distance)
      ? current.filter((d: string) => d !== distance)
      : [...current, distance];
    setValue("preferred_distances", updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-3">
      <Label>Preferred Distances *</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {distanceOptions.map((distance) => (
          <div key={distance.value} className="flex items-center space-x-2">
            <Checkbox
              id={`distance-${distance.value}`}
              checked={selectedDistances?.includes(distance.value) || false}
              onCheckedChange={() => toggleDistance(distance.value)}
            />
            <Label htmlFor={`distance-${distance.value}`} className="text-sm font-normal">
              {distance.label}
            </Label>
          </div>
        ))}
      </div>
      {errors.preferred_distances && (
        <p className="text-sm font-medium text-destructive">{errors.preferred_distances.message as string}</p>
      )}
    </div>
  );
};