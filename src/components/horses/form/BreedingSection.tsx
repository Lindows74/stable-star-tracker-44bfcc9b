
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, Save, ChevronsUpDown, Check } from "lucide-react";
import { useState, useRef, memo, useCallback, useMemo, type KeyboardEvent, type RefObject } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBreeds } from "@/hooks/useBreeds";
import { BREEDS } from "@/utils/constants";

export interface BreedSelection {
  breed: string;
  percentage: number;
}

interface BreedingSectionProps {
  breedSelections: BreedSelection[];
  setBreedSelections: (selections: BreedSelection[]) => void;
  gender?: "stallion" | "mare";
  setGender?: (gender: "stallion" | "mare" | undefined) => void;
  nextFocusRef?: RefObject<HTMLElement>;
}

const normalizeBreedText = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

const COMMON_BREED_ALIASES: Record<string, string[]> = {
  Friesian: ["friesier", "frisian", "friesan"],
};

const getBreedAliases = (breed: string) => {
  const normalizedBreed = normalizeBreedText(breed);
  const matchedKey = Object.keys(COMMON_BREED_ALIASES).find(
    (key) => normalizeBreedText(key) === normalizedBreed,
  );

  return matchedKey ? COMMON_BREED_ALIASES[matchedKey] : [];
};

export const BreedingSection = memo(({ breedSelections, setBreedSelections, gender, setGender, nextFocusRef }: BreedingSectionProps) => {
  const { data: breedOptions = [], isLoading: breedsLoading } = useBreeds();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);
  const [searchValues, setSearchValues] = useState<Record<number, string>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const allBreedOptions = useMemo(() => {
    return Array.from(new Set([...BREEDS, ...breedOptions])).sort((a, b) => a.localeCompare(b));
  }, [breedOptions]);

  const addBreedSelection = useCallback(() => {
    setBreedSelections([...breedSelections, { breed: "", percentage: 0 }]);
    setHasUnsavedChanges(true);
  }, [breedSelections, setBreedSelections]);

  const removeBreedSelection = useCallback((index: number) => {
    const updated = breedSelections.filter((_, i) => i !== index);
    setBreedSelections(updated);
    setHasUnsavedChanges(true);
  }, [breedSelections, setBreedSelections]);

  const updateBreedSelection = useCallback((index: number, field: keyof BreedSelection, value: string | number) => {
    const updated = breedSelections.map((selection, i) => 
      i === index ? { ...selection, [field]: value } : selection
    );
    setBreedSelections(updated);
    setHasUnsavedChanges(true);
  }, [breedSelections, setBreedSelections]);

  const saveBreedingData = useCallback(() => {
    // Validate that all breed selections have both breed and percentage
    const incompleteSelections = breedSelections.some(selection => 
      !selection.breed || selection.percentage <= 0
    );

    if (incompleteSelections) {
      toast({
        title: "Incomplete Breeding Data",
        description: "Please ensure all breed selections have both a breed name and percentage greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setHasUnsavedChanges(false);
    toast({
      title: "Breeding Data Saved",
      description: "Breeding information will be saved when you submit the horse form.",
    });
    // Move focus to next section (e.g., Flat Racing) after saving
    setTimeout(() => {
      nextFocusRef?.current?.focus();
    }, 0);
  }, [breedSelections, toast, nextFocusRef]);

  const handleStallionChange = useCallback((checked: boolean) => {
    if (setGender) {
      setGender(checked ? "stallion" : undefined);
    }
  }, [setGender]);

  const handleMareChange = useCallback((checked: boolean) => {
    if (setGender) {
      setGender(checked ? "mare" : undefined);
    }
  }, [setGender]);

  const handleTriggerKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const isModifier = e.ctrlKey || e.metaKey || e.altKey;
    const isChar = e.key.length === 1 && !isModifier;
    const isBackspace = e.key === "Backspace";
    const isEnterOrSpace = e.key === "Enter" || e.key === " ";

    if (isChar || isBackspace || isEnterOrSpace) {
      e.preventDefault();
      setOpenPopoverIndex(idx);
      setTimeout(() => {
        const input = inputRefs.current[idx];
        if (input) {
          if (isBackspace) {
            setSearchValues((prev) => ({ ...prev, [idx]: "" }));
          } else if (isChar) {
            setSearchValues((prev) => ({ ...prev, [idx]: (prev[idx] ?? "") + e.key }));
          }
          input.focus();
          const len = input.value.length;
          try { input.setSelectionRange(len, len); } catch {}
        }
      }, 0);
    }
  }, []);

  const totalPercentage = breedSelections.reduce((sum, selection) => sum + (selection.percentage || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Breeding Information (Optional)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addBreedSelection}>
          <Plus className="h-4 w-4 mr-1" />
          Add Breed
        </Button>
      </div>

      {/* Gender Selection */}
      {setGender && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Gender</Label>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stallion"
                checked={gender === "stallion"}
                onCheckedChange={handleStallionChange}
              />
              <Label htmlFor="stallion" className="text-sm">Stallion</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mare"
                checked={gender === "mare"}
                onCheckedChange={handleMareChange}
              />
              <Label htmlFor="mare" className="text-sm">Mare</Label>
            </div>
          </div>
        </div>
      )}
      
      {breedSelections.length > 0 && (
        <div className="space-y-3">
          {breedSelections.map((selection, index) => (
            <div key={index} className="flex items-center gap-2">
              <Popover 
                open={openPopoverIndex === index} 
                onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPopoverIndex === index}
                    className="flex-1 justify-between"
                    onKeyDown={(e) => handleTriggerKeyDown(e, index)}
                  >
                    {selection.breed || "Select breed..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover z-[70]">
                  <div className="border-b px-3 py-2">
                    <Input
                      placeholder="Search breeds..."
                      value={searchValues[index] ?? ""}
                      onChange={(e) => setSearchValues((prev) => ({ ...prev, [index]: e.target.value }))}
                      ref={(el) => (inputRefs.current[index] = el)}
                      autoFocus
                      className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {(() => {
                      const search = (searchValues[index] ?? "").trim();
                      const normalizedSearch = normalizeBreedText(search);
                      const filteredBreeds = allBreedOptions.filter((breed) => {
                        if (!normalizedSearch) return true;

                        const normalizedBreed = normalizeBreedText(breed);
                        if (normalizedBreed.includes(normalizedSearch)) return true;

                        const aliases = getBreedAliases(breed);
                        return aliases.some((alias) => normalizeBreedText(alias).includes(normalizedSearch));

                      if (filteredBreeds.length === 0) {
                        return (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            {breedsLoading ? "Loading breeds..." : "No breeds found."}
                          </div>
                        );
                      }

                      return filteredBreeds.map((breed) => (
                        <button
                          key={breed}
                          type="button"
                          onClick={() => {
                            updateBreedSelection(index, "breed", breed);
                            setOpenPopoverIndex(null);
                            setSearchValues((prev) => ({ ...prev, [index]: "" }));
                          }}
                          className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selection.breed === breed ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {breed}
                        </button>
                      ));
                    })()}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Percentage"
                value={selection.percentage || ""}
                onChange={(e) => updateBreedSelection(index, "percentage", parseInt(e.target.value) || 0)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveBreedingData();
                  }
                }}
                className="w-32"
              />
              
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => removeBreedSelection(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              Total: {totalPercentage}%
              {totalPercentage > 100 && (
                <span className="text-red-500 ml-2">Warning: Total exceeds 100%</span>
              )}
              {totalPercentage === 100 && (
                <span className="text-green-600 ml-2">✓ Perfect total</span>
              )}
              {hasUnsavedChanges && (
                <span className="text-orange-500 ml-2">• Unsaved changes</span>
              )}
            </div>
            {hasUnsavedChanges && (
              <Button type="button" variant="default" size="sm" onClick={saveBreedingData}>
                <Save className="h-4 w-4 mr-1" />
                Save Breeds
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.breedSelections === nextProps.breedSelections &&
    prevProps.gender === nextProps.gender &&
    prevProps.setBreedSelections === nextProps.setBreedSelections &&
    prevProps.setGender === nextProps.setGender &&
    prevProps.nextFocusRef === nextProps.nextFocusRef
  );
});
