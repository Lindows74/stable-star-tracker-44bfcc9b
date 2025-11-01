import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { forwardRef } from "react";

interface NameSearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const NameSearchFilter = forwardRef<HTMLInputElement, NameSearchFilterProps>(
  ({ value, onChange }, ref) => {
    return (
      <div>
        <Label htmlFor="search">Horse Name</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref}
            id="search"
            placeholder="Search by name..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    );
  }
);

NameSearchFilter.displayName = "NameSearchFilter";
