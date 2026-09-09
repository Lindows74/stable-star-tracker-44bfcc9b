import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MultiSelectDropdown } from "@/components/filters/MultiSelectDropdown";
import { useHorseSearch } from "@/hooks/useHorseSearch";
import { useBreeds } from "@/hooks/useBreeds";
import { TRAITS } from "@/utils/constants";
import { Search } from "lucide-react";

interface HorsePickerProps {
  gender: "stallion" | "mare";
  label: string;
  onSelect: (horse: any) => void;
  triggerLabel?: string;
}

export const HorsePicker = ({ gender, label, onSelect, triggerLabel }: HorsePickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [traitsOpen, setTraitsOpen] = useState(false);
  const [breedsOpen, setBreedsOpen] = useState(false);

  const { data: availableBreeds } = useBreeds();

  const { data: horses, isLoading } = useHorseSearch({
    searchTerm,
    selectedCategories: [],
    selectedSurfaces: [],
    selectedDistances: [],
    selectedPositions: [],
    selectedTraits,
    selectedBreeds,
    minTierInput: "",
    maxTierInput: "",
    selectedDateSort: null,
    pureBreedOnly: false,
  });

  const filtered = useMemo(
    () => (horses || []).filter((h: any) => h.gender === gender),
    [horses, gender]
  );

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Search className="h-4 w-4 mr-2" />
          {triggerLabel || `Choose ${label}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose {label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MultiSelectDropdown
              label="Traits"
              placeholder="Select traits..."
              searchPlaceholder="Search traits..."
              options={[...TRAITS]}
              selectedValues={selectedTraits}
              onToggle={(v) => toggle(selectedTraits, setSelectedTraits, v)}
              open={traitsOpen}
              onOpenChange={setTraitsOpen}
            />
            <MultiSelectDropdown
              label="Breeds"
              placeholder="Select breeds..."
              searchPlaceholder="Search breeds..."
              options={availableBreeds || []}
              selectedValues={selectedBreeds}
              onToggle={(v) => toggle(selectedBreeds, setSelectedBreeds, v)}
              open={breedsOpen}
              onOpenChange={setBreedsOpen}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 mt-3 pr-3">
          <div className="space-y-2 pb-2">
            {isLoading && <p className="text-sm text-muted-foreground">Loading horses...</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No {label.toLowerCase()}s match your search.</p>
            )}
            {filtered.map((horse: any) => (
              <button
                key={horse.id}
                type="button"
                onClick={() => {
                  onSelect(horse);
                  setOpen(false);
                }}
                className="w-full text-left rounded-md border p-2 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{horse.name}</span>
                  {horse.tier != null && <Badge variant="secondary">Tier {horse.tier}</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {horse.horse_breeding?.map((b: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {b.breeds?.name} {Number(b.percentage)}%
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
