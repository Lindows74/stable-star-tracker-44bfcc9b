import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BREEDS } from "@/utils/constants";

/**
 * Fetch available horse breeds from the database
 */
export const useBreeds = () => {
  return useQuery({
    queryKey: ["breeds"],
    queryFn: async () => {
      const fallbackBreeds = [...BREEDS];

      const { data, error } = await supabase
        .from("breeds")
        .select("name")
        .order("name");

      if (error) {
        console.error("Error fetching breeds:", error);
        return fallbackBreeds;
      }

      const dbBreeds = data?.map((breed) => breed.name) || [];
      return Array.from(new Set([...fallbackBreeds, ...dbBreeds])).sort((a, b) => a.localeCompare(b));
    },
  });
};
