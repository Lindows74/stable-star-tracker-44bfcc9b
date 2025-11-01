import { useEffect, useRef, useState } from "react";
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
import { X, Search, Filter, Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatLabel } from "@/utils/formatUtils";
import { CATEGORIES, SURFACES, DISTANCES, POSITIONS, TRAITS } from "@/utils/constants";
import { useHorseFilters } from "@/hooks/useHorseFilters";
import { useHorseSearch } from "@/hooks/useHorseSearch";
import { useBreeds } from "@/hooks/useBreeds";

const HorseSearch = () => {
  const filters = useHorseFilters();
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


  // Use custom hooks for data fetching
  const { data: horses, isLoading, error } = useHorseSearch(filters);
  const { data: availableBreeds } = useBreeds();


  const categories = [...CATEGORIES];
  const surfaces = [...SURFACES];
  const distances = [...DISTANCES];
  const positions = [...POSITIONS];
  const traits = [...TRAITS];


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
              value={filters.searchTerm}
              onChange={(e) => filters.setSearchTerm(e.target.value)}
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
            value={filters.minTierInput}
            onChange={(e) => filters.setMinTierInput(e.target.value)}
            min="1"
            max="10"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxTierInput}
            onChange={(e) => filters.setMaxTierInput(e.target.value)}
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
                      !filters.fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fromDate ? format(filters.fromDate, "PPP") : <span>From date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.fromDate}
                    onSelect={filters.setFromDate}
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
                      !filters.toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.toDate ? format(filters.toDate, "PPP") : <span>To date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.toDate}
                    onSelect={filters.setToDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {(filters.fromDate || filters.toDate) && (
            <div className="flex gap-1">
              {filters.fromDate && (
                <Badge variant="secondary" className="text-xs">
                  From: {format(filters.fromDate, "MMM d, yyyy")}
                  <button
                    onClick={() => filters.setFromDate(undefined)}
                    className="ml-1 hover:bg-muted/50 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.toDate && (
                <Badge variant="secondary" className="text-xs">
                  To: {format(filters.toDate, "MMM d, yyyy")}
                  <button
                    onClick={() => filters.setToDate(undefined)}
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
                checked={filters.selectedCategories.includes(category)}
                onCheckedChange={() => filters.toggleCategory(category)}
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
                checked={filters.selectedSurfaces.includes(surface)}
                onCheckedChange={() => filters.toggleSurface(surface)}
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
        <Select onValueChange={(value) => filters.toggleDistance(value)}>
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
        {filters.selectedDistances.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.selectedDistances.map((distance) => (
              <Badge key={distance} variant="secondary" className="text-xs">
                {distance}m
                <button
                  onClick={() => filters.toggleDistance(distance)}
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
                checked={filters.selectedPositions.includes(position)}
                onCheckedChange={() => filters.togglePosition(position)}
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
              {filters.selectedTraits.length > 0
                ? `${filters.selectedTraits.length} trait${filters.selectedTraits.length > 1 ? 's' : ''} selected`
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
                        filters.toggleTrait(trait);
                        // Keep popover open for multiple selections
                      }}
                    >
                      {trait}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          filters.selectedTraits.includes(trait) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {filters.selectedTraits.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.selectedTraits.map((trait) => (
              <Badge key={trait} variant="secondary" className="text-xs">
                {trait}
                <button
                  onClick={() => filters.toggleTrait(trait)}
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
              {filters.selectedBreeds.length > 0
                ? `${filters.selectedBreeds.length} breed${filters.selectedBreeds.length > 1 ? 's' : ''} selected`
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
                        filters.toggleBreed(breed);
                        // Keep popover open for multiple selections
                      }}
                    >
                      {breed}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          filters.selectedBreeds.includes(breed) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {filters.selectedBreeds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.selectedBreeds.map((breed) => (
              <Badge key={breed} variant="secondary" className="text-xs">
                {breed}
                <button
                  onClick={() => filters.toggleBreed(breed)}
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
              checked={filters.selectedDateSort === "created_desc"}
              onCheckedChange={(checked) => filters.setSelectedDateSort(checked ? "created_desc" : null)}
            />
            <Label htmlFor="date-created-desc" className="text-sm font-normal">
              Date Added ↓ (Newest First)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="date-created-asc"
              checked={filters.selectedDateSort === "created_asc"}
              onCheckedChange={(checked) => filters.setSelectedDateSort(checked ? "created_asc" : null)}
            />
            <Label htmlFor="date-created-asc" className="text-sm font-normal">
              Date Added ↑ (Oldest First)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="date-updated-desc"
              checked={filters.selectedDateSort === "updated_desc"}
              onCheckedChange={(checked) => filters.setSelectedDateSort(checked ? "updated_desc" : null)}
            />
            <Label htmlFor="date-updated-desc" className="text-sm font-normal">
              Last Updated ↓ (Newest First)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="date-updated-asc"
              checked={filters.selectedDateSort === "updated_asc"}
              onCheckedChange={(checked) => filters.setSelectedDateSort(checked ? "updated_asc" : null)}
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
                    onClick={filters.clearAllFilters}
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
                  onClick={filters.clearAllFilters}
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