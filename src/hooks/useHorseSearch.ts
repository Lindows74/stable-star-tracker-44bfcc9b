import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sortHorses } from "@/utils/horseUtils";
import { validateTierInput } from "@/utils/filterUtils";
import type { DateSortType } from "./useHorseFilters";

interface UseHorseSearchParams {
  searchTerm: string;
  selectedCategories: string[];
  selectedSurfaces: string[];
  selectedDistances: string[];
  selectedPositions: string[];
  selectedTraits: string[];
  selectedBreeds: string[];
  minTierInput: string;
  maxTierInput: string;
  selectedDateSort: DateSortType;
  pureBreedOnly: boolean;
}

/**
 * Complex horse search query with filtering and sorting
 * Preserves all original logic for date sorting and client-side filtering
 */
export const useHorseSearch = (params: UseHorseSearchParams) => {
  const {
    searchTerm,
    selectedCategories,
    selectedSurfaces,
    selectedDistances,
    selectedPositions,
    selectedTraits,
    selectedBreeds,
    minTierInput,
    maxTierInput,
    selectedDateSort,
    pureBreedOnly,
  } = params;

  // Validate tier inputs
  const minTierNum = validateTierInput(minTierInput);
  const maxTierNum = validateTierInput(maxTierInput);

  return useQuery({
    queryKey: [
      "horses",
      "search",
      searchTerm,
      selectedCategories,
      selectedSurfaces,
      selectedDistances,
      selectedPositions,
      selectedTraits,
      selectedBreeds,
      minTierNum,
      maxTierNum,
      selectedDateSort,
      pureBreedOnly,
    ],
    placeholderData: keepPreviousData,
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

      // Apply date sorting if selected
      let data, error;
      if (selectedDateSort) {
        const dateField = selectedDateSort.startsWith("created") ? "created_at" : "updated_at";
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
          horse.horse_breeding?.some(breeding => {
            if (!selectedBreeds.includes(breeding.breeds.name)) return false;
            if (pureBreedOnly) {
              return Number(breeding.percentage) === 100 && horse.horse_breeding.length === 1;
            }
            return true;
          })
        );
      } else if (pureBreedOnly) {
        filteredData = filteredData.filter(horse =>
          horse.horse_breeding?.length === 1 && Number(horse.horse_breeding[0].percentage) === 100
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
};
