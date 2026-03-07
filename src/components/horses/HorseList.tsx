import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HorseCard } from "./HorseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sortHorses } from "@/utils/horseUtils";
import { Loader2 } from "lucide-react";

const INITIAL_HORSES = 6;
const LOAD_MORE_COUNT = 6;

export const HorseList = () => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_HORSES);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: horses, isLoading, error } = useQuery({
    queryKey: ["horses"],
    queryFn: async () => {
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

      if (error) throw error;
      if (!data) return [];
      
      return sortHorses(data);
    },
  });

  // Reset visible count when data changes
  useEffect(() => {
    setVisibleCount(INITIAL_HORSES);
  }, [horses?.length]);

  // Intersection observer for lazy loading
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, horses?.length || 0));
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [horses?.length]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
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
        <h3 className="text-lg font-semibold text-foreground mb-2">No horses yet</h3>
        <p className="text-muted-foreground">Add your first horse to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {horses.slice(0, visibleCount).map((horse) => (
          <HorseCard key={horse.id} horse={horse} />
        ))}
      </div>
      {visibleCount < horses.length && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading more horses...</span>
        </div>
      )}
    </>
  );
};
