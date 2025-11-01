import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch available horse breeds from the database
 */
export const useBreeds = () => {
  return useQuery({
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
};
