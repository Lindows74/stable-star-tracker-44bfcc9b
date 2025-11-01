import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { DateSortType } from "@/hooks/useHorseFilters";

interface DateSortFilterProps {
  selectedSort: DateSortType;
  onSortChange: (sort: DateSortType) => void;
}

export const DateSortFilter = ({ selectedSort, onSortChange }: DateSortFilterProps) => {
  return (
    <div>
      <Label>Sort by Date</Label>
      <div className="mt-2 space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="date-created-desc"
            checked={selectedSort === "created_desc"}
            onCheckedChange={(checked) => onSortChange(checked ? "created_desc" : null)}
          />
          <Label htmlFor="date-created-desc" className="text-sm font-normal">
            Date Added ↓ (Newest First)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="date-created-asc"
            checked={selectedSort === "created_asc"}
            onCheckedChange={(checked) => onSortChange(checked ? "created_asc" : null)}
          />
          <Label htmlFor="date-created-asc" className="text-sm font-normal">
            Date Added ↑ (Oldest First)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="date-updated-desc"
            checked={selectedSort === "updated_desc"}
            onCheckedChange={(checked) => onSortChange(checked ? "updated_desc" : null)}
          />
          <Label htmlFor="date-updated-desc" className="text-sm font-normal">
            Last Updated ↓ (Newest First)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="date-updated-asc"
            checked={selectedSort === "updated_asc"}
            onCheckedChange={(checked) => onSortChange(checked ? "updated_asc" : null)}
          />
          <Label htmlFor="date-updated-asc" className="text-sm font-normal">
            Last Updated ↑ (Oldest First)
          </Label>
        </div>
      </div>
    </div>
  );
};
