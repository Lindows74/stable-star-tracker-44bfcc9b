import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface SelectWithBadgesProps {
  label: string;
  placeholder: string;
  options: readonly string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  formatValue?: (value: string) => string;
}

export const SelectWithBadges = ({
  label,
  placeholder,
  options,
  selectedValues,
  onToggle,
  formatValue = (v) => v,
}: SelectWithBadgesProps) => {
  return (
    <div>
      <Label>{label}</Label>
      <Select onValueChange={(value) => onToggle(value)}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {formatValue(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((value) => (
            <Badge key={value} variant="secondary" className="text-xs">
              {formatValue(value)}
              <button
                onClick={() => onToggle(value)}
                className="ml-1 hover:bg-muted/50 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
