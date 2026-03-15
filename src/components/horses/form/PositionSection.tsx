
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, useWatch } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface PositionSectionProps {
  control: Control<any>;
}

const positionOptions = [
  { value: "front", label: "Front" },
  { value: "middle", label: "Middle" },
  { value: "back", label: "Back" },
];

export const PositionSection = ({ control }: PositionSectionProps) => {
  const { setValue, getValues, formState: { errors } } = useFormContext();
  const selectedPositions = useWatch({
    control,
    name: "field_positions",
    defaultValue: getValues("field_positions") || []
  });

  const togglePosition = (position: string) => {
    const current = getValues("field_positions") || [];
    const updated = current.includes(position)
      ? current.filter((p: string) => p !== position)
      : [...current, position];
    setValue("field_positions", updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-3">
      <Label>Field Positions *</Label>
      <div className="grid grid-cols-3 gap-3">
        {positionOptions.map((position) => (
          <div key={position.value} className="flex items-center space-x-2">
            <Checkbox
              id={`position-${position.value}`}
              checked={selectedPositions?.includes(position.value) || false}
              onCheckedChange={() => togglePosition(position.value)}
            />
            <Label htmlFor={`position-${position.value}`} className="text-sm font-normal">
              {position.label}
            </Label>
          </div>
        ))}
      </div>
      {errors.field_positions && (
        <p className="text-sm font-medium text-destructive">{errors.field_positions.message as string}</p>
      )}
    </div>
  );
};