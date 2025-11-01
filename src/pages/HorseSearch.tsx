import { useEffect, useRef, useState } from "react";
import { HorseCard } from "@/components/horses/HorseCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout/Layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CATEGORIES, SURFACES, DISTANCES, POSITIONS, TRAITS } from "@/utils/constants";
import { useHorseFilters } from "@/hooks/useHorseFilters";
import { useHorseSearch } from "@/hooks/useHorseSearch";
import { useBreeds } from "@/hooks/useBreeds";
import { NameSearchFilter } from "@/components/filters/NameSearchFilter";
import { TierRangeFilter } from "@/components/filters/TierRangeFilter";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { CheckboxListFilter } from "@/components/filters/CheckboxListFilter";
import { SelectWithBadges } from "@/components/filters/SelectWithBadges";
import { MultiSelectDropdown } from "@/components/filters/MultiSelectDropdown";
import { DateSortFilter } from "@/components/filters/DateSortFilter";

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
      <NameSearchFilter
        ref={searchInputRef}
        value={filters.searchTerm}
        onChange={filters.setSearchTerm}
      />

      <TierRangeFilter
        minValue={filters.minTierInput}
        maxValue={filters.maxTierInput}
        onMinChange={filters.setMinTierInput}
        onMaxChange={filters.setMaxTierInput}
      />

      <DateRangeFilter
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        onFromDateChange={filters.setFromDate}
        onToDateChange={filters.setToDate}
      />

      <CheckboxListFilter
        label="Categories"
        options={categories}
        selectedValues={filters.selectedCategories}
        onToggle={filters.toggleCategory}
      />

      <CheckboxListFilter
        label="Preferred Surfaces"
        options={surfaces}
        selectedValues={filters.selectedSurfaces}
        onToggle={filters.toggleSurface}
      />

      <SelectWithBadges
        label="Distances"
        placeholder="Select distances..."
        options={distances}
        selectedValues={filters.selectedDistances}
        onToggle={filters.toggleDistance}
        formatValue={(v) => `${v}m`}
      />

      <CheckboxListFilter
        label="Field Positions"
        options={positions}
        selectedValues={filters.selectedPositions}
        onToggle={filters.togglePosition}
      />

      <MultiSelectDropdown
        label="Traits"
        placeholder="Select traits..."
        searchPlaceholder="Search traits..."
        options={traits}
        selectedValues={filters.selectedTraits}
        onToggle={filters.toggleTrait}
        open={traitsOpen}
        onOpenChange={setTraitsOpen}
      />

      <MultiSelectDropdown
        label="Breeds"
        placeholder="Select breeds..."
        searchPlaceholder="Search breeds..."
        options={availableBreeds || []}
        selectedValues={filters.selectedBreeds}
        onToggle={filters.toggleBreed}
        open={breedsOpen}
        onOpenChange={setBreedsOpen}
      />

      <DateSortFilter
        selectedSort={filters.selectedDateSort}
        onSortChange={filters.setSelectedDateSort}
      />
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