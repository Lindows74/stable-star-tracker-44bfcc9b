import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HorseCard } from "@/components/horses/HorseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { X, Search, Filter, Calendar as CalendarIcon, Menu, Check, ChevronsUpDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { sortHorses } from "@/utils/horseUtils";
import { formatLabel } from "@/utils/formatUtils";
import { toggleArrayValue, validateTierInput } from "@/utils/filterUtils";
import { CATEGORIES, SURFACES, DISTANCES, POSITIONS, TRAITS } from "@/utils/constants";

const HorseSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [minTierInput, setMinTierInput] = useState<string>("");
  const [maxTierInput, setMaxTierInput] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [selectedDateSort, setSelectedDateSort] = useState<"created_desc" | "created_asc" | "updated_desc" | "updated_asc" | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [traitsOpen, setTraitsOpen] = useState(false);
  const [breedsOpen, setBreedsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = 'horseSearchInitialFocusDone'
    if (sessionStorage.getItem(key) === '1') return
    const timer = setTimeout(() => {
      if (document.activeElement === document.body) {
        searchInputRef.current?.focus()
      }
      sessionStorage.setItem(key, '1')
    }, 100)
    return () => clearTimeout(timer)
  }, [])


  // Derived numeric tier values for filtering and query keys
  const minTierNum = validateTierInput(minTierInput);
  const maxTierNum = validateTierInput(maxTierInput);

  const { data: horses, isLoading, error } = useQuery({
    queryKey: ["horses", "search", searchTerm, selectedCategories, selectedSurfaces, selectedDistances, selectedPositions, selectedTraits, selectedBreeds, minTierNum, maxTierNum, fromDate, toDate, selectedDateSort],
    queryFn: async () => {
      console.log("HorseSearch: Fetching horses with filters...");
      
      let query = supabase
        .from("horses")
        .select(`
          *,
          horse_categories(category),
          horse_surfaces(surface),
          horse_distances(distance),
          horse_positions(position),
          horse_breeding(
            percentage,
            breeds(name)
          ),
          horse_traits(
            trait_name,
            trait_value,
            trait_category
          )
        `);

      // Apply search term filter
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      // Apply tier filters
      if (minTierNum !== null) {
        query = query.gte("tier", minTierNum);
      }
      if (maxTierNum !== null) {
        query = query.lte("tier", maxTierNum);
      }

      // Apply date filters and sorting only if a date sort option is selected
      let data, error;
      if (selectedDateSort) {
        const dateField = selectedDateSort.startsWith("created") ? "created_at" : "updated_at";
        if (fromDate) {
          const fromDateISO = fromDate.toISOString();
          query = query.gte(dateField, fromDateISO);
        }
        if (toDate) {
          // Set to end of day for toDate
          const toDateEndOfDay = new Date(toDate);
          toDateEndOfDay.setHours(23, 59, 59, 999);
          const toDateISO = toDateEndOfDay.toISOString();
          query = query.lte(dateField, toDateISO);
        }

        const sortAscending = selectedDateSort.endsWith("_asc");
        const result = await query.order(dateField, { ascending: sortAscending });
        data = result.data;
        error = result.error;
      } else {
        // Default query without date sorting
        const result = await query.order("created_at", { ascending: false });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("HorseSearch: Error fetching horses:", error);
        throw error;
      }

      // Filter by categories, surfaces, distances, positions, and traits on the client side
      // since these require joining multiple tables
      let filteredData = data || [];

      if (selectedCategories.length > 0) {
        filteredData = filteredData.filter(horse => 
          horse.horse_categories?.some(cat => selectedCategories.includes(cat.category))
        );
      }

      if (selectedSurfaces.length > 0) {
        filteredData = filteredData.filter(horse => 
          horse.horse_surfaces?.some(surf => selectedSurfaces.includes(surf.surface))
        );
      }

      if (selectedDistances.length > 0) {
        filteredData = filteredData.filter(horse => 
          horse.horse_distances?.some(dist => selectedDistances.includes(dist.distance))
        );
      }

      if (selectedPositions.length > 0) {
        filteredData = filteredData.filter(horse => 
          horse.horse_positions?.some(pos => selectedPositions.includes(pos.position))
        );
      }

      if (selectedTraits.length > 0) {
        filteredData = filteredData.filter(horse => 
          horse.horse_traits?.some(trait => selectedTraits.includes(trait.trait_name))
        );
      }

      if (selectedBreeds.length > 0) {
        filteredData = filteredData.filter(horse => 
          horse.horse_breeding?.some(breeding => selectedBreeds.includes(breeding.breeds.name))
        );
      }

      // Sort horses using the default logic only if no date sort is selected
      if (!selectedDateSort) {
        const sortedData = sortHorses(filteredData);
        console.log("HorseSearch: Filtered and sorted horses:", sortedData);
        return sortedData;
      } else {
        console.log("HorseSearch: Filtered horses (date sorted):", filteredData);
        return filteredData;
      }
    },
  });

  // Fetch available breeds
  const { data: availableBreeds } = useQuery({
    queryKey: ["breeds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("breeds")
        .select("name")
        .order("name");
      
      if (error) {
        console.error("Error fetching breeds:", error);
        throw error;
      }
      
      return data?.map(breed => breed.name) || [];
    },
  });


  const categories = [...CATEGORIES];
  const surfaces = [...SURFACES];
  const distances = [...DISTANCES];
  const positions = [...POSITIONS];
  const traits = [...TRAITS];

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedSurfaces([]);
    setSelectedDistances([]);
    setSelectedPositions([]);
    setSelectedTraits([]);
    setSelectedBreeds([]);
    setMinTierInput("");
    setMaxTierInput("");
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedDateSort(null);
  };


  const filterContent = (
    <div className="space-y-6">
      {/* Search by Name */}
      <div>
        <Label htmlFor="search">Horse Name</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            id="search"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tier Range */}
      <div>
        <Label>Tier Range</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Input
            type="number"
            placeholder="Min"
            value={minTierInput}
            onChange={(e) => setMinTierInput(e.target.value)}
            min="1"
            max="10"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxTierInput}
            onChange={(e) => setMaxTierInput(e.target.value)}
            min="1"
            max="10"
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <Label>Date Range Filter</Label>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>From date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>To date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {(fromDate || toDate) && (
            <div className="flex gap-1">
              {fromDate && (
                <Badge variant="secondary" className="text-xs">
                  From: {format(fromDate, "MMM d, yyyy")}
                  <button
                    onClick={() => setFromDate(undefined)}
                    className="ml-1 hover:bg-muted/50 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {toDate && (
                <Badge variant="secondary" className="text-xs">
                  To: {format(toDate, "MMM d, yyyy")}
                  <button
                    onClick={() => setToDate(undefined)}
                    className="ml-1 hover:bg-muted/50 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label>Categories</Label>
        <div className="mt-2 space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleArrayValue(selectedCategories, setSelectedCategories, category)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                {formatLabel(category)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Surfaces */}
      <div>
        <Label>Preferred Surfaces</Label>
        <div className="mt-2 space-y-2">
          {surfaces.map((surface) => (
            <div key={surface} className="flex items-center space-x-2">
              <Checkbox
                id={`surface-${surface}`}
                checked={selectedSurfaces.includes(surface)}
                onCheckedChange={() => toggleArrayValue(selectedSurfaces, setSelectedSurfaces, surface)}
              />
              <Label htmlFor={`surface-${surface}`} className="text-sm font-normal">
                {formatLabel(surface)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Distances */}
      <div>
        <Label>Distances</Label>
        <Select onValueChange={(value) => toggleArrayValue(selectedDistances, setSelectedDistances, value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select distances..." />
          </SelectTrigger>
          <SelectContent>
            {distances.map((distance) => (
              <SelectItem key={distance} value={distance}>
                {distance}m
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedDistances.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedDistances.map((distance) => (
              <Badge key={distance} variant="secondary" className="text-xs">
                {distance}m
                <button
                  onClick={() => toggleArrayValue(selectedDistances, setSelectedDistances, distance)}
                  className="ml-1 hover:bg-muted/50 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Positions */}
      <div>
        <Label>Field Positions</Label>
        <div className="mt-2 space-y-2">
          {positions.map((position) => (
            <div key={position} className="flex items-center space-x-2">
              <Checkbox
                id={`position-${position}`}
                checked={selectedPositions.includes(position)}
                onCheckedChange={() => toggleArrayValue(selectedPositions, setSelectedPositions, position)}
              />
              <Label htmlFor={`position-${position}`} className="text-sm font-normal">
                {formatLabel(position)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Traits */}
      <div>
        <Label>Traits</Label>
        <Popover open={traitsOpen} onOpenChange={setTraitsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={traitsOpen}
              className="w-full justify-between mt-1"
            >
              {selectedTraits.length > 0
                ? `${selectedTraits.length} trait${selectedTraits.length > 1 ? 's' : ''} selected`
                : "Select traits..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent onOpenAutoFocus={(e) => e.preventDefault()} className="z-50 w-full p-0 bg-popover" align="start">
            <Command>
              <CommandInput placeholder="Search traits..." className="h-9" />
              <CommandList>
                <CommandEmpty>No trait found.</CommandEmpty>
                <CommandGroup>
                  {traits.map((trait) => (
                    <CommandItem
                      key={trait}
                      value={trait}
                      onSelect={(currentValue) => {
                        toggleArrayValue(selectedTraits, setSelectedTraits, trait);
                        // Keep popover open for multiple selections
                      }}
                    >
                      {trait}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedTraits.includes(trait) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedTraits.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedTraits.map((trait) => (
              <Badge key={trait} variant="secondary" className="text-xs">
                {trait}
                <button
                  onClick={() => toggleArrayValue(selectedTraits, setSelectedTraits, trait)}
                  className="ml-1 hover:bg-muted/50 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Breeds */}
      <div>
        <Label>Breeds</Label>
        <Popover open={breedsOpen} onOpenChange={setBreedsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={breedsOpen}
              className="w-full justify-between mt-1"
            >
              {selectedBreeds.length > 0
                ? `${selectedBreeds.length} breed${selectedBreeds.length > 1 ? 's' : ''} selected`
                : "Select breeds..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent onOpenAutoFocus={(e) => e.preventDefault()} className="z-50 w-full p-0 bg-popover" align="start">
            <Command>
              <CommandInput placeholder="Search breeds..." className="h-9" />
              <CommandList>
                <CommandEmpty>No breed found.</CommandEmpty>
                <CommandGroup>
                  {availableBreeds?.map((breed) => (
                    <CommandItem
                      key={breed}
                      value={breed}
                      onSelect={(currentValue) => {
                        toggleArrayValue(selectedBreeds, setSelectedBreeds, breed);
                        // Keep popover open for multiple selections
                      }}
                    >
                      {breed}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedBreeds.includes(breed) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedBreeds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedBreeds.map((breed) => (
              <Badge key={breed} variant="secondary" className="text-xs">
                {breed}
                <button
                  onClick={() => toggleArrayValue(selectedBreeds, setSelectedBreeds, breed)}
                  className="ml-1 hover:bg-muted/50 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Date Sort Options */}
      <div>
        <Label>Sort by Date</Label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="date-created-desc"
              checked={selectedDateSort === "created_desc"}
              onCheckedChange={(checked) => setSelectedDateSort(checked ? "created_desc" : null)}
            />
            <Label htmlFor="date-created-desc" className="text-sm font-normal">
              Date Added ↓ (Newest First)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="date-created-asc"
              checked={selectedDateSort === "created_asc"}
              onCheckedChange={(checked) => setSelectedDateSort(checked ? "created_asc" : null)}
            />
            <Label htmlFor="date-created-asc" className="text-sm font-normal">
              Date Added ↑ (Oldest First)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="date-updated-desc"
              checked={selectedDateSort === "updated_desc"}
              onCheckedChange={(checked) => setSelectedDateSort(checked ? "updated_desc" : null)}
            />
            <Label htmlFor="date-updated-desc" className="text-sm font-normal">
              Last Updated ↓ (Newest First)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="date-updated-asc"
              checked={selectedDateSort === "updated_asc"}
              onCheckedChange={(checked) => setSelectedDateSort(checked ? "updated_asc" : null)}
            />
            <Label htmlFor="date-updated-asc" className="text-sm font-normal">
              Last Updated ↑ (Oldest First)
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Search Horses</h2>
            <p className="text-muted-foreground">
              Find horses by name, stats, traits, and racing preferences.
            </p>
          </div>
          
          {isMobile && (
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-96 flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 space-y-4 overflow-hidden">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                  <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
                    {filterContent}
                  </ScrollArea>
                </div>
                <div className="pt-4 border-t mt-auto">
                  <Button 
                    onClick={() => setFilterSheetOpen(false)}
                    className="w-full"
                    size="lg"
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar */}
          {!isMobile && (
            <div className="w-full lg:w-80 bg-card rounded-lg border p-6 h-fit">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-12rem)]">
                {filterContent}
              </ScrollArea>
            </div>
          )}

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <p className="text-muted-foreground">
                Found {horses?.length || 0} horse{horses?.length !== 1 ? 's' : ''}
              </p>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load horses. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {horses?.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No horses found matching your criteria.</p>
                  </div>
                ) : (
                  horses?.map((horse) => (
                    <HorseCard key={horse.id} horse={horse} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HorseSearch;