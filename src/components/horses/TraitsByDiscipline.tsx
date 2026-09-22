import { Badge } from "@/components/ui/badge";
import { TraitBadge } from "./TraitBadge";
import { TRAIT_DISCIPLINES } from "@/utils/traitMetadata";

interface TraitsByDisciplineProps {
  traits: Array<{ trait_name: string; trait_value?: string }>;
  allTraitNames: string[];
  horseBreeding?: Array<{percentage: number, breeds: {name: string}}>;
}

// Trait categorization based on official guide
const TRAIT_CATEGORIES = TRAIT_DISCIPLINES;

const CATEGORY_LABELS = {
  universal: "🌟 All Disciplines",
  flatRacing: "🏁 Flat Racing",
  steeplechase: "🦘 Steeplechase", 
  crossCountry: "🌄 Cross Country",
  multiDiscipline: "🎯 Multi-Discipline",
  surfacePreference: "🌍 Surface Preference",
  distancePreference: "📏 Distance Preference",
  special: "✨ Special"
};

const categorizeTraits = (traits: Array<{ trait_name: string; trait_value?: string }>) => {
  const categorized: Record<string, Array<{ trait_name: string; trait_value?: string }>> = {};
  
  traits.forEach(trait => {
    let category = 'special'; // default category
    
    for (const [cat, traitList] of Object.entries(TRAIT_CATEGORIES)) {
      if (traitList.includes(trait.trait_name)) {
        category = cat;
        break;
      }
    }
    
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(trait);
  });
  
  return categorized;
};

export const TraitsByDiscipline = ({ traits, allTraitNames, horseBreeding }: TraitsByDisciplineProps) => {
  if (!traits || traits.length === 0) {
    return null;
  }

  const categorizedTraits = categorizeTraits(traits);
  
  // Order categories by importance
  const categoryOrder = [
    'universal',
    'flatRacing', 
    'steeplechase',
    'crossCountry',
    'multiDiscipline',
    'surfacePreference',
    'distancePreference',
    'special'
  ];

  return (
    <div className="space-y-3">
      {categoryOrder.map(category => {
        const categoryTraits = categorizedTraits[category];
        if (!categoryTraits || categoryTraits.length === 0) return null;
        
        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ({categoryTraits.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {categoryTraits.map((trait, idx) => (
                <TraitBadge 
                  key={`${category}-${idx}`}
                  traitName={trait.trait_name}
                  allTraits={allTraitNames}
                  horseBreeding={horseBreeding}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};