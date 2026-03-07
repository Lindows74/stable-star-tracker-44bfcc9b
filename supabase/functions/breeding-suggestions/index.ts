import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching live races and horses data...');

    // Fetch races and horses in parallel
    const [racesResult, horsesResult] = await Promise.all([
      supabase.from('live_races').select('*').order('id'),
      supabase.from('horses').select(`
        *,
        horse_traits (trait_name, trait_category, trait_value),
        horse_distances (distance),
        horse_surfaces (surface),
        horse_positions (position),
        horse_breeding (breed_id, percentage),
        horse_categories (category)
      `)
    ]);

    if (racesResult.error) throw racesResult.error;
    if (horsesResult.error) throw horsesResult.error;

    const liveRaces = racesResult.data || [];
    const horses = horsesResult.data || [];

    console.log(`Found ${liveRaces.length} races, ${horses.length} horses`);

    // Pre-index horse surfaces/distances into Sets for O(1) lookups
    const horseLookup = horses.map(horse => ({
      horse,
      surfaces: new Set(horse.horse_surfaces?.map(s => s.surface) || []),
      distances: new Set(horse.horse_distances?.map(d => d.distance) || []),
    }));

    const oddTiers = new Set([3, 5, 7, 9]);
    const evenTiers = new Set([2, 4, 6, 8]);

    // For each live race, find matching horses
    const raceMatches = liveRaces.map(race => {
      const isCrossCountry = /cross country/i.test(race.race_name || '');
      const checkDistance = !isCrossCountry && race.distance !== '0';

      const tierSet = race.tier_restriction === 'odd_grades' ? oddTiers
        : race.tier_restriction === 'even_grades' ? evenTiers
        : null;

      const matchingHorses = horseLookup
        .filter(({ horse, surfaces, distances }) => {
          if (!surfaces.has(race.surface)) return false;
          if (checkDistance && !distances.has(race.distance)) return false;
          if (tierSet && (!horse.tier || !tierSet.has(horse.tier))) return false;
          return true;
        })
        .map(({ horse }) => ({
          id: horse.id,
          name: horse.name,
          tier: horse.tier,
          speed: horse.speed,
          sprint_energy: horse.sprint_energy,
          acceleration: horse.acceleration,
          agility: horse.agility,
          jump: horse.jump,
          max_speed: horse.max_speed,
          max_sprint_energy: horse.max_sprint_energy,
          max_acceleration: horse.max_acceleration,
          max_agility: horse.max_agility,
          max_jump: horse.max_jump,
          traits: horse.horse_traits?.map(t => t.trait_name) || []
        }))
        .sort((a, b) => {
          if (a.tier !== b.tier) return (b.tier || 0) - (a.tier || 0);
          if (a.speed !== b.speed) return (b.speed || 0) - (a.speed || 0);
          return (b.sprint_energy || 0) - (a.sprint_energy || 0);
        });

      return { ...race, matchingHorses };
    });

    return new Response(JSON.stringify({
      success: true,
      suggestions: [],
      liveRaces: liveRaces || [],
      raceMatches: raceMatches,
      totalHorses: horses?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in breeding-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});