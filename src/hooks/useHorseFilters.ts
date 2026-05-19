import { useState, useEffect } from "react";
import { toggleArrayValue } from "@/utils/filterUtils";

export type DateSortType = "created_desc" | "created_asc" | "updated_desc" | "updated_asc" | null;

export interface HorseFilters {
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
}

export const useHorseFilters = () => {
  const STORAGE_KEY = "horseSearchFilters";
  const initial: Partial<HorseFilters> = (() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  const [searchTerm, setSearchTerm] = useState(initial.searchTerm ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initial.selectedCategories ?? []);
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>(initial.selectedSurfaces ?? []);
  const [selectedDistances, setSelectedDistances] = useState<string[]>(initial.selectedDistances ?? []);
  const [selectedPositions, setSelectedPositions] = useState<string[]>(initial.selectedPositions ?? []);
  const [selectedTraits, setSelectedTraits] = useState<string[]>(initial.selectedTraits ?? []);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>(initial.selectedBreeds ?? []);
  const [minTierInput, setMinTierInput] = useState<string>(initial.minTierInput ?? "");
  const [maxTierInput, setMaxTierInput] = useState<string>(initial.maxTierInput ?? "");
  const [selectedDateSort, setSelectedDateSort] = useState<DateSortType>(initial.selectedDateSort ?? null);

  // Persist filters so backgrounding the app (mobile) doesn't reset them.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
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
        })
      );
    } catch {
      // ignore quota / privacy errors
    }
  }, [
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
  ]);

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
    setSelectedDateSort(null);
  };

  const toggleCategory = (value: string) => 
    toggleArrayValue(selectedCategories, setSelectedCategories, value);
  
  const toggleSurface = (value: string) => 
    toggleArrayValue(selectedSurfaces, setSelectedSurfaces, value);
  
  const toggleDistance = (value: string) => 
    toggleArrayValue(selectedDistances, setSelectedDistances, value);
  
  const togglePosition = (value: string) => 
    toggleArrayValue(selectedPositions, setSelectedPositions, value);
  
  const toggleTrait = (value: string) => 
    toggleArrayValue(selectedTraits, setSelectedTraits, value);
  
  const toggleBreed = (value: string) => 
    toggleArrayValue(selectedBreeds, setSelectedBreeds, value);

  return {
    // State values
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
    
    // Setters
    setSearchTerm,
    setSelectedCategories,
    setSelectedSurfaces,
    setSelectedDistances,
    setSelectedPositions,
    setSelectedTraits,
    setSelectedBreeds,
    setMinTierInput,
    setMaxTierInput,
    setSelectedDateSort,
    
    // Helper functions
    clearAllFilters,
    toggleCategory,
    toggleSurface,
    toggleDistance,
    togglePosition,
    toggleTrait,
    toggleBreed,
  };
};
