import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HorseCard } from "./HorseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sortHorses } from "@/utils/horseUtils";

export const HorseList = () => {
  const { data: horses, isLoading, error } = useQuery({
    queryKey: ["horses"],
    queryFn: async () => {
      console.log("HorseList: Starting fetch...");
      
      // Check authentication state
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("HorseList: Current user:", user?.id || "not authenticated");
      console.log("HorseList: Auth error:", authError);
      
      // Try a simple count query first
      const { count, error: countError } = await supabase
        .from("horses")
        .select("*", { count: 'exact', head: true });
      
      console.log("HorseList: Total horses count:", count);
      console.log("HorseList: Count error:", countError);
      
      const { data, error } = await supabase
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
        `)
        .order("created_at", { ascending: false });

      console.log("HorseList: Query response - data length:", data?.length || 0);
      console.log("HorseList: Query error:", error);
      console.log("HorseList: First few horses:", data?.slice(0, 3));

      if (error) {
        console.error("HorseList: Supabase error:", error);
        throw error;
      }

      if (!data) {
        console.log("HorseList: No data returned");
        return [];
      }
      
      // Sort horses by tier and stats
      const sortedHorses = sortHorses(data);
      console.log("HorseList: Returning sorted horses:", sortedHorses.length);
      
      return sortedHorses;
    },
  });

  console.log("HorseList: Component render - isLoading:", isLoading, "error:", error, "horses count:", horses?.length);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error("HorseList: Rendering error state:", error);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load horses. Please try again later. Error: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!horses || horses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No horses yet</h3>
        <p className="text-gray-600">Add your first horse to get started.</p>
      </div>
    );
  }

  console.log("HorseList: About to render", horses.length, "horses");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {horses.map((horse) => (
        <HorseCard key={horse.id} horse={horse} />
      ))}
    </div>
  );
};
