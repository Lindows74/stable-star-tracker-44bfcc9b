import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatLabel } from "@/utils/formatUtils";

interface CheckboxListFilterProps {
  label: string;
  options: readonly string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export const CheckboxListFilter = ({
  label,
  options,
  selectedValues,
  onToggle,
}: CheckboxListFilterProps) => {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${label.toLowerCase().replace(/\s+/g, '-')}-${option}`}
              checked={selectedValues.includes(option)}
              onCheckedChange={() => onToggle(option)}
            />
            <Label 
              htmlFor={`${label.toLowerCase().replace(/\s+/g, '-')}-${option}`} 
              className="text-sm font-normal"
            >
              {formatLabel(option)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
