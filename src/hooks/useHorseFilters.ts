import { useState } from "react";
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
  fromDate: Date | undefined;
  toDate: Date | undefined;
  selectedDateSort: DateSortType;
}

export const useHorseFilters = () => {
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
  const [selectedDateSort, setSelectedDateSort] = useState<DateSortType>(null);

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
    fromDate,
    toDate,
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
    setFromDate,
    setToDate,
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
