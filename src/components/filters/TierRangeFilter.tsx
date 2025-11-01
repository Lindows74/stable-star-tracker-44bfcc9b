import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TierRangeFilterProps {
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

export const TierRangeFilter = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: TierRangeFilterProps) => {
  return (
    <div>
      <Label>Tier Range</Label>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <Input
          type="number"
          placeholder="Min"
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          min="1"
          max="10"
        />
        <Input
          type="number"
          placeholder="Max"
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          min="1"
          max="10"
        />
      </div>
    </div>
  );
};
